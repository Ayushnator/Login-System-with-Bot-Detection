import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Use cloud MongoDB URI in production, local in development
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/login-system';
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`\n✓ MongoDB Connected Successfully!`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Host: ${conn.connection.host}`);
    console.log(`  Database: ${conn.connection.name}\n`);
    return conn;
  } catch (error) {
    console.error('\n✗ MongoDB Connection Failed!');
    console.error(`  Error: ${error.message}`);
    console.error(`  URI: ${process.env.MONGODB_URI ? 'Cloud (MongoDB Atlas)' : 'Local (127.0.0.1)'}\n`);
    process.exit(1);
  }
};

export default connectDB;
