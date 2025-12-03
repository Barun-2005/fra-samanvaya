const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Simple scheme schema matching the model
const Scheme = mongoose.model('Scheme', new mongoose.Schema({
    name: String,
    description: String,
    category: String,
    status: String,
    budget: String,
    beneficiaries: Number,
    rules: Array,
    benefits: Array
}));

const schemes = [
    {
        name: "PM-KISAN",
        description: "₹6000/year income support for farmers",
        category: "Agriculture",
        status: "Active",
        beneficiaries: 11000000,
        benefits: [
            { type: "Financial", amount: 6000, description: "₹2000 x 3 installments" }
        ]
    },
    {
        name: "PMAY-Gramin",
        description: "Housing assistance for rural families",
        category: "Housing",
        status: "Active",
        beneficiaries: 2950000,
        benefits: [
            { type: "Subsidy", amount: 120000, description: "₹1.2L for construction" }
        ]
    },
    {
        name: "MGNREGA",
        description: "100 days guaranteed employment",
        category: "Employment",
        status: "Active",
        beneficiaries: 7800000,
        benefits: [
            { type: "Employment", amount: 309, description: "₹309/day wage" }
        ]
    }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        console.log('Clearing old schemes...');
        await Scheme.deleteMany({});

        console.log('Inserting new schemes...');
        const inserted = await Scheme.insertMany(schemes);
        console.log(`✅ Inserted ${inserted.length} schemes:`, inserted.map(s => s.name));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seed();
