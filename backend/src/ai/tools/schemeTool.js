const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const Scheme = require("../../models/Scheme");

const schemeTool = new DynamicStructuredTool({
    name: "search_schemes",
    description: "Searches for government schemes based on a query and optional user profile criteria. Use this to find benefits for citizens.",
    schema: z.object({
        query: z.string().describe("The search query, e.g., 'farmers in odisha' or 'housing benefits'"),
        category: z.string().optional().describe("Optional category filter like 'Agriculture', 'Housing', 'Health'"),
    }),
    func: async ({ query, category }) => {
        try {
            const filter = {};

            // Basic text search simulation (since we might not have full text index yet)
            // In production, use Atlas Search. Here we use regex for MVP.
            if (query) {
                filter.$or = [
                    { name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ];
            }

            if (category) {
                filter.category = category;
            }

            const schemes = await Scheme.find(filter).limit(5);

            if (schemes.length === 0) {
                return "No specific schemes found matching that query. Suggest contacting the Gram Sabha.";
            }

            return JSON.stringify(schemes.map(s => ({
                name: s.name,
                description: s.description,
                benefits: s.benefits,
                eligibility: s.rules
            })));
        } catch (error) {
            return "Error searching schemes: " + error.message;
        }
    },
});

module.exports = schemeTool;
