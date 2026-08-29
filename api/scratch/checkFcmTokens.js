import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../services/auth/models/User.js";
import FcmToken from "../services/auth/models/FcmToken.js";

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB!");

    const userTokens = await User.find({ fcmToken: { $exists: true, $ne: "" } }).select("mobile username fcmToken");
    console.log(`User collection has ${userTokens.length} users with FCM tokens.`);
    userTokens.forEach(u => console.log(`User: ${u.mobile || u.username} -> ${u.fcmToken?.substring(0, 30)}...`));

    const fcmDocs = await FcmToken.find({});
    console.log(`FcmToken collection has ${fcmDocs.length} total tokens.`);
    fcmDocs.forEach(f => console.log(`FcmToken Doc: mobile=${f.mobile}, userId=${f.userId} -> ${f.fcmToken?.substring(0, 30)}...`));

    process.exit(0);
  } catch (err) {
    console.error("Check Error:", err);
    process.exit(1);
  }
};

check();
