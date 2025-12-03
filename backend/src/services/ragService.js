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
            similarClaims = await Claim.find({
                reasonForClaim: { $regex: claimText.split(' ')[0], $options: 'i' }
            }).limit(3);
        }

        return similarClaims;

    } catch (error) {
        console.error("Error finding similar claims:", error);
        throw error;
    }
};

module.exports = {
    ingestDocument,
    queryKnowledgeBase,
    findSimilarClaims
};
