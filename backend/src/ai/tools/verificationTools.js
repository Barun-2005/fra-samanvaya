const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const Claim = require("../../models/Claim");

const fetchClaimAssetsTool = new DynamicStructuredTool({
    name: "fetch_claim_assets",
    description: "Fetches the official asset records for a claim (e.g., land size, trees, water bodies). Use this to compare against field photos.",
    schema: z.object({
        claimId: z.string().describe("The Claim ID to fetch assets for"),
    }),
    func: async ({ claimId }) => {
        try {
            const claim = await Claim.findById(claimId);
            if (!claim) return "Claim not found.";

            return JSON.stringify({
                claimant: claim.claimantName,
                village: claim.village,
                landClaimed: `${claim.landSizeClaimed} acres`,
                assetSummary: claim.assetSummary || "No asset summary available.",
                geoBoundary: claim.boundaryArea ? `${claim.boundaryArea} sq meters` : "No boundary mapped."
            });
        } catch (error) {
            return "Error fetching assets: " + error.message;
        }
    },
});

module.exports = {
    fetchClaimAssetsTool
};
