import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./services/auth/models/User.js";

dotenv.config();

export const seedAdmin = async () => {
  try {
    const adminEmail = "admin@gmail.com";
    const adminPass = "admin123";
    const hashedPassword = await bcrypt.hash(adminPass, 10);
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
      "Manage Admins"
    ];

    // 1. Seed or Update in Admin collection
    const AdminModel = mongoose.models.Admin || (await import("./services/auth/models/Admin.js")).Admin;
    if (AdminModel) {
      const existingAdminDoc = await AdminModel.findOne({
        $or: [
          { email: adminEmail },
          { mobile: adminEmail },
          { mobile: "9999999999" },
          { name: "Super Admin" },
          { name: "admin" }
        ]
      });

      if (existingAdminDoc) {
        existingAdminDoc.email = adminEmail;
        existingAdminDoc.password = hashedPassword;
        existingAdminDoc.rawPassword = adminPass;
        existingAdminDoc.role = "Super Admin";
        existingAdminDoc.permissions = allPermissions;
        existingAdminDoc.status = "Active";
        await existingAdminDoc.save();
        console.log(`👑 Super Admin Verified in Admin Collection: ${adminEmail} / ${adminPass}`);
      } else {
        await AdminModel.create({
          name: "Super Admin",
          mobile: "9999999999",
          email: adminEmail,
          password: hashedPassword,
          rawPassword: adminPass,
          role: "Super Admin",
          permissions: allPermissions,
          status: "Active"
        });
        console.log(`👑 New Super Admin Successfully Seeded in Admin Collection: ${adminEmail} / ${adminPass}`);
      }
    }

    // 2. Also ensure User collection has Super Admin for backward compatibility
    const existingUser = await User.findOne({
      $or: [{ email: adminEmail }, { mobile: adminEmail }, { mobile: "9999999999" }]
    });

    if (existingUser) {
      existingUser.email = adminEmail;
      existingUser.password = hashedPassword;
      existingUser.role = "Super Admin";
      existingUser.status = "Active";
      await existingUser.save();
      console.log(`👑 Admin Account Verified in User DB: ${adminEmail}`);
    } else {
      await User.create({
        name: "Super Admin",
        mobile: "9999999999",
        email: adminEmail,
        password: hashedPassword,
        balance: 1000000,
        role: "Super Admin",
        status: "Active"
      });
      console.log(`👑 New Admin Account Successfully Seeded in User DB: ${adminEmail} / ${adminPass}`);
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
