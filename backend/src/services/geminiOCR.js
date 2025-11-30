const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key-for-development");

/**
 * Extract claim data from document using Gemini Vision API
 * @param {Buffer} fileBuffer - File buffer (image or PDF)
 * @param {string} mimeType - MIME type of file
 * @returns {Promise<Object>} Extracted structured data
 */
async function extractClaimData(fileBuffer, mimeType) {
    try {
        // For development/testing, return mock data if no API key
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "mock-key-for-development") {
            console.warn('[Gemini OCR] No API key found, returning mock data');
            return getMockExtractedData();
        }

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        // Convert buffer to base64
        const base64Data = fileBuffer.toString('base64');

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        };

        const prompt = `
You are an AI assistant helping to extract information from land claim documents.
Analyze this document (could be an Aadhar card, land document, or property paper) and extract the following information in JSON format:

{
  "claimantName": "Full name of the claimant",
  "aadhaarNumber": "12-digit Aadhaar number if visible",
  "village": "Village name if mentioned",
  "landSizeClaimed": "Land size in hectares (number only)",
  "surveyNumber": "Survey/Khasra number if mentioned",
  "claimType": "Individual or Community",
  "coordinates": { "latitude": number, "longitude": number },
  "confidence": 0.0 to 1.0
}

If any field is not found, use null. Be accurate and conservative with confidence scores.
Return ONLY the JSON object, no other text.
`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const extractedData = JSON.parse(jsonMatch[0]);
            return extractedData;
        } else {
            throw new Error('No JSON found in response');
        }

    } catch (error) {
        console.error('[Gemini OCR] Error:', error.message);

        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(__dirname, '../../ocr_error.log');
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] OCR Error: ${error.message}\nStack: ${error.stack}\n\n`);
        } catch (e) {
            console.error('Failed to write to log file:', e);
        }

        // Only fallback if we are explicitly in mock mode
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "mock-key-for-development") {
            return getMockExtractedData();
        }

        // Otherwise throw the error so the frontend knows something went wrong
        throw new Error('OCR Processing Failed: ' + error.message);
    }
}

/**
 * Return mock extracted data for development/testing
 */
function getMockExtractedData() {
    return {
        claimantName: "Rajesh Kumar",
        aadhaarNumber: "123456789012",
        village: "Rampur",
        landSizeClaimed: 2.5,
        surveyNumber: "Survey-" + Math.floor(Math.random() * 1000),
        claimType: "Individual",
        coordinates: null,
        confidence: 0.75
    };
}

module.exports = {
    extractClaimData,
    getMockExtractedData
};
