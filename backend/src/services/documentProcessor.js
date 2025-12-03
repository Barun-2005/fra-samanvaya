const sharp = require('sharp');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Document = require('../models/Document');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Tier 1: Document Normalization Engine
 */
async function preProcessImage(buffer) {
    try {
        return await sharp(buffer)
            .resize({ width: 2000, withoutEnlargement: true })
            .rotate() // Auto-rotate
            .grayscale() // Remove color noise
            .normalize() // Enhance contrast
            .toBuffer();
    } catch (error) {
        console.error('Image normalization failed:', error);
        return buffer;
    }
}

/**
 * Tier 2: Duplicate Fingerprinting & Check
 */
async function checkDuplicate(buffer) {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    const existingDoc = await Document.findOne({ fileFingerprint: hash });
    if (existingDoc) {
        const error = new Error('Duplicate Document Detected');
        error.code = 'DUPLICATE_DOCUMENT';
        error.existingDocId = existingDoc._id;
        throw error;
    }

    return hash;
}

/**
 * Tier 3: Smart Extraction (Gemini 2.5 Flash - Native SDK)
 */
async function extractSmartData(buffer, mimeType) {
    const base64Image = buffer.toString('base64');

    const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL_FAST || "gemini-2.5-flash",
        generationConfig: {
            temperature: 0,
            responseMimeType: "application/json"
        }
    });

    const prompt = `
You are a Government Data Extraction Specialist. 
Analyze this document image and extract structured data.

Rules:
1. Extract strict JSON matching this schema:
{
  "documentType": "string (e.g., Claim Form, Aadhaar, Pahan Receipt)",
  "confidence": "number (0-1)",
  "extractedData": {
    "claimantName": "string",
    "guardianName": "string", 
    "village": "string",
    "surveyNumber": "string",
    "landArea": { "value": "number", "unit": "string" }
  },
  "anomalies": ["array of strings for contradictions or unclear fields"]
}
2. If a field is handwritten and unclear, mark it as 'UNCLEAR' or omit it.
3. If data is contradictory (e.g. Age vs DOB), add a note to the 'anomalies' array.
4. Be precise with Survey Numbers and Names.
`;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            }
        ]);

        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (error) {
        console.error("Gemini Extraction Failed:", error);
        throw new Error("AI Extraction Failed: " + error.message);
    }
}

/**
 * Main Pipeline Orchestrator
 */
async function processDocument(file) {
    console.log(`Processing document: ${file.originalname || 'buffer'}`);

    const fs = require('fs');
    const rawBuffer = file.path ? fs.readFileSync(file.path) : file.buffer;

    // Tier 2: Check Duplicate (on raw file)
    const fingerprint = await checkDuplicate(rawBuffer);

    // Tier 1: Normalize
    const cleanBuffer = await preProcessImage(rawBuffer);

    // Tier 3: Extract
    const extractionResult = await extractSmartData(cleanBuffer, file.mimetype);

    return {
        fingerprint,
        cleanBuffer,
        extractionResult
    };
}

module.exports = {
    processDocument,
    preProcessImage,
    checkDuplicate,
    extractSmartData
};
