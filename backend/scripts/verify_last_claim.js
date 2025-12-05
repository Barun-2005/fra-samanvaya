require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Claim = require('../src/models/Claim');

async function checkLastClaim() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // Find the most recently updated claim
        const claim = await Claim.findOne().sort({ updatedAt: -1 });

        if (!claim) {
            console.log("No claims found.");
        } else {
            console.log("\n=== LAST UPDATED CLAIM ===");
            console.log("ID:", claim._id);
            console.log("Claimant:", claim.claimantName);
            console.log("Status:", claim.status);
            console.log("--- Verification Report ---");
            if (claim.verificationReport) {
                console.log("Sync Status:", claim.verificationReport.syncStatus);
                console.log("Match Score:", claim.verificationReport.matchScore);
                console.log("AI Analysis:", claim.verificationReport.aiAnalysis.substring(0, 100) + "...");
                console.log("Site Photo URL:", claim.verificationReport.sitePhotoUrl);
                console.log("Satellite URL:", claim.verificationReport.satelliteSnapshotUrl);
            } else {
                console.log("NO VERIFICATION REPORT FOUND");
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkLastClaim();
