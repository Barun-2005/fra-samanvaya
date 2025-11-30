const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        // Find ramesh user
        const user = await User.findOne({ username: 'ramesh' });

        if (!user) {
            console.log('❌ User "ramesh" NOT FOUND in database!');
            return;
        }

        console.log('✅ User "ramesh" FOUND');
        console.log('User data:', {
            username: user.username,
            roles: user.roles,
            hashedPassword: user.password.substring(0, 20) + '...' // Show first 20 chars
        });

        // Test password comparison
        const isMatch = await user.comparePassword('password');
        console.log('\n🔐 Password comparison result:', isMatch);

        if (isMatch) {
            console.log('✅ ✅ ✅ PASSWORD MATCHES! Login should work!');
        } else {
            console.log('❌ ❌ ❌ PASSWORD DOES NOT MATCH! This is the bug!');
            console.log('Expected plain text: "password"');
            console.log('Hashed in DB:', user.password.substring(0, 30) + '...');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();
    }
};

testLogin();
