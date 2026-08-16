import User from "../models/User.js";
import SystemSettings from "../../matka/models/SystemSettings.js";
import mongoose from "mongoose";

export const getReferralStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find().sort({ createdAt: -1 }).lean();
      const settings = (await SystemSettings.findOne().lean()) || { referralBonus: 100 };

      // Map users who were referred by someone or who referred others
      const referralList = [];
      let totalEarnings = 0;
      let flaggedCount = 0;

      // Build user map for fast lookup
      const userMap = {};
      users.forEach(u => {
        const idKey = u._id.toString();
        userMap[idKey] = u;
        if (u.mobile) userMap[u.mobile.trim()] = u;
        if (u.referralCode) userMap[u.referralCode.trim().toUpperCase()] = u;
      });

      users.forEach(u => {
        if (u.referredBy) {
          const referrer = userMap[u.referredBy.trim().toUpperCase()] || userMap[u.referredBy.trim()];
          const bonusAmt = Number(settings.referralBonus) || 100;
          totalEarnings += bonusAmt;

          // Check if flagged (e.g. same IP or mobile prefix)
          const isFlagged = Boolean(
            (referrer && referrer.registrationIp && u.registrationIp && referrer.registrationIp === u.registrationIp) ||
            (referrer && referrer.mobile && u.mobile && referrer.mobile.slice(0, 6) === u.mobile.slice(0, 6))
          );

          if (isFlagged) flaggedCount++;

          referralList.push({
            id: u._id.toString(),
            referrerName: referrer ? (referrer.name || "User " + referrer.mobile) : "Unknown Referrer",
            referrerMobile: referrer ? (referrer.mobile || "N/A") : (u.referredBy || "N/A"),
            referrerCode: referrer ? (referrer.referralCode || ("RM" + referrer.mobile?.slice(-4))) : u.referredBy,
            referredName: u.name || ("User " + (u.mobile || "")),
            referredMobile: u.mobile || "N/A",
            date: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            bonusEarned: bonusAmt,
            status: "Completed",
            isFlagged: isFlagged
          });
        }
      });

      return res.status(200).json({
        success: true,
        referrals: referralList,
        summary: {
          totalReferrals: referralList.length,
          totalEarnings,
          flaggedCount
        }
      });
    }

    return res.status(200).json({
      success: true,
      referrals: [],
      summary: { totalReferrals: 0, totalEarnings: 0, flaggedCount: 0 }
    });
  } catch (error) {
    console.error("getReferralStats Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
