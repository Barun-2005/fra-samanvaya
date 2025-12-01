const mongoose = require('mongoose');
const User = require('../src/models/User');
const Claim = require('../src/models/Claim');
const Document = require('../src/models/Document');
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

    // Seed Claims
    const ramesh = createdUsers['ramesh'];
    const sunita = createdUsers['sunita'];
    const verifier = createdUsers['verifier'];

    const claimsData = [
      {
        claimant: ramesh._id,
        claimantName: ramesh.fullName,
        aadhaarNumber: "123456789012",
        village: ramesh.village,
        district: ramesh.district,
        state: ramesh.state,
        landSizeClaimed: 2.5,
        surveyNumber: "123/A",
        claimType: "Individual",
        status: "Submitted",
        reasonForClaim: "Ancestral land cultivation for 3 generations.",
        dateSubmitted: new Date(),
        geojson: { type: "Polygon", coordinates: [[[77.1, 28.4], [77.2, 28.4], [77.2, 28.5], [77.1, 28.5], [77.1, 28.4]]] }
      },
      {
        claimant: sunita._id,
        claimantName: sunita.fullName,
        aadhaarNumber: "987654321098",
        village: sunita.village,
        district: sunita.district,
        state: sunita.state,
        landSizeClaimed: 1.8,
        claimType: "Community",
        status: "Verified",
        verifiedBy: verifier._id,
        verifiedAt: new Date(),
        verificationNotes: "Field visit confirmed boundaries.",
        reasonForClaim: "Community forest resource rights.",
        dateSubmitted: new Date(Date.now() - 86400000), // 1 day ago
        geojson: { type: "Polygon", coordinates: [[[78.1, 29.4], [78.2, 29.4], [78.2, 29.5], [78.1, 29.5], [78.1, 29.4]]] }
      },
      {
        claimant: ramesh._id,
        claimantName: ramesh.fullName,
        aadhaarNumber: "123456789012",
        village: ramesh.village,
        district: ramesh.district,
        state: ramesh.state,
        landSizeClaimed: 4.0,
        claimType: "Individual",
        status: "Approved",
        verifiedBy: verifier._id,
        verifiedAt: new Date(Date.now() - 172800000), // 2 days ago
        approvedBy: createdUsers['approver']._id,
        approvedAt: new Date(),
        approvalNotes: "All documents in order. Title deed generated.",
        reasonForClaim: "Old claim re-verified.",
        dateSubmitted: new Date(Date.now() - 259200000), // 3 days ago
        geojson: { type: "Polygon", coordinates: [[[77.3, 28.6], [77.4, 28.6], [77.4, 28.7], [77.3, 28.7], [77.3, 28.6]]] }
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
