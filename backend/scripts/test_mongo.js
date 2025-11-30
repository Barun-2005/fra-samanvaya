const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function testConnection() {
    try {
        console.log('🔍 Testing MongoDB Atlas connection...');
        console.log('URI:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

        await mongoose.connect(process.env.MONGO_URI);

        console.log('\n✅ MongoDB Atlas connected successfully');
        console.log('📊 Database:', mongoose.connection.name);
        console.log('🌍 Host:', mongoose.connection.host);
        console.log('📈 Connection state:', mongoose.connection.readyState); // 1 = connected

        // Test a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n📁 Collections found: ${collections.length}`);
        collections.forEach(col => console.log(`   - ${col.name}`));

        await mongoose.connection.close();
        console.log('\n🔌 Connection closed successfully');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ MongoDB connection failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testConnection();
