const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const promoteUser = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('Error: MONGO_URI is not defined in .env');
            process.exit(1);
        }
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const email = process.argv[2];
        if (!email) {
            console.error('Please provide an email address as an argument.');
            process.exit(1);
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found. Creating new Super Admin user...');
            const newUser = new User({
                fullName: 'Barun Pattanaik',
                email: email,
                username: email.split('@')[0],
                password: 'password123',
                roles: ['Super Admin', 'Citizen'],
                employeeId: 'SA-' + Math.floor(Math.random() * 1000),
                state: 'Odisha',
                district: 'Khordha'
            });
            await newUser.save();
            console.log(`Successfully created and promoted ${newUser.fullName} (${email}) to Super Admin!`);
            console.log('Default password: password123');
        } else {
            if (!user.roles.includes('Super Admin')) {
                user.roles.push('Super Admin');
                await user.save();
                console.log(`Successfully promoted ${user.fullName} (${email}) to Super Admin!`);
            } else {
                console.log('User is already a Super Admin.');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error promoting user:', error);
        process.exit(1);
    }
};

promoteUser();
