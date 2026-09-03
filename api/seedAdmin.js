import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./services/auth/models/User.js";

dotenv.config();

export const seedAdmin = async () => {
  try {
    const adminEmail = "admin@gmail.com";
    const adminPass = "admin123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { mobile: adminEmail }, { mobile: "9999999999" }]
    });

    const hashedPassword = await bcrypt.hash(adminPass, 10);

    if (existingAdmin) {
      existingAdmin.email = adminEmail;
      existingAdmin.password = hashedPassword;
      existingAdmin.role = "Admin";
      await existingAdmin.save();
      console.log(`👑 Admin Account Verified & Updated in DB: ${adminEmail} / ${adminPass}`);
    } else {
      await User.create({
        name: "Super Admin",
        mobile: "admin@gmail.com",
        email: adminEmail,
        password: hashedPassword,
        balance: 1000000,
        role: "Admin",
        status: "Active"
      });
      console.log(`👑 New Admin Account Successfully Seeded in DB: ${adminEmail} / ${adminPass}`);
    }
  } catch (err) {
    console.error("🔴 Admin Seeding Error:", err.message);
  }
};

// Execute if run directly via `node seedAdmin.js`
if (process.argv[1]?.endsWith("seedAdmin.js")) {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("🔴 MONGODB_URI environment variable is missing.");
    process.exit(1);
  }
  mongoose.connect(MONGODB_URI, { dbName: "royalmatka" }).then(async () => {
    console.log("📡 Connected to MongoDB for seeding admin...");
    await seedAdmin();
    mongoose.connection.close();
    process.exit(0);
  }).catch((err) => {
    console.error("🔴 DB Connection Failed:", err.message);
    process.exit(1);
  });
}

export default seedAdmin;
