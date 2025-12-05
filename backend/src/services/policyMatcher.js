const { GoogleGenerativeAI } = require('@google/generative-ai');
const Scheme = require('../models/Scheme');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * DA-JGUA Convergence Policy Matcher
 * Matches approved FRA claims to statutory welfare schemes
 */

/**
 * Get eligible schemes from database based on claim data
 * @param {Object} claim - Approved claim with Title_Issued status
 * @returns {Promise<Array>} List of eligible schemes
 */
exports.getEligibleSchemes = async (claim) => {
    try {
        // Fetch all active DA-JGUA schemes
        const schemes = await Scheme.find({
            status: 'Active',
            convergenceType: 'DA-JGUA'
        });

        const eligible = [];

        for (const scheme of schemes) {
            let isEligible = true;

            for (const rule of scheme.rules || []) {
                const { criteria, operator, value } = rule;
                let checkPassed = false;

                switch (criteria) {
                    case 'hasApprovedClaim':
                        checkPassed = ['Approved', 'Title_Issued'].includes(claim.status);
                        break;
                    case 'claimType':
                        checkPassed = operator === '=='
                            ? claim.claimType === value
                            : (operator === 'in' ? value.includes(claim.claimType) : false);
                        break;
                    case 'landSizeClaimed':
                        checkPassed = operator === '>'
                            ? (claim.landSizeClaimed || 0) > value
                            : (operator === '<=' ? (claim.landSizeClaimed || 0) <= value : false);
                        break;
                    case 'village':
                        checkPassed = !!claim.village;
                        break;
                    case 'hasNoHousing':
                        // Default to true since we don't track housing
                        checkPassed = true;
                        break;
                    case 'hasChildren':
                        // Default to true since we don't track dependents
                        checkPassed = true;
                        break;
                    default:
                        checkPassed = true;
                }

                if (rule.logicalOp === 'AND' && !checkPassed) {
                    isEligible = false;
                    break;
                }
            }

            if (isEligible) {
                eligible.push({
                    schemeId: scheme._id,
                    schemeName: scheme.name,
                    category: scheme.category,
                    benefits: scheme.benefits,
                    budget: scheme.budget,
                    description: scheme.description
                });
            }
        }

        return eligible;
    } catch (error) {
        console.error("Error matching DA-JGUA schemes:", error);
        return [];
    }
};

/**
 * Match schemes to a village based on demographics and land data (AI-powered)
 * @param {Object} villageData 
 * @returns {Promise<Array>} List of recommended schemes
 */
exports.matchSchemes = async (villageData) => {
    try {
        const prompt = `
        You are a DA-JGUA (Dharti Aaba Janjatiya Gram Utkarsh Abhiyan) policy expert.
        Based on the following village data, recommend the most suitable government schemes for tribal development.
        
        PRIORITIZE these DA-JGUA convergence schemes:
        1. PMAY-G (Housing) - ₹1.20 Lakh for BPL families
        2. MGNREGA (Land Development) - 100 days guaranteed work
        3. Jal Jeevan Mission - Piped water connection
        4. Van Dhan Vikas Yojana - MFP value addition
        5. PM-KISAN - ₹6,000/year income support
        6. Eklavya Schools - Residential education
        7. Ayushman Bharat - ₹5 Lakh health coverage
        
        Village Data:
        - Name: ${villageData.name}
        - District: ${villageData.district}
        - Total Claims Approved: ${villageData.approvedClaims}
        - Total Land Recognized: ${villageData.totalLand} hectares
        - Primary Land Use: ${villageData.landUse || 'Mixed Agriculture/Forest'}
        
        Return EXACTLY 3 schemes as JSON array:
        [
            {
                "schemeName": "Full scheme name",
                "relevanceScore": 95,
                "reason": "Why this village qualifies",
                "benefits": "Key benefits for this village",
                "nextSteps": "How to apply/access"
            }
        ]
        Return only JSON, no markdown.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up markdown if present
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error matching schemes:", error);
        return [];
    }
};

/**
 * Auto-recommend schemes when claim reaches Title_Issued
 * @param {Object} claim 
 * @returns {Promise<Array>} List of eligible scheme names
 */
exports.autoRecommendOnApproval = async (claim) => {
    if (claim.status !== 'Title_Issued' && claim.status !== 'Approved') {
        return [];
    }

    const eligibleSchemes = await exports.getEligibleSchemes(claim);
    return eligibleSchemes.map(s => s.schemeName);
};
