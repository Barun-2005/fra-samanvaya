/**
 * DA-JGUA Convergence Schemes Seeder
 * Seeds statutory welfare schemes for post-approval convergence
 * 
 * DA-JGUA = Dharti Aaba Janjatiya Gram Utkarsh Abhiyan
 * The flagship mission for integrated tribal development
 */

const mongoose = require('mongoose');
const Scheme = require('../src/models/Scheme');
require('dotenv').config();

const DA_JGUA_SCHEMES = [
    // Housing
    {
        name: 'PMAY-G (Pradhan Mantri Awaas Yojana - Gramin)',
        description: 'Housing assistance for rural BPL families including forest dwellers with recognized rights',
        category: 'Housing',
        status: 'Active',
        budget: '₹1.20 Lakh per unit',
        rules: [
            { criteria: 'hasApprovedClaim', operator: '==', value: true, logicalOp: 'AND' },
            { criteria: 'claimType', operator: '==', value: 'Individual', logicalOp: 'AND' },
            { criteria: 'hasNoHousing', operator: '==', value: true, logicalOp: 'AND' }
        ],
        benefits: [
            { type: 'Financial', amount: 120000, description: 'Construction assistance for house' },
            { type: 'Material', amount: 0, description: 'Free bricks and cement under convergence' }
        ],
        convergenceType: 'DA-JGUA',
        triggerOnStatus: 'Title_Issued'
    },
    // Land Development
    {
        name: 'MGNREGA (Land Levelling & Development)',
        description: 'Land development works for FRA title holders under MGNREGA convergence',
        category: 'Land Development',
        status: 'Active',
        budget: '100 person-days guaranteed',
        rules: [
            { criteria: 'hasApprovedClaim', operator: '==', value: true, logicalOp: 'AND' },
            { criteria: 'landSizeClaimed', operator: '>', value: 0, logicalOp: 'AND' }
        ],
        benefits: [
            { type: 'Employment', amount: 100, description: '100 days guaranteed wage employment' },
            { type: 'Asset', amount: 0, description: 'Land levelling, bunding, water conservation' }
        ],
        convergenceType: 'DA-JGUA',
        triggerOnStatus: 'Title_Issued'
    },
    // Water
    {
        name: 'Jal Jeevan Mission (Har Ghar Jal)',
        description: 'Functional household tap connection for tribal households with FRA rights',
        category: 'Water & Sanitation',
        status: 'Active',
        budget: '₹3,000 per connection',
        rules: [
            { criteria: 'hasApprovedClaim', operator: '==', value: true, logicalOp: 'AND' },
            { criteria: 'village', operator: 'exists', value: true, logicalOp: 'AND' }
        ],
        benefits: [
            { type: 'Infrastructure', amount: 0, description: 'Piped water supply to household' },
            { type: 'Subsidy', amount: 3000, description: 'Free installation of tap connection' }
        ],
        convergenceType: 'DA-JGUA',
        triggerOnStatus: 'Title_Issued'
    },
    // Livelihood
    {
        name: 'Van Dhan Vikas Yojana',
        description: 'Minor Forest Produce (MFP) value addition and marketing support for FRA beneficiaries',
        category: 'Livelihood',
        status: 'Active',
        budget: '₹15 Lakh per Van Dhan Kendra',
        rules: [
            { criteria: 'hasApprovedClaim', operator: '==', value: true, logicalOp: 'AND' },
            { criteria: 'claimType', operator: 'in', value: ['Individual', 'Community'], logicalOp: 'AND' }
        ],
        benefits: [
            { type: 'Training', amount: 0, description: 'Skill development in MFP processing' },
            { type: 'Infrastructure', amount: 0, description: 'Van Dhan Kendra establishment' },
            { type: 'Market', amount: 0, description: 'MSP for MFP products' }
        ],
        convergenceType: 'DA-JGUA',
        triggerOnStatus: 'Title_Issued'
    },
    // Agriculture
    {
        name: 'PM-KISAN (For FRA Beneficiaries)',
        description: 'Income support of ₹6,000/year for farmers with recognized forest land rights',
        category: 'Agriculture',
        status: 'Active',
        budget: '₹6,000 per year',
        rules: [
            { criteria: 'hasApprovedClaim', operator: '==', value: true, logicalOp: 'AND' },
            { criteria: 'claimType', operator: '==', value: 'Individual', logicalOp: 'AND' },
            { criteria: 'landSizeClaimed', operator: '<=', value: 4, logicalOp: 'AND' }
        ],
        benefits: [
            { type: 'Financial', amount: 6000, description: 'Annual income support in 3 installments' }
        ],
        convergenceType: 'DA-JGUA',
        triggerOnStatus: 'Title_Issued'
    },
    // Education
    {
        name: 'Eklavya Model Residential Schools',
        description: 'Quality education for tribal children from FRA beneficiary families',
        category: 'Education',
        status: 'Active',
        budget: 'Free education + hostel',
        rules: [
            { criteria: 'hasApprovedClaim', operator: '==', value: true, logicalOp: 'AND' },
            { criteria: 'hasChildren', operator: '==', value: true, logicalOp: 'AND' }
        ],
        benefits: [
            { type: 'Education', amount: 0, description: 'Free residential schooling Class 6-12' },
            { type: 'Subsidy', amount: 0, description: 'Uniform, books, and meals provided' }
        ],
        convergenceType: 'DA-JGUA',
        triggerOnStatus: 'Title_Issued'
    },
    // Healthcare
    {
        name: 'Ayushman Bharat (PMJAY)',
        description: 'Health insurance coverage of ₹5 Lakh for tribal families with FRA rights',
        category: 'Healthcare',
        status: 'Active',
        budget: '₹5 Lakh coverage',
        rules: [
            { criteria: 'hasApprovedClaim', operator: '==', value: true, logicalOp: 'AND' }
        ],
        benefits: [
            { type: 'Insurance', amount: 500000, description: 'Annual health coverage per family' },
            { type: 'Subsidy', amount: 0, description: 'Free treatment at empanelled hospitals' }
        ],
        convergenceType: 'DA-JGUA',
        triggerOnStatus: 'Title_Issued'
    },
    // Community Rights
    {
        name: 'CFR Management Support',
        description: 'Support for Community Forest Resource management for Gram Sabhas with CFR rights',
        category: 'Community Development',
        status: 'Active',
        budget: 'Technical + Financial Support',
        rules: [
            { criteria: 'hasApprovedClaim', operator: '==', value: true, logicalOp: 'AND' },
            { criteria: 'claimType', operator: '==', value: 'Community', logicalOp: 'AND' }
        ],
        benefits: [
            { type: 'Technical', amount: 0, description: 'CFR Management Plan preparation' },
            { type: 'Financial', amount: 0, description: 'CAMPA funds for forest restoration' }
        ],
        convergenceType: 'DA-JGUA',
        triggerOnStatus: 'Title_Issued'
    }
];

async function seedSchemes() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check existing schemes
        const existingCount = await Scheme.countDocuments({ convergenceType: 'DA-JGUA' });

        if (existingCount > 0) {
            console.log(`Found ${existingCount} existing DA-JGUA schemes. Updating...`);
            // Delete and re-seed
            await Scheme.deleteMany({ convergenceType: 'DA-JGUA' });
        }

        // Insert schemes
        const result = await Scheme.insertMany(DA_JGUA_SCHEMES);
        console.log(`✅ Seeded ${result.length} DA-JGUA convergence schemes`);

        // List seeded schemes
        result.forEach((scheme, index) => {
            console.log(`   ${index + 1}. ${scheme.name} (${scheme.category})`);
        });

        console.log('\n🎯 DA-JGUA Convergence is now active!');
        console.log('   Schemes will auto-recommend when claims reach Title_Issued status.');

    } catch (error) {
        console.error('Error seeding schemes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run if called directly
if (require.main === module) {
    seedSchemes();
}

module.exports = { seedSchemes, DA_JGUA_SCHEMES };
