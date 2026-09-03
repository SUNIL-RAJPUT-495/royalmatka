import mongoose from "mongoose";
import { seedAdmin } from "../seedAdmin.js";
import { seedChartDataIfEmpty } from "../services/matka/utils/chartSeeder.js";

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || "";
    if (uri.includes("<db_password>")) {
      const pass = process.env.MONGODB_PASSWORD || "";
      uri = uri.replace("<db_password>", encodeURIComponent(pass));
    }

    const conn = await mongoose.connect(uri, {
      dbName: "royalmatka"
    });
    console.log(`📡 MongoDB Connected Successfully: ${conn.connection.host}`);
    // Auto seed admin account and chart history upon DB connection
    await seedAdmin();
    await seedChartDataIfEmpty();
  } catch (error) {
    console.error(`🔴 MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
