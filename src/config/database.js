const mongoose = require('mongoose');

const connectDB = async () => {  
  try {
    await mongoose.connect(process.env.MONGO_URI); // Simplified connection
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
