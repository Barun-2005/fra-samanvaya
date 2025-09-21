const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

dotenv.config({ path: './.env' });

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
    "fullName": "Priya Desai",
    "email": "priya.superadmin@example.com",
    "department": "System",
    "avatarUrl": "/assets/avatars/avatar6.png"
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

    console.log('Database seeded with 6 new detailed users!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
