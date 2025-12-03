const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const ragService = require("../../services/ragService");
const Claim = require("../../models/Claim");

const searchLawsTool = new DynamicStructuredTool({
    name: "search_laws",
    description: "Searches the Forest Rights Act (FRA) and PESA Act for legal sections and rules. Use this to answer questions about rights, eligibility, and legal processes.",
    schema: z.object({
        query: z.string().describe("The legal question or topic to search for, e.g., 'rights of OTFDs' or 'Section 3(1)'"),
    }),
    func: async ({ query }) => {
        try {
            const result = await ragService.queryKnowledgeBase(query, "You are a legal assistant.");
            return `Answer based on Laws:\n${result.answer}\n\nSources: ${result.sources.join(", ")}`;
        } catch (error) {
            return "Error searching laws: " + error.message;
        }
    },
});

const lookupClaimTool = new DynamicStructuredTool({
    name: "lookup_claim",
    description: "Looks up a specific claim by Claim ID or Claimant Name. Use this to find details about a specific application.",
    schema: z.object({
        identifier: z.string().describe("The Claim ID (e.g., '64f...') or Claimant Name"),
        type: z.enum(["id", "name"]).describe("Whether the identifier is an 'id' or 'name'"),
    }),
    func: async ({ identifier, type }) => {
        try {
            let claim;
            if (type === "id") {
                claim = await Claim.findById(identifier);
            } else {
                claim = await Claim.findOne({ claimantName: { $regex: identifier, $options: 'i' } });
            }

            if (!claim) {
                return "No claim found with that identifier.";
            }

            return JSON.stringify({
                id: claim._id,
                claimant: claim.claimantName,
                status: claim.status,
                village: claim.village,
                landClaimed: claim.landSizeClaimed,
                surveyNumber: claim.surveyNumber,
                veracityScore: claim.veracityScore,
                anomalies: claim.anomalies || []
            });
        } catch (error) {
            return "Error looking up claim: " + error.message;
        }
    },
});

module.exports = {
    searchLawsTool,
    lookupClaimTool
};
