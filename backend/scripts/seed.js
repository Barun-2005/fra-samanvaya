const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

dotenv.config({ path: './.env' });

const users = [
  {
    username: 'superadmin',
    password: 'password',
    displayName: 'Super Admin',
    roles: ['SuperAdmin'],
    state: 'National',
    district: 'All'
  },
  {
    username: 'dataentry',
    password: 'password',
    displayName: 'Data Entry Officer',
    roles: ['DataEntry'],
    state: 'Maharashtra',
    district: 'Gadchiroli'
  },
  {
    username: 'verifier',
    password: 'password',
    displayName: 'Verification Officer',
    roles: ['Verifier'],
    state: 'Maharashtra',
    district: 'Gadchiroli'
  },
  {
    username: 'approver',
    password: 'password',
    displayName: 'Approving Authority',
    roles: ['Approver'],
    state: 'Maharashtra',
    district: 'Gadchiroli'
  },
  {
    username: 'schemeadmin',
    password: 'password',
    displayName: 'Scheme Admin',
    roles: ['SchemeAdmin'],
    state: 'National',
    district: 'All'
  },
  {
    username: 'ngoviewer',
    password: 'password',
    displayName: 'NGO Viewer',
    roles: ['NGOViewer'],
    state: 'Maharashtra',
    district: 'All'
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

    console.log('Database seeded with new users!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
