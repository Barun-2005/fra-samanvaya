const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected to:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Please check your MONGO_URI in .env file');
    process.exit(1);
  }
};

module.exports = connectDB;

module.exports = connectDB;
