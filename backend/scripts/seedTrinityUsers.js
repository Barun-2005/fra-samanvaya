const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

const path = require('path');
// Try loading from root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });
// Fallback to backend .env if needed
if (!process.env.MONGO_URI) {
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = [
            {
                username: 'satark_user',
                email: 'field_worker@fra.gov.in',
                password: 'password123',
                fullName: 'Ramesh Field Worker',
                roles: ['Field Worker'],
                employeeId: 'FW001',
                department: 'Forest Dept'
            },
            {
                username: 'vidhi_user',
                email: 'approver@fra.gov.in',
                password: 'password123',
                fullName: 'Suresh Approver',
                roles: ['Approving Authority'],
                employeeId: 'AA001',
                department: 'SDLC'
            },
            {
                username: 'mitra_user',
                email: 'data_entry@fra.gov.in',
                password: 'password123',
                fullName: 'Mahesh Data Entry',
                roles: ['Data Entry Officer'],
                employeeId: 'DE001',
                department: 'Revenue Dept'
            },
            {
                username: 'officer_user',
                email: 'verification@fra.gov.in',
                password: 'password123',
                fullName: 'Vikram Officer',
                roles: ['Verification Officer'],
                employeeId: 'VO001',
                department: 'Forest Dept'
            }
        ];

        for (const user of users) {
            const existingUser = await User.findOne({ email: user.email });
            if (existingUser) {
                console.log(`User ${user.email} already exists. Updating roles...`);
                existingUser.roles = user.roles;
                // Reset password if needed (optional, but good for testing)
                // const salt = await bcrypt.genSalt(10);
                // existingUser.password = await bcrypt.hash(user.password, salt);
                await existingUser.save();
            } else {
                console.log(`Creating user ${user.email}...`);
                const newUser = new User(user);
                await newUser.save();
            }
        }

        console.log('Trinity Users Seeded Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedUsers();
