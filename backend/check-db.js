const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const checkDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        const allUsers = await User.find({});
        console.log(`\n📊 Total users in database: ${allUsers.length}\n`);

        if (allUsers.length === 0) {
            console.log('❌ DATABASE IS EMPTY! No users found!');
        } else {
            allUsers.forEach((user, index) => {
                console.log(`${index + 1}. Username: ${user.username} | Roles: ${user.roles.join(', ')}`);
            });
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();
    }
};

checkDatabase();
