const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Scheme = require('../src/models/Scheme');
const KnowledgeBase = require('../src/models/KnowledgeBase');

const sampleSchemes = [
    {
        name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        description: "Direct income support of ₹6000/year to all farmer families holding cultivable land",
        category: "Agriculture",
        status: "Active",
        budget: "₹75,000 Crore",
        beneficiaries: 11000000,
        benefits: [
            { type: "Financial", amount: 6000, description: "₹2000 per installment, three times per year" }
        ],
        rules: [
            { criteria: "occupation", operator: "==", value: "Farmer", logicalOp: "AND" },
            { criteria: "landSize", operator: ">", value: 0, logicalOp: "AND" }
        ]
    },
    {
        name: "PMAY-G (Pradhan Mantri Awas Yojana - Gramin)",
        description: "Housing assistance for rural families without pucca houses",
        category: "Housing",
        status: "Active",
        budget: "₹1,30,075 Crore",
        beneficiaries: 2950000,
        benefits: [
            { type: "Subsidy", amount: 120000, description: "₹1,20,000 for plain areas construction" }
        ],
        rules: [
            { criteria: "housingType", operator: "==", value: "Kutcha", logicalOp: "AND" }
        ]
    },
    {
        name: "FRA Community Forest Rights",
        description: "Recognition of community rights over forest resources for tribal communities",
        category: "Forest Rights",
        status: "Active",
        benefits: [
            { type: "Land Title", description: "Community forest land title deed" },
            { type: "Rights", description: "Rights to minor forest produce and grazing" }
        ],
        rules: [
            { criteria: "caste", operator: "includes", value: "Scheduled Tribe", logicalOp: "OR" },
            { criteria: "residenceYears", operator: ">", value: 75, logicalOp: "AND" }
        ]
    },
    {
        name: "MGNREGA",
        description: "100 days of guaranteed wage employment per year to rural households",
        category: "Employment",
        status: "Active",
        budget: "₹89,400 Crore",
        beneficiaries: 7800000,
        benefits: [
            { type: "Employment", amount: 309, description: "₹309 per day wage (state-specific)" }
        ],
        rules: [
            { criteria: "residence", operator: "==", value: "Rural", logicalOp: "AND" },
            { criteria: "age", operator: ">", value: 18, logicalOp: "AND" }
        ]
    }
];

const sampleKnowledge = [
    {
        title: "Forest Rights Act 2006 - Section 3(1)",
        content: "Recognition of forest rights under this Act includes the rights to hold and live in the forest land under the individual or common occupation for habitation or for self-cultivation for livelihood by a member or members of a forest dwelling Scheduled Tribe or other traditional forest dwellers.",
        source: "FRA Act 2006",
        category: "Legal"
    },
    {
        title: "OTFD Definition",
        content: "Other Traditional Forest Dwellers (OTFDs) are families who have been primarily residing in forests for three generations (75 years) prior to 13th December 2005, and who depend on the forest land for their livelihood needs.",
        source: "FRA Act 2006",
        category: "Legal"
    },
    {
        title: "Community Rights vs Individual Rights",
        content: "Community rights include rights over common property resources like nistar, grazing grounds, and traditional use areas. Individual rights include rights to cultivate land for livelihood. Both can coexist.",
        source: "FRA Guidelines 2012",
        category: "Legal"
    }
];

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Scheme.deleteMany({});
        await KnowledgeBase.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert schemes
        const schemes = await Scheme.insertMany(sampleSchemes);
        console.log(`✅ Inserted ${schemes.length} schemes`);

        // Insert knowledge base (without embeddings for now)
        const knowledge = await KnowledgeBase.insertMany(sampleKnowledge);
        console.log(`✅ Inserted ${knowledge.length} knowledge base entries`);

        console.log('\n📊 Sample Data:');
        console.log('Schemes:', schemes.map(s => s.name));
        console.log('Knowledge:', knowledge.map(k => k.title));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
