// server/config/connectDB.js
import mongoose from "mongoose";
import { startHoldCleaner } from "../services/holdsCleaner.js";

let stopHoldCleaner = null;

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("❌ MONGO_URI not found in environment variables");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Start the hold cleaner service
    stopHoldCleaner = startHoldCleaner();
    console.log("🧹 Hold cleaner service started successfully");

    // Graceful shutdown
    process.on("SIGINT", () => {
      if (stopHoldCleaner) stopHoldCleaner();
      mongoose.connection.close(() => {
        console.log("🔌 MongoDB connection closed");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
