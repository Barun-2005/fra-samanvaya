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
 * UPGRADED: Now returns per-field confidence scores
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
Analyze this document image and extract structured data with PER-FIELD CONFIDENCE SCORES.

Rules:
1. Extract strict JSON matching this schema:
{
  "documentType": { "value": "string (e.g., Claim Form, Aadhaar, Pahan Receipt)", "confidence": 0.95 },
  "extractedData": {
    "claimantName": { "value": "string", "confidence": 0.95 },
    "guardianName": { "value": "string", "confidence": 0.88 }, 
    "village": { "value": "string", "confidence": 0.92 },
    "district": { "value": "string", "confidence": 0.90 },
    "surveyNumber": { "value": "string", "confidence": 0.85 },
    "aadhaarNumber": { "value": "string (masked: XXXX-XXXX-1234)", "confidence": 0.98 },
    "landArea": { "value": { "amount": 2.5, "unit": "hectares" }, "confidence": 0.82 },
    "dateOfBirth": { "value": "YYYY-MM-DD", "confidence": 0.75 },
    "caste": { "value": "string", "confidence": 0.88 },
    "tribalStatus": { "value": "ST/OTFD/None", "confidence": 0.92 }
  },
  "anomalies": ["array of strings for contradictions or unclear fields"],
  "fieldsNeedingReview": ["array of field names with confidence < 0.70"],
  "overallConfidence": 0.88,
  "handwrittenFields": ["array of field names that are handwritten"],
  "extractionNotes": "Any special observations about document quality"
}

2. Confidence scoring guide:
   - 0.90-1.00: Crystal clear, printed text
   - 0.70-0.89: Readable but minor issues (slight blur, faded)
   - 0.50-0.69: Partially readable, may need verification
   - 0.00-0.49: Unclear, handwritten, or damaged - mark as UNCLEAR

3. If a field is handwritten and unclear, set value as "UNCLEAR" with confidence < 0.50
4. If data is contradictory (e.g. Age vs DOB mismatch), add to 'anomalies' array
5. Be precise with Survey Numbers, Aadhaar (mask first 8 digits), and Names
6. Add any field with confidence < 0.70 to 'fieldsNeedingReview' array
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
        const parsed = JSON.parse(responseText);

        // Post-process: Calculate fields needing review if not provided
        if (!parsed.fieldsNeedingReview) {
            parsed.fieldsNeedingReview = [];
            if (parsed.extractedData) {
                for (const [field, data] of Object.entries(parsed.extractedData)) {
                    if (data && typeof data === 'object' && data.confidence < 0.70) {
                        parsed.fieldsNeedingReview.push(field);
                    }
                }
            }
        }

        // Calculate overall confidence if not provided
        if (!parsed.overallConfidence && parsed.extractedData) {
            const confidences = Object.values(parsed.extractedData)
                .filter(d => d && typeof d === 'object' && typeof d.confidence === 'number')
                .map(d => d.confidence);

            if (confidences.length > 0) {
                parsed.overallConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
            }
        }

        return parsed;
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
