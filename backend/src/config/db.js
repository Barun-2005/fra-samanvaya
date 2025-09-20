const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // The deprecated options have been removed.
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
