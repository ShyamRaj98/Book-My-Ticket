import mongoose from "mongoose";
import { startHoldCleaner } from "../services/holdsCleaner.js";

// const MONGODB_URI = `mongodb+srv://shyamdeepu1998_db_user:SmXraqiDppajpM0l@moviebooking.joshwfq.mongodb.net/MovieTicketBooking?retryWrites=true&w=majority&appName=movieBooking`;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    startHoldCleaner();
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }  
};

export default connectDB;
