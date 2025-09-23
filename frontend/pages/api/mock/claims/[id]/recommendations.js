// pages/api/mock/claims/[id]/recommendations.js
export default function handler(req, res) {
    const recommendations = {
      summary: "Based on the provided documents and historical data, the claim has a high probability of being valid. The land parcel appears to be correctly mapped.",
      confidenceScore: 0.92,
      recommendedAction: "Approve",
      warnings: [],
    };
    res.status(200).json(recommendations);
}