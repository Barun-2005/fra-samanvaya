const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Claim = require('../src/models/Claim');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

const generateEmbedding = async (text) => {
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        return null;
    }
};

const migrateClaims = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('MONGO_URI missing');
            process.exit(1);
        }
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const claims = await Claim.find({}); // Force update all claims
        console.log(`Found ${claims.length} claims needing embeddings.`);

        for (const claim of claims) {
            // Construct text representation
            const textToEmbed = `
                Claimant: ${claim.claimantName || 'Unknown'}
                Village: ${claim.village || 'Unknown'}
                Reason: ${claim.reasonForClaim || 'No reason provided'}
                Type: ${claim.claimType}
            `.trim();

            console.log(`Generating embedding for Claim ID: ${claim._id}...`);
            const vector = await generateEmbedding(textToEmbed);

            if (vector) {
                claim.embedding = vector;
                await claim.save();
                console.log(`✅ Updated Claim ${claim._id}`);
            } else {
                console.error(`❌ Failed to generate embedding for Claim ${claim._id}`);
            }

            // Rate limit protection (simple delay)
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('Migration complete.');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateClaims();
