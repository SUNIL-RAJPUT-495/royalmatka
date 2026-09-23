import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

import Admin from "./services/auth/models/Admin.js";
import User from "./services/auth/models/User.js";

const allPermissions = [
  "All Access",
  "All",
  "Game Management",
  "Starline",
  "Jackpot",
  "Financial",
  "User Management",
  "Reports & History",
  "Communication",
  "Settings",
  "Manage Admins",
  "Add Game",
  "Declare Results",
  "Auto Result",
  "Game Rates",
  "Aviator",
  "Casino",
  "Starline Games",
  "Jackpot Gali",
  "Payments",
  "Withdrawals",
  "Referrals",
  "Bonus",
  "Winners History",
  "Tips Panel",
  "Delete Requests",
  "Chat Messages",
  "Notifications",
  "UPI Settings",
  "Theme Settings",
  "Contact Settings",
  "How To Play",
  "Welcome Popup",
  "Admins & Access"
];

async function createDatabaseSuperAdmin() {
  try {
    let uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("🔴 MONGODB_URI is not defined in .env");
      process.exit(1);
    }
    if (uri.includes("<db_password>")) {
      const pass = process.env.MONGODB_PASSWORD || "";
      uri = uri.replace("<db_password>", encodeURIComponent(pass));
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(uri, { dbName: "royalmatka" });
    console.log("✅ MongoDB Connected successfully!");

    // Super Admin Account Details
    const superAdminUsername = "superadmin";
    const superAdminEmail = "superadmin@gmail.com";
    const superAdminMobile = "9999999999";
    const superAdminPassword = "superadmin123";

    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    // 1. Check or Upsert in Admin collection (Primary Admin Collection)
    let adminRecord = await Admin.findOne({
      $or: [
        { mobile: superAdminMobile },
        { email: superAdminEmail },
        { mobile: superAdminUsername },
        { name: "Super Admin" },
        { email: "admin@gmail.com" }
      ]
    });

    if (adminRecord) {
      adminRecord.name = "Super Admin";
      adminRecord.mobile = superAdminMobile;
      adminRecord.email = superAdminEmail;
      adminRecord.password = hashedPassword;
      adminRecord.rawPassword = superAdminPassword;
      adminRecord.role = "Super Admin";
      adminRecord.permissions = allPermissions;
      adminRecord.status = "Active";
      adminRecord.isForceLoggedOut = false;
      await adminRecord.save();
      console.log("👑 [Admin Collection] Super Admin updated with 100% full permissions!");
    } else {
      adminRecord = await Admin.create({
        name: "Super Admin",
        mobile: superAdminMobile,
        email: superAdminEmail,
        password: hashedPassword,
        rawPassword: superAdminPassword,
        role: "Super Admin",
        permissions: allPermissions,
        status: "Active"
      });
      console.log("👑 [Admin Collection] Fresh Super Admin created with 100% full permissions!");
    }

    // 2. Also ensure User collection has Super Admin for full compatibility
    let userRecord = await User.findOne({
      $or: [
        { mobile: superAdminMobile },
        { email: superAdminEmail },
        { mobile: "admin@gmail.com" }
      ]
    });

    if (userRecord) {
      userRecord.name = "Super Admin";
      userRecord.mobile = superAdminMobile;
      userRecord.email = superAdminEmail;
      userRecord.password = hashedPassword;
      userRecord.role = "Super Admin";
      userRecord.status = "Active";
      await userRecord.save();
      console.log("👑 [User Collection] Super Admin synced successfully!");
    } else {
      await User.create({
        name: "Super Admin",
        mobile: superAdminMobile,
        email: superAdminEmail,
        password: hashedPassword,
        balance: 10000000,
        role: "Super Admin",
        status: "Active"
      });
      console.log("👑 [User Collection] Super Admin created successfully!");
    }

    console.log("\n=======================================================");
    console.log("🎉 SUPER ADMIN ACCOUNT IS READY IN DATABASE!");
    console.log("=======================================================");
    console.log(`👤 Username / Mobile / Email : ${superAdminEmail} OR ${superAdminMobile} OR ${superAdminUsername}`);
    console.log(`🔑 Password                  : ${superAdminPassword}`);
    console.log(`🛡️  Role                      : Super Admin`);
    console.log(`⚡ Permissions               : ALL SECTIONS & MODULES UNLOCKED`);
    console.log("=======================================================\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("🔴 Error creating super admin:", error);
    process.exit(1);
  }
}

createDatabaseSuperAdmin();
