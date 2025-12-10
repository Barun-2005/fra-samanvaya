const { GoogleGenerativeAI } = require('@google/generative-ai');
const KnowledgeBase = require('../models/KnowledgeBase');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

/**
 * Generate embedding for a text string
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
const generateEmbedding = async (text) => {
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
};

/**
 * Ingest a document (text) into the knowledge base
 * @param {string} title 
 * @param {string} content 
 * @param {string} source 
 * @param {string} category 
 */
const ingestDocument = async (title, content, source, category = "General") => {
    try {
        // 1. Chunk the content (Simple chunking for now, e.g., by paragraphs or max chars)
        // For simplicity, we'll assume content is passed in reasonable chunks or we split by double newline
        const chunks = content.split('\n\n').filter(chunk => chunk.trim().length > 0);

        console.log(`Ingesting ${chunks.length} chunks for ${title}...`);

        for (const chunk of chunks) {
            // 2. Generate embedding
            const embedding = await generateEmbedding(chunk);

            // 3. Save to MongoDB
            await KnowledgeBase.create({
                title,
                content: chunk,
                source,
                category,
                embedding
            });
        }
        console.log(`Successfully ingested ${title}`);
        return { success: true, chunks: chunks.length };
    } catch (error) {
        console.error("Error ingesting document:", error);
        throw error;
    }
};

/**
 * Query the knowledge base and answer a question
 * @param {string} query 
 * @param {string} roleContext - e.g., "You are a legal assistant helping a verification officer."
 */
const queryKnowledgeBase = async (query, roleContext = "You are a helpful assistant.") => {
    try {
        // 1. Embed the query
        const queryEmbedding = await generateEmbedding(query);

        // 2. Vector Search in MongoDB
        // Note: This requires an Atlas Vector Search Index to be configured on the 'embedding' field.
        // Since we can't configure Atlas via code, we'll simulate a basic cosine similarity search in-memory if the dataset is small,
        // OR use the aggregation pipeline if the index exists.
        // For this MVP, we will try the aggregation pipeline. If it fails (no index), we might need a fallback.

        const pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index", // User needs to create this index in Atlas
                    "path": "embedding",
                    "queryVector": queryEmbedding,
                    "numCandidates": 100,
                    "limit": 5
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "content": 1,
                    "source": 1,
                    "score": { "$meta": "vectorSearchScore" }
                }
            }
        ];

        let relevantDocs = [];
        try {
            relevantDocs = await KnowledgeBase.aggregate(pipeline);
        } catch (err) {
            console.warn("Vector search failed (likely missing index). Falling back to basic find (NOT semantic).", err.message);
            // Fallback: Just find documents with matching keywords (very basic)
            relevantDocs = await KnowledgeBase.find({ content: { $regex: query.split(' ')[0], $options: 'i' } }).limit(3);
        }

        // 3. Construct Prompt for Gemini
        const contextText = relevantDocs.map(doc => `[Source: ${doc.source}]\n${doc.content}`).join('\n\n');

        const prompt = `
        ${roleContext}
        
        Use the following context to answer the user's question. If the answer is not in the context, say so, but try to be helpful based on general knowledge if appropriate (but mark it as general knowledge).
        
        Context:
        ${contextText}
        
        User Question: ${query}
        `;

        // 4. Generate Answer
        const result = await chatModel.generateContent(prompt);
        const response = await result.response;

        return {
            answer: response.text(),
            sources: relevantDocs.map(d => d.source)
        };

    } catch (error) {
        console.error("Error querying knowledge base:", error);
        throw error;
    }
};

/**
 * Find similar claims based on vector similarity
 * @param {string} claimText - The text description of the claim to match
 * @returns {Promise<Array>} - List of similar claims with scores
 */
const findSimilarClaims = async (claimText) => {
    try {
        const Claim = require('../models/Claim'); // Lazy load to avoid circular deps

        // 1. Generate embedding for the query text
        const queryEmbedding = await generateEmbedding(claimText);

        // 2. Vector Search on Claims collection
        const pipeline = [
            {
                "$vectorSearch": {
                    "index": "claim_vector_index", // User needs to create this index in Atlas
                    "path": "embedding",
                    "queryVector": queryEmbedding,
                    "numCandidates": 100,
                    "limit": 5
                }
            },
            {
                "$project": {
                    "claimantName": 1,
                    "village": 1,
                    "status": 1,
                    "claimType": 1,
                    "reasonForClaim": 1,
                    "score": { "$meta": "vectorSearchScore" }
                }
            }
        ];

        let similarClaims = [];
        try {
            similarClaims = await Claim.aggregate(pipeline);
        } catch (err) {
            console.warn("Claim vector search failed. Falling back to basic find.", err.message);
            // Fallback: Basic text search if vector index is missing
            // Ensure claimText is safe to split
            const keyword = claimText ? claimText.split(' ')[0] : '';
            if (keyword) {
                similarClaims = await Claim.find({
                    reasonForClaim: { $regex: keyword, $options: 'i' }
                }).limit(3);
            } else {
                // If no text, just return recent approved claims as "similar" examples
                similarClaims = await Claim.find({ status: 'Approved' }).limit(3);
            }
        }

        return similarClaims;

    } catch (error) {
        console.error("Error finding similar claims:", error);
        throw error;
    }
};

/**
 * HYBRID SEARCH (RAG 2.0) - Combines Vector + Keyword Search with RRF
 * Better retrieval for queries that benefit from both semantic and exact matching
 * 
 * @param {string} query - User's search query
 * @param {number} topK - Number of results to return
 * @param {string} roleContext - Context for the AI response
 * @returns {Promise<Object>} - Answer with sources and fusion scores
 */
