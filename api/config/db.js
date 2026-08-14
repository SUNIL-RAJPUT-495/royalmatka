import mongoose from "mongoose";
import { seedAdmin } from "../seedAdmin.js";

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || "";
    if (uri.includes("<db_password>")) {
      const pass = process.env.MONGODB_PASSWORD || "AhbKm5hvBu72cyYc";
      uri = uri.replace("<db_password>", encodeURIComponent(pass));
    }

    const conn = await mongoose.connect(uri, {
      dbName: "royalmatka"
    });
    console.log(`📡 MongoDB Connected Successfully: ${conn.connection.host}`);
    // Auto seed admin account upon DB connection
    await seedAdmin();
  } catch (error) {
    console.error(`🔴 MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
