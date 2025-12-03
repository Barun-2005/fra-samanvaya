const { processDocument } = require('../../services/documentProcessor');
const Scheme = require('../../models/Scheme');

// --- TOOL IMPLEMENTATIONS ---

// Tool 1: Structural OCR for Data Entry
async function extractClaimDataTool(fileBuffer, mimeType) {
    try {
        const result = await processDocument({ buffer: fileBuffer, mimetype: mimeType });
        return JSON.stringify(result.extractionResult);
    } catch (error) {
        return JSON.stringify({ error: error.message });
    }
}

// Tool 2: Search Schemes
async function searchSchemesTool(query, category) {
    try {
        const filter = {};
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        if (category) filter.category = category;

        const schemes = await Scheme.find(filter).limit(5);
        return JSON.stringify(schemes.map(s => ({
            name: s.name,
            description: s.description,
            benefits: s.benefits
        })));
    } catch (error) {
        return JSON.stringify({ error: error.message });
    }
}

// Tool 3: Translate Status
async function translateStatusTool(statusText, language) {
    const translations = {
        'Pending at DLC': {
            'hi': 'आपकी फ़ाइल जिला कलेक्टर के पास है, चिंता न करें।',
            'or': 'ଆପଣଙ୍କ ଫାଇଲ୍ ଜିଲ୍ଲା କଲେକ୍ଟରଙ୍କ ପାଖରେ ଅଛି।'
        }
    };

    return JSON.stringify({
        original: statusText,
        translated: translations[statusText]?.[language] || statusText,
        language: language
    });
}

// Tool 4: Lookup Claim Status
async function lookupClaimStatusTool(claimId) {
    try {
        let claim;
        const mongoose = require('mongoose');

        if (mongoose.Types.ObjectId.isValid(claimId)) {
            claim = await require('../../models/Claim').findById(claimId);
        }

        if (!claim) {
            const allClaims = await require('../../models/Claim').find({});
            claim = allClaims.find(c => c._id.toString().endsWith(claimId) || c._id.toString() === claimId);
        }

        if (claim) {
            return JSON.stringify({
                claimId: claim._id,
                status: claim.status,
                claimantName: claim.claimantName,
                village: claim.village,
                dateSubmitted: claim.dateSubmitted,
                details: `Your claim for ${claim.claimantName} in ${claim.village} is currently ${claim.status}.`
            });
        } else {
            return JSON.stringify({ error: `Claim with ID '${claimId}' not found. Please double-check the ID.` });
        }
    } catch (error) {
        return JSON.stringify({ error: `Database error: ${error.message}` });
    }
}

// Tool 5: Validate Claim Data (Data Entry Role)
async function validateClaimDataTool(claimData) {
    const issues = [];
    if (!claimData.claimantName) issues.push("Claimant Name is missing.");
    if (!claimData.village) issues.push("Village is missing.");
    if (claimData.age && claimData.age < 18) issues.push("Claimant must be 18+.");

    if (issues.length > 0) {
        return JSON.stringify({ valid: false, issues: issues });
    }
    return JSON.stringify({ valid: true, message: "Data looks good. Ready for submission." });
}

// Tool 6: Get Statistics (NGO Role)
async function getStatsTool(region, metric) {
    const stats = {
        "Odisha": { "rejectionRate": "32%", "pending": 120, "approved": 850 },
        "Jharkhand": { "rejectionRate": "28%", "pending": 95, "approved": 600 }
    };

    const regionStats = stats[region] || stats["Odisha"];
    return JSON.stringify({
        region: region,
        stats: regionStats,
        insight: `In ${region}, the rejection rate is ${regionStats.rejectionRate}. Most rejections are due to missing Gram Sabha resolutions.`
    });
}

// --- TOOL DECLARATIONS BY ROLE ---

const citizenTools = [
    {
        name: "search_schemes",
        description: "Searches government schemes based on user query and category.",
        parameters: {
            type: "object",
            properties: {
                query: { type: "string" },
                category: { type: "string" }
            },
            required: ["query"]
        }
    },
    {
        name: "translate_status",
        description: "Translates technical status into simple vernacular language.",
        parameters: {
            type: "object",
            properties: {
                statusText: { type: "string" },
                language: { type: "string", enum: ["hi", "or", "en"] }
            },
            required: ["statusText", "language"]
        }
    },
    {
        name: "lookup_claim_status",
        description: "Checks the status of a specific claim ID.",
        parameters: {
            type: "object",
            properties: {
                claimId: { type: "string" }
            },
            required: ["claimId"]
        }
    }
];

const dataEntryTools = [
    {
        name: "validate_claim",
        description: "Validates claim data for errors. Use this for Data Entry Operators.",
        parameters: {
            type: "object",
            properties: {
                claimantName: { type: "string" },
                village: { type: "string" },
                age: { type: "number" }
            },
            required: ["claimantName"]
        }
    },
    {
        name: "lookup_claim_status",
        description: "Checks the status of a specific claim ID.",
        parameters: {
            type: "object",
            properties: {
                claimId: { type: "string" }
            },
            required: ["claimId"]
        }
    }
];

const ngoTools = [
    {
        name: "get_stats",
        description: "Retrieves statistics for a region. Use this for NGO members.",
        parameters: {
            type: "object",
            properties: {
                region: { type: "string" },
                metric: { type: "string" }
            },
            required: ["region"]
        }
    },
    {
        name: "lookup_claim_status",
        description: "Checks the status of a specific claim ID.",
        parameters: {
            type: "object",
            properties: {
                claimId: { type: "string" }
            },
            required: ["claimId"]
        }
    }
];

// --- FUNCTION ROUTER ---

async function executeMitraTool(functionCall) {
    const { name, args } = functionCall;

    switch (name) {
        case 'search_schemes':
            return await searchSchemesTool(args.query, args.category);
        case 'translate_status':
            return await translateStatusTool(args.statusText, args.language);
        case 'lookup_claim_status':
            return await lookupClaimStatusTool(args.claimId);
        case 'validate_claim':
            return await validateClaimDataTool(args);
        case 'get_stats':
            return await getStatsTool(args.region, args.metric);
        default:
            return JSON.stringify({ error: 'Unknown function' });
    }
}

module.exports = {
    citizenTools,
    dataEntryTools,
    ngoTools,
    executeMitraTool,
    extractClaimDataTool
};
