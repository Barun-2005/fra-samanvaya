const mongoose = require('mongoose');
const User = require('../src/models/User');
const Claim = require('../src/models/Claim');
const Document = require('../src/models/Document');
const Scheme = require('../src/models/Scheme');
const connectDB = require('../src/config/db');
const path = require('path');
const dotenv = require('dotenv');

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const users = [
  {
    "username": "dataentry",
    "password": "password",
    "roles": ["Data Entry Officer"],
    "employeeId": "EMP001",
    "fullName": "Ravi Sharma",
    "email": "ravi.dataentry@example.com",
    "department": "Claims",
    "avatarUrl": "/assets/avatars/avatar1.png"
  },
  {
    "username": "verifier",
    "password": "password",
    "roles": ["Verification Officer"],
    "employeeId": "EMP002",
    "fullName": "Anita Verma",
    "email": "anita.verifier@example.com",
    "department": "Verification",
    "avatarUrl": "/assets/avatars/avatar2.png"
  },
  {
    "username": "approver",
    "password": "password",
    "roles": ["Approving Authority"],
    "employeeId": "EMP003",
    "fullName": "Sanjay Singh",
    "email": "sanjay.approver@example.com",
    "department": "District Office",
    "avatarUrl": "/assets/avatars/avatar3.png"
  },
  {
    "username": "schemeadmin",
    "password": "password",
    "roles": ["Scheme Admin"],
    "employeeId": "EMP004",
    "fullName": "Meera Iyer",
    "email": "meera.schemeadmin@example.com",
    "department": "Schemes",
    "avatarUrl": "/assets/avatars/avatar4.png"
  },
  {
    "username": "ngoviewer",
    "password": "password",
    "roles": ["NGO Viewer"],
    "employeeId": "EMP005",
    "fullName": "Amit Patel",
    "email": "amit.ngo@example.com",
    "department": "External NGO",
    "avatarUrl": "/assets/avatars/avatar5.png"
  },
  {
    "username": "superadmin",
    "password": "password",
    "roles": ["Super Admin"],
    "employeeId": "EMP006",
    "fullName": "Admin User",
    "email": "admin@example.com",
    "department": "Administration",
    "avatarUrl": "/assets/avatars/avatar6.png"
  },
  {
    "username": "barun",
    "password": "password123",
    "roles": ["Super Admin", "Citizen"],
    "employeeId": "SA-001",
    "fullName": "Barun Pattanaik",
    "email": "barunpattanaik2@gmail.com",
    "department": "Administration",
    "state": "Odisha",
    "district": "Khordha",
    "avatarUrl": "/assets/avatars/avatar6.png"
  },
  {
    "username": "ramesh",
    "password": "password",
    "roles": ["Citizen"],
    "employeeId": "CIT001",
    "fullName": "Ramesh Patel",
    "email": "ramesh.citizen@example.com",
    "department": "Citizen",
    "village": "Rampur",
    "district": "Sitapur",
    "state": "Uttar Pradesh",
    "avatarUrl": "/assets/avatars/citizen1.png"
  },
  {
    "username": "sunita",
    "password": "password",
    "roles": ["Citizen"],
    "employeeId": "CIT002",
    "fullName": "Sunita Devi",
    "email": "sunita.citizen@example.com",
    "department": "Citizen",
    "village": "Khairpur",
    "district": "Barabanki",
    "state": "Uttar Pradesh",
    "avatarUrl": "/assets/avatars/citizen2.png"
  }
];

const seedDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('Error: MONGO_URI is not defined in .env');
      process.exit(1);
    }

    // --- SAFETY LOCK ---
    const isLiveConnection = uri.includes('mongodb.net');
    if (isLiveConnection) {
      console.warn("\n⚠️  DANGER: YOU ARE CONNECTED TO A LIVE ATLAS DATABASE!");
      console.warn("❌  Safety Lock Engaged: Deletion of Users/Claims/Documents is BLOCKED.");
      console.warn("ℹ️   To seed the live DB, you must manually bypass this check in the code (NOT RECOMMENDED).");
      console.warn("✅  Exiting safely.\n");
      process.exit(0); // Exit success to stop the script without erroring out CI/CD if any
    }
    // -------------------

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
    }
    console.log(`Seeded ${users.length} users.`);

    // Seed Claims with Realistic Data
    const ramesh = createdUsers['ramesh'];
    const sunita = createdUsers['sunita'];
    const verifier = createdUsers['verifier'];
    const approver = createdUsers['approver'];

    const claimsData = [
      // 1. Approved Claim (High Veracity) - Good Precedent
      {
        claimant: ramesh._id,
        claimantName: ramesh.fullName,
        aadhaarNumber: "123456789012",
        village: "Rampur",
        district: "Sitapur",
        state: "Uttar Pradesh",
        landSizeClaimed: 2.5,
        claimType: "Individual",
        status: "Approved",
        verifiedBy: verifier._id,
        verifiedAt: new Date(Date.now() - 172800000),
        approvedBy: approver._id,
        approvedAt: new Date(Date.now() - 86400000),
        approvalNotes: "Verified against 1950 revenue records. Ancestral possession confirmed.",
        reasonForClaim: "Claiming rights under FRA 2006 Section 3(1)(a) for self-cultivation. Land has been in family possession since 1980, verified by Gram Sabha resolution dated 12/08/2008.",
        dateSubmitted: new Date(Date.now() - 259200000),
        geojson: { type: "Polygon", coordinates: [[[77.3, 28.6], [77.4, 28.6], [77.4, 28.7], [77.3, 28.7], [77.3, 28.6]]] },
        veracityScore: 92,
        eligibleSchemes: ["PM Kisan Samman Nidhi", "Soil Health Card Scheme"],
        statusHistory: [
          { status: 'Submitted', changedAt: new Date(Date.now() - 259200000) },
          { status: 'Verified', changedAt: new Date(Date.now() - 172800000), changedBy: verifier._id, reason: 'Documents verified' },
          { status: 'Approved', changedAt: new Date(Date.now() - 86400000), changedBy: approver._id, reason: 'Approved by DLC' }
        ]
      },
      // 2. Rejected Claim (Low Veracity) - Negative Precedent
      {
        claimant: sunita._id,
        claimantName: "Rajesh Kumar", // Different name for variety
        aadhaarNumber: "111222333444",
        village: "Rampur",
        district: "Sitapur",
        state: "Uttar Pradesh",
        landSizeClaimed: 5.0,
        claimType: "Individual",
        status: "Rejected",
        verifiedBy: verifier._id,
        verifiedAt: new Date(Date.now() - 300000000),
        approvedBy: approver._id,
        approvedAt: new Date(Date.now() - 200000000),
        rejectionReason: "Satellite imagery shows land was forest cover in 2005. No evidence of cultivation prior to 2005.",
        reasonForClaim: "Recent clearing for agriculture. Claiming rights based on current occupation.",
        dateSubmitted: new Date(Date.now() - 400000000),
        geojson: { type: "Polygon", coordinates: [[[77.5, 28.8], [77.6, 28.8], [77.6, 28.9], [77.5, 28.9], [77.5, 28.8]]] },
        veracityScore: 15,
        eligibleSchemes: [],
        statusHistory: [
          { status: 'Submitted', changedAt: new Date(Date.now() - 400000000) },
          { status: 'Verified', changedAt: new Date(Date.now() - 300000000), changedBy: verifier._id, reason: 'Field verification done' },
          { status: 'Rejected', changedAt: new Date(Date.now() - 200000000), changedBy: approver._id, reason: 'Evidence mismatch' }
        ]
      },
      // 3. Community Claim (Verified)
      {
        claimant: sunita._id,
        claimantName: sunita.fullName,
        aadhaarNumber: "987654321098",
        village: "Khairpur",
        district: "Barabanki",
        state: "Uttar Pradesh",
        landSizeClaimed: 15.0,
        claimType: "Community",
        status: "Verified",
        verifiedBy: verifier._id,
        verifiedAt: new Date(Date.now() - 86400000),
        verificationNotes: "Community usage for firewood collection verified by Forest Dept.",
        reasonForClaim: "Community rights for Nistar (Section 3(1)(b)) and minor forest produce collection in traditional boundary.",
        dateSubmitted: new Date(Date.now() - 100000000),
        geojson: { type: "Polygon", coordinates: [[[78.1, 29.4], [78.2, 29.4], [78.2, 29.5], [78.1, 29.5], [78.1, 29.4]]] },
        veracityScore: 88,
        eligibleSchemes: ["National Bamboo Mission", "Van Dhan Vikas Yojana"],
        statusHistory: [
          { status: 'Submitted', changedAt: new Date(Date.now() - 100000000) },
          { status: 'Verified', changedAt: new Date(Date.now() - 86400000), changedBy: verifier._id, reason: 'Verified by Forest Dept' }
        ]
      },
      // 4. Submitted Claim (Pending) - The one we will test with
      {
        claimant: ramesh._id,
        claimantName: "Vikram Singh",
        aadhaarNumber: "555666777888",
        village: "Rampur",
        district: "Sitapur",
        state: "Uttar Pradesh",
        landSizeClaimed: 1.2,
        claimType: "Individual",
        status: "Submitted",
        reasonForClaim: "Ancestral farming land. Family has lived here for 4 generations. Requesting patta under FRA for livelihood security.",
        dateSubmitted: new Date(),
        geojson: { type: "Polygon", coordinates: [[[77.1, 28.4], [77.2, 28.4], [77.2, 28.5], [77.1, 28.5], [77.1, 28.4]]] },
        veracityScore: 78, // Good but needs verification
        eligibleSchemes: ["PM Awas Yojana (Gramin)", "MGNREGA"],
        statusHistory: [
          { status: 'Submitted', changedAt: new Date() }
        ]
      },
      // 5. Conflict Detected Claim
      {
        claimant: sunita._id,
        claimantName: "Conflict Test User",
        aadhaarNumber: "999888777000",
        village: "Rampur",
        district: "Sitapur",
        state: "Uttar Pradesh",
        landSizeClaimed: 3.0,
        claimType: "Individual",
        status: "ConflictDetected",
        reasonForClaim: "Expansion of farming land.",
        dateSubmitted: new Date(Date.now() - 50000000),
        geojson: { type: "Polygon", coordinates: [[[77.15, 28.45], [77.25, 28.45], [77.25, 28.55], [77.15, 28.55], [77.15, 28.45]]] },
        veracityScore: 45,
        eligibleSchemes: [],
        statusHistory: [
          { status: 'Submitted', changedAt: new Date(Date.now() - 50000000) },
          { status: 'ConflictDetected', changedAt: new Date(Date.now() - 100000), reason: 'Overlap with Protected Forest' }
        ]
      }
    ];

    for (const cData of claimsData) {
      const claim = new Claim(cData);
      const savedClaim = await claim.save();

      // Add dummy documents
      const doc = new Document({
        claim: savedClaim._id,
        uploader: cData.claimant,
        type: "Aadhar",
        fileRef: "uploads/sample_aadhar.jpg"
      });
      const savedDoc = await doc.save();
      savedClaim.documents.push(savedDoc._id);
      await savedClaim.save();
    }

    console.log(`Seeded ${claimsData.length} claims with documents.`);
    process.exit(0);

  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
