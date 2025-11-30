// Hardcode Atlas URI since .env loading is failing
process.env.MONGO_URI = 'mongodb+srv://barunpattanaik2_db_user:8gk4tGmpc8q2lr1h@cluster0.g19x5gu.mongodb.net/FraSamanvayaLocal?retryWrites=true&w=majority&appName=Cluster0';

const mongoose = require('mongoose');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

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
  await connectDB();
  try {
    await User.deleteMany({});
    console.log('Old users removed.');

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    console.log(`Database seeded with ${users.length} new detailed users!`);

    // Seed Claims
    const Claim = require('../src/models/Claim');
    const Document = require('../src/models/Document');

    await Claim.deleteMany({});
    await Document.deleteMany({});

    const ramesh = await User.findOne({ username: 'ramesh' });

    if (ramesh) {
      // Create Claim first (needed for Document reference)
      const claim = new Claim({
        claimant: ramesh._id,
        aadhaarNumber: "123456789012",
        village: ramesh.village,
        district: ramesh.district,
        state: ramesh.state,
        landSizeClaimed: 2.5,
        claimType: "Individual",
        status: "Submitted",
        reasonForClaim: "Ancestral land cultivation for 3 generations.",
        dateSubmitted: new Date(),
        geojson: {
          type: "Polygon",
          coordinates: [[
            [77.123, 28.456],
            [77.124, 28.456],
            [77.124, 28.457],
            [77.123, 28.457],
            [77.123, 28.456]
          ]]
        }
      });

      const savedClaim = await claim.save();

      // Create Documents
      const docs = [
        {
          claim: savedClaim._id,
          uploader: ramesh._id,
          type: "Aadhar",
          fileRef: "uploads/sample_aadhar.jpg"
        },
        {
          claim: savedClaim._id,
          uploader: ramesh._id,
          type: "Land Receipt",
          fileRef: "uploads/sample_land.pdf"
        }
      ];

      const savedDocs = [];
      for (const docData of docs) {
        const doc = new Document(docData);
        const savedDoc = await doc.save();
        savedDocs.push(savedDoc._id);
      }

      // Update Claim with Documents
      savedClaim.documents = savedDocs;
      await savedClaim.save();

      console.log('Seeded sample claim with documents for Ramesh.');
    }

  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
