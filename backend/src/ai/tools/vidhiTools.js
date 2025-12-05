const { GoogleGenerativeAI } = require("@google/generative-ai");
const ragService = require("../../services/ragService");
const Claim = require("../../models/Claim");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const vidhiTools = {
    /**
     * Search for similar past claims to use as precedents.
     * @param {String} query - The search query (e.g., "grazing rights in protected area").
     * @returns {Promise<Array>} - List of similar claims.
     */
    searchPrecedents: async (query) => {
        try {
            console.log(`[Vidhi] Searching precedents for: ${query}`);
            const results = await ragService.findSimilarClaims(query);
            return results.map(r => ({
                claimant: r.claimantName,
                village: r.village,
                type: r.claimType,
                reason: r.reasonForClaim,
                status: r.status,
                similarity: r.score
            }));
        } catch (error) {
            console.error("Vidhi Precedent Search Failed:", error);
            return [];
        }
    },

    /**
     * Fetch specific laws or sections from the FRA 2006 knowledge base.
     * @param {String} query - The legal question or section number.
     * @returns {Promise<String>} - The relevant legal text.
     */
    fetchLaws: async (query) => {
        try {
            console.log(`[Vidhi] Fetching laws for: ${query}`);
            const result = await ragService.queryKnowledgeBase(query, "You are Vidhi, a legal expert on the Forest Rights Act 2006.");
            return result.answer;
        } catch (error) {
            console.error("Vidhi Law Fetch Failed:", error);
            return "Unable to retrieve legal database at this moment.";
        }
    },

    /**
     * Draft a formal legal order in English and Vernacular (Hindi/Odia).
     * @param {String} claimId - The ID of the claim.
     * @param {String} verdict - 'Approved' or 'Rejected'.
     * @param {String} reasoning - The reasoning for the verdict.
     * @returns {Promise<Object>} - The drafted order in both languages.
     */
    draftOrder: async (claimId, verdict, reasoning) => {
        try {
            const claim = await Claim.findById(claimId).populate('claimant');
            if (!claim) throw new Error("Claim not found");

            const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

            const prompt = `
        You are Vidhi, the Governance AI.
        Draft a formal legal order for the following Forest Rights Act claim.

        **Claim Details:**
        - ID: ${claim._id}
        - Claimant: ${claim.claimantName}
        - Village: ${claim.village}
        - Type: ${claim.claimType}
        - Land Size: ${claim.landSizeClaimed} acres

        **Verdict:** ${verdict.toUpperCase()}
        **Reasoning:** ${reasoning}

        **Requirements:**
        1. **English Version:** Formal legal language, citing FRA 2006. Structure: "Order", "Facts", "Decision".
        2. **Vernacular Version (Hindi/Odia):** Simple, accessible language for the tribal claimant. Translate the core decision and reason.

        **Output JSON:**
        {
          "englishOrder": "Markdown text...",
          "vernacularOrder": "Markdown text in Hindi..."
        }
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean JSON
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);

        } catch (error) {
            console.error("Vidhi Draft Order Failed:", error);
            return {
                englishOrder: "Drafting failed. Please try again.",
                vernacularOrder: "Drafting failed."
            };
        }
    }
}


// --- TOOL DEFINITIONS ---
const vidhiToolDefinitions = [
    {
        name: "search_precedents",
        description: "Search for similar past claims to use as precedents for legal reasoning.",
        parameters: {
            type: "object",
            properties: {
                query: { type: "string", description: "Search query describing the current case context." }
            },
            required: ["query"]
        }
    },
    {
        name: "fetch_laws",
        description: "Fetch specific sections of FRA 2006 or legal guidelines.",
        parameters: {
            type: "object",
            properties: {
                query: { type: "string", description: "The legal question or section number." }
            },
            required: ["query"]
        }
    },
    {
        name: "draft_order",
        description: "Draft a formal legal order (Approved/Rejected) for a claim.",
        parameters: {
            type: "object",
            properties: {
                claimId: { type: "string", description: "The ID of the claim to draft the order for." },
                verdict: { type: "string", enum: ["Approved", "Rejected"] },
                reasoning: { type: "string", description: "The legal reasoning for the verdict." }
            },
            required: ["claimId", "verdict", "reasoning"]
        }
    }
];

// --- EXECUTION ROUTER ---
async function executeVidhiTool(functionCall) {
    const { name, args } = functionCall;
    switch (name) {
        case 'search_precedents':
            return JSON.stringify(await vidhiTools.searchPrecedents(args.query));
        case 'fetch_laws':
            return await vidhiTools.fetchLaws(args.query);
        case 'draft_order':
            return JSON.stringify(await vidhiTools.draftOrder(args.claimId, args.verdict, args.reasoning));
        default:
            return JSON.stringify({ error: 'Unknown function' });
    }
}

module.exports = {
    vidhiTools,
    vidhiToolDefinitions,
    executeVidhiTool
};
