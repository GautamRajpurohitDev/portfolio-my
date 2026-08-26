import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env");
}

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) {
    console.log("→ Using existing MongoDB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("✗ MongoDB connection error:", error);
    process.exit(1);
  }
}
