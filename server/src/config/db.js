import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const mongoUri = env.MONGO_URI;

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1500, // Quick initial check
    });

    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] MongoDB not detected at "${mongoUri}". Running in resilient local store mode.`);
    console.warn(`[Database] To use MongoDB Atlas, configure MONGO_URI in your .env file.`);
  }
};

export const isDbConnected = () => isConnected && mongoose.connection.readyState === 1;

export default connectDB;
