const mongoose = require('mongoose');
const User = require('../src/models/User');
const Claim = require('../src/models/Claim');
const Document = require('../src/models/Document');
const path = require('path');
const dotenv = require('dotenv');

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const users = [
    // 1. SUPER ADMIN
    {
        username: "superadmin",
        email: "admin@example.com",
        password: "password",
        roles: ["Super Admin"],
        fullName: "Admin User",
        employeeId: "EMP006",
        department: "Administration",
        avatarUrl: "/assets/avatars/avatar6.png"
    },
    // 2. CITIZEN (Ramesh)
    {
        username: "ramesh",
        email: "ramesh.citizen@example.com",
        password: "password",
        roles: ["Citizen"],
        fullName: "Ramesh Patel",
        employeeId: "CIT001",
        department: "Citizen",
        village: "Rampur",
        district: "Sitapur",
        state: "Uttar Pradesh",
        avatarUrl: "/assets/avatars/citizen1.png"
    },
    // 3. CITIZEN (Sunita - for rejected/community claims)
    {
        username: "sunita",
        email: "sunita.citizen@example.com",
        password: "password",
        roles: ["Citizen"],
        fullName: "Sunita Devi",
        employeeId: "CIT002",
        department: "Citizen",
        village: "Khairpur",
        district: "Barabanki",
        state: "Uttar Pradesh",
        avatarUrl: "/assets/avatars/citizen2.png"
    },
    // 4. VERIFICATION OFFICER
    {
        username: "verifier",
        email: "anita.verifier@example.com",
        password: "password",
        roles: ["Verification Officer"],
        fullName: "Anita Verma",
        employeeId: "EMP002",
        department: "Verification",
        avatarUrl: "/assets/avatars/avatar2.png"
    },
    // 5. APPROVING AUTHORITY
    {
        username: "approver",
        email: "sanjay.approver@example.com",
        password: "password",
        roles: ["Approving Authority"],
        fullName: "Sanjay Singh",
        employeeId: "EMP003",
        department: "District Office",
        avatarUrl: "/assets/avatars/avatar3.png"
    },
    // 6. DATA ENTRY OFFICER
    {
        username: "dataentry",
        email: "ravi.dataentry@example.com",
        password: "password",
        roles: ["Data Entry Officer"],
        fullName: "Ravi Sharma",
        employeeId: "EMP001",
        department: "Claims",
        avatarUrl: "/assets/avatars/avatar1.png"
    },
    // 7. NGO VIEWER
    {
        username: "ngoviewer",
        email: "amit.ngo@example.com",
        password: "password",
        roles: ["NGO Viewer"],
        fullName: "Amit Patel",
        employeeId: "EMP005",
        department: "External NGO",
        avatarUrl: "/assets/avatars/avatar5.png"
    },
    // 8. SCHEME ADMIN
    {
        username: "schemeadmin",
        email: "meera.schemeadmin@example.com",
        password: "password",
        roles: ["Scheme Admin"],
        fullName: "Meera Iyer",
        employeeId: "EMP004",
        department: "Schemes",
        avatarUrl: "/assets/avatars/avatar4.png"
    },
    // 9. FIELD WORKER (New Role)
    {
        username: "fieldworker",
        email: "fieldworker@fra.gov.in",
        password: "password",
        roles: ["Field Worker"],
        fullName: "Vikram Field Worker",
        employeeId: "FW001",
        department: "Forest Dept",
        avatarUrl: "/assets/avatars/avatar1.png"
    }
];

const seedDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('Error: MONGO_URI is not defined in .env');
            process.exit(1);
        }

        // --- SAFETY LOCK REMOVED FOR USER REQUEST ---
        // const isLiveConnection = uri.includes('mongodb.net');
        // if (isLiveConnection) { ... }
        // -------------------------------------------

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        await User.deleteMany({});
        await Claim.deleteMany({});
        await Document.deleteMany({});
        console.log('Old data cleared.');

        // Seed Users
        const createdUsers = {};
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            createdUsers[userData.username] = user;
            console.log(`Created user: ${userData.email} (${userData.roles[0]})`);
        }

        // Seed Claims
        const ramesh = createdUsers['ramesh'];
        const sunita = createdUsers['sunita'];
        const verifier = createdUsers['verifier'];
        const approver = createdUsers['approver'];
        const fieldworker = createdUsers['fieldworker'];

        const claimsData = [
            // 1. Submitted Claim (For Field Worker to Verify) - Assigned to Ramesh
            {
                claimant: ramesh._id,
                claimantName: ramesh.fullName,
                aadhaarNumber: "123456789012",
                village: "Rampur",
                district: "Sitapur",
                state: "Uttar Pradesh",
                landSizeClaimed: 2.5,
                claimType: "Individual",
                status: "Submitted",
                reasonForClaim: "Ancestral farming land since 1980.",
                dateSubmitted: new Date(),
                geojson: { type: "Polygon", coordinates: [[[77.3, 28.6], [77.4, 28.6], [77.4, 28.7], [77.3, 28.7], [77.3, 28.6]]] },
                veracityScore: 85,
                statusHistory: [{ status: 'Submitted', changedAt: new Date() }]
            },
            // 2. Verified Claim (For Approver to Decide) - Assigned to Ramesh
            {
                claimant: ramesh._id,
                claimantName: "Vikram Singh (Ramesh Family)",
                aadhaarNumber: "987654321098",
                village: "Rampur",
                district: "Sitapur",
                state: "Uttar Pradesh",
                landSizeClaimed: 1.5,
                claimType: "Individual",
                status: "Verified",
                verifiedBy: verifier._id,
                verifiedAt: new Date(Date.now() - 86400000),
                verificationNotes: "Field verification complete. Boundaries match.",
                reasonForClaim: "Livelihood dependence.",
                dateSubmitted: new Date(Date.now() - 172800000),
                geojson: { type: "Polygon", coordinates: [[[77.1, 28.4], [77.2, 28.4], [77.2, 28.5], [77.1, 28.5], [77.1, 28.4]]] },
                veracityScore: 90,
                statusHistory: [
                    { status: 'Submitted', changedAt: new Date(Date.now() - 172800000) },
                    { status: 'Verified', changedAt: new Date(Date.now() - 86400000), changedBy: verifier._id, reason: 'Verified' }
                ]
            },
            // 3. Approved Claim (For Reference) - Assigned to Sunita
            {
                claimant: sunita._id,
                claimantName: sunita.fullName,
                aadhaarNumber: "555666777888",
                village: "Khairpur",
                district: "Barabanki",
                state: "Uttar Pradesh",
                landSizeClaimed: 3.0,
                claimType: "Individual",
                status: "Approved",
                verifiedBy: verifier._id,
                approvedBy: approver._id,
                approvedAt: new Date(Date.now() - 43200000),
                reasonForClaim: "Forest dweller rights.",
                dateSubmitted: new Date(Date.now() - 259200000),
                geojson: { type: "Polygon", coordinates: [[[77.5, 28.8], [77.6, 28.8], [77.6, 28.9], [77.5, 28.9], [77.5, 28.8]]] },
                veracityScore: 95,
                statusHistory: [
                    { status: 'Submitted', changedAt: new Date(Date.now() - 259200000) },
                    { status: 'Verified', changedAt: new Date(Date.now() - 172800000), changedBy: verifier._id },
                    { status: 'Approved', changedAt: new Date(Date.now() - 43200000), changedBy: approver._id }
                ]
            }
        ];

        for (const cData of claimsData) {
            const claim = new Claim(cData);
            await claim.save();
        }

        console.log(`Seeded ${claimsData.length} claims.`);
        console.log("\n=== MASTER SEED COMPLETE ===");
        console.log("All users have password: 'password'");
        process.exit(0);

    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
