const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

/**
 * Analyze a claim for potential risks
 * @param {Object} claim 
 * @returns {Promise<Object>} Risk analysis result
 */
exports.analyzeRisk = async (claim) => {
    const risks = [];
    let riskScore = 0; // 0-100 (Higher is riskier)

    // Rule 1: Land Size Check (> 4 Hectares is illegal under FRA)
    const landSize = parseFloat(claim.landSizeClaimed || 0);
    if (landSize > 4) {
        risks.push({
            severity: 'CRITICAL',
            message: `Claimed area (${landSize} ha) exceeds the statutory limit of 4 hectares.`
        });
        riskScore += 100;
    } else if (landSize > 3.5) {
        risks.push({
            severity: 'HIGH',
            message: `Claimed area (${landSize} ha) is very close to the 4ha limit.`
        });
        riskScore += 60;
    }

    // Rule 2: Evidence Check
    if (!claim.documents || claim.documents.length === 0) {
        risks.push({
            severity: 'HIGH',
            message: 'No supporting documents uploaded.'
        });
        riskScore += 50;
    } else if (claim.documents.length < 2) {
        risks.push({
            severity: 'MEDIUM',
            message: 'Weak evidence: Only 1 document provided.'
        });
        riskScore += 20;
    }

    // Rule 3: AI Veracity Check (if available)
    if (claim.assetSummary) {
        // Assuming assetSummary is a string or object from Gemini
        const summaryStr = JSON.stringify(claim.assetSummary).toLowerCase();
        if (summaryStr.includes('forest cover < 10%') || summaryStr.includes('no cultivation')) {
            risks.push({
                severity: 'MEDIUM',
                message: 'Satellite analysis does not show significant cultivation/habitation.'
            });
            riskScore += 30;
        }
    }

    // Cap score at 100
    riskScore = Math.min(riskScore, 100);

    return {
        score: riskScore,
        level: riskScore > 70 ? 'CRITICAL' : riskScore > 40 ? 'HIGH' : riskScore > 20 ? 'MEDIUM' : 'LOW',
        flags: risks
    };
};

/**
 * Generate a draft Title Deed (Patta)
 * @param {Object} claim 
 * @returns {Promise<String>} Draft Patta text
 */
exports.generatePatta = async (claim) => {
    try {
        const prompt = `
        You are a legal officer drafting a formal Title Deed (Patta) under the Forest Rights Act, 2006.
        
        Generate a formal "Certificate of Title" for the following claim:
        - Claimant: ${claim.claimantName}
        - Father/Spouse: ${claim.fatherName || '[Father Name]'}
        - Village: ${claim.village}
        - District: ${claim.district}
        - Survey Number: ${claim.surveyNumber || '[Survey No]'}
        - Area: ${claim.landSizeClaimed} hectares
        - Nature of Right: ${claim.claimType}
        
        The document should be in legal language, referencing the Act, and include placeholders for signatures of the DLC (District Level Committee).
        Format it as Markdown.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error generating Patta:", error);
        return "Error generating draft order. Please draft manually.";
    }
};