const hybridSearch = async (query, topK = 5, roleContext = "You are Vidhi, a legal AI assistant for the Forest Rights Act.") => {
    try {
        console.log(`[Hybrid Search] Query: "${query.substring(0, 50)}..."`);

        // 1. VECTOR SEARCH (Semantic)
        let vectorResults = [];
        try {
            const queryEmbedding = await generateEmbedding(query);
            vectorResults = await KnowledgeBase.aggregate([
                {
                    "$vectorSearch": {
                        "index": "vector_index",
                        "path": "embedding",
                        "queryVector": queryEmbedding,
                        "numCandidates": 100,
                        "limit": topK * 2
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "content": 1,
                        "source": 1,
                        "title": 1,
                        "category": 1,
                        "vectorScore": { "$meta": "vectorSearchScore" }
                    }
                }
            ]);
            console.log(`[Hybrid Search] Vector results: ${vectorResults.length}`);
        } catch (err) {
            console.warn("[Hybrid Search] Vector search failed:", err.message);
        }

        // 2. KEYWORD SEARCH (BM25-like using MongoDB text index)
        let keywordResults = [];
        try {
            // Try text search first (requires text index)
            keywordResults = await KnowledgeBase.find(
                { $text: { $search: query } },
                { score: { $meta: "textScore" }, content: 1, source: 1, title: 1, category: 1 }
            ).sort({ score: { $meta: "textScore" } }).limit(topK * 2);
            console.log(`[Hybrid Search] Keyword (text) results: ${keywordResults.length}`);
        } catch (err) {
            // Fallback to regex search if no text index
            console.warn("[Hybrid Search] Text search failed, using regex fallback");
            const keywords = query.split(' ').filter(w => w.length > 3).slice(0, 5);
            const regexPattern = keywords.join('|');
            if (regexPattern) {
                keywordResults = await KnowledgeBase.find({
                    content: { $regex: regexPattern, $options: 'i' }
                }).limit(topK * 2);
            }
            console.log(`[Hybrid Search] Keyword (regex) results: ${keywordResults.length}`);
        }

        // 3. RECIPROCAL RANK FUSION (RRF)
        // RRF formula: score = Σ(1 / (k + rank)) where k is typically 60
        const k = 60; // Standard RRF constant
        const fusedScores = new Map();
        const docContent = new Map();

        // Score from vector results
        vectorResults.forEach((doc, idx) => {
            const id = doc._id.toString();
            fusedScores.set(id, (fusedScores.get(id) || 0) + (1 / (k + idx + 1)));
            docContent.set(id, {
                content: doc.content,
                source: doc.source,
                title: doc.title,
                category: doc.category,
                vectorScore: doc.vectorScore
            });
        });

        // Score from keyword results
        keywordResults.forEach((doc, idx) => {
            const id = doc._id.toString();
            fusedScores.set(id, (fusedScores.get(id) || 0) + (1 / (k + idx + 1)));
            if (!docContent.has(id)) {
                docContent.set(id, {
                    content: doc.content,
                    source: doc.source,
                    title: doc.title,
                    category: doc.category,
                    keywordScore: doc.score
                });
            } else {
                docContent.get(id).keywordScore = doc.score;
            }
        });

        // Sort by fused score and take top K
        const rankedResults = Array.from(fusedScores.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, topK)
            .map(([id, fusedScore]) => ({
                ...docContent.get(id),
                fusedScore,
                id
            }));

        console.log(`[Hybrid Search] After RRF: ${rankedResults.length} unique results`);

        // 4. GENERATE ANSWER with fused context
        const contextText = rankedResults
            .map((doc, idx) => `[${idx + 1}. Source: ${doc.source || 'FRA Document'}]\n${doc.content}`)
            .join('\n\n---\n\n');

        const prompt = `
${roleContext}

You are using HYBRID SEARCH (vector + keyword fusion) to answer this question.
The following excerpts are ranked by relevance using Reciprocal Rank Fusion.

Context:
${contextText}

User Question: ${query}

Instructions:
1. Answer using ONLY the context provided
2. Cite sources using [1], [2], etc. format
3. If the answer isn't in the context, clearly state that
4. Be precise and concise
`;

        const result = await chatModel.generateContent(prompt);
        const answer = result.response.text();

        return {
            answer,
            sources: rankedResults.map(d => ({
                source: d.source,
                title: d.title,
                category: d.category,
                fusedScore: d.fusedScore?.toFixed(4),
                vectorScore: d.vectorScore?.toFixed(4),
                keywordScore: d.keywordScore?.toFixed(2)
            })),
            searchStats: {
                vectorResults: vectorResults.length,
                keywordResults: keywordResults.length,
                fusedResults: rankedResults.length,
                method: 'Hybrid (Vector + Keyword + RRF)'
            }
        };

    } catch (error) {
        console.error("Hybrid search error:", error);
        throw error;
    }
};

/**
 * Create text index for hybrid search (run once)
 * Call this from a setup script if needed
 */
const createTextIndex = async () => {
    try {
        await KnowledgeBase.collection.createIndex(
            { content: "text", title: "text" },
            { name: "kb_text_index", weights: { title: 10, content: 1 } }
        );
        console.log("Text index created successfully");
        return true;
    } catch (error) {
        if (error.code === 85 || error.code === 86) {
            console.log("Text index already exists");
            return true;
        }
        throw error;
    }
};

module.exports = {
    generateEmbedding,
    ingestDocument,
    queryKnowledgeBase,
    findSimilarClaims,
    hybridSearch,
    createTextIndex
};
