import mongoose from "mongoose";
import { seedAdmin } from "../seedAdmin.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "royalmatka"
    });
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    // Auto seed admin account upon DB connection
    await seedAdmin();
  } catch (error) {
    console.error(`🔴 MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
