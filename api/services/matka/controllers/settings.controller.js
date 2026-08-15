import SystemSettings from "../models/SystemSettings.js";
import User from "../../auth/models/User.js";
import mongoose from "mongoose";

export const getSystemSettings = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let settings = await SystemSettings.findOne();
      if (!settings) {
        settings = await SystemSettings.create({
          signupBonus: 50,
          referralBonus: 100,
          referredBonus: 50,
          maxReferrals: 10,
          isPercentage: false,
          minDeposit: 100,
          minWithdrawal: 500
        });
      }
      return res.status(200).json({ success: true, data: settings });
    }
    return res.status(200).json({
      success: true,
      data: {
        signupBonus: 50,
        referralBonus: 100,
        referredBonus: 50,
        maxReferrals: 10,
        isPercentage: false,
        minDeposit: 100,
        minWithdrawal: 500
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    const {
      signupBonus,
      referralBonus,
      referredBonus,
      maxReferrals,
      isPercentage,
      minDeposit,
      minWithdrawal,
      maxWithdrawal,
      welcomePopupText
    } = req.body;

    if (mongoose.connection.readyState === 1) {
      let settings = await SystemSettings.findOne();
      if (!settings) {
        settings = new SystemSettings({});
      }

      if (signupBonus !== undefined) settings.signupBonus = Number(signupBonus) || 0;
      if (referralBonus !== undefined) settings.referralBonus = Number(referralBonus) || 0;
      if (referredBonus !== undefined) settings.referredBonus = Number(referredBonus) || 0;
      if (maxReferrals !== undefined) settings.maxReferrals = Number(maxReferrals) || 0;
      if (isPercentage !== undefined) settings.isPercentage = Boolean(isPercentage);
      if (minDeposit !== undefined) settings.minDeposit = Number(minDeposit) || 0;
      if (minWithdrawal !== undefined) settings.minWithdrawal = Number(minWithdrawal) || 0;
      if (maxWithdrawal !== undefined) settings.maxWithdrawal = Number(maxWithdrawal) || 0;
      if (welcomePopupText !== undefined) settings.welcomePopupText = String(welcomePopupText);

      await settings.save();
      return res.status(200).json({
        success: true,
        message: "Bonus & Transaction settings updated successfully! 🎯",
        data: settings
      });
    }

    return res.status(200).json({ success: true, message: "Settings updated (Demo mode)" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBonusStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const activeUsersCount = await User.countDocuments();
      let settings = await SystemSettings.findOne().lean();
      if (!settings) settings = { signupBonus: 50, referralBonus: 100 };

      const totalSignupBonus = activeUsersCount * (settings.signupBonus || 50);
      const totalReferralBonus = Math.floor(activeUsersCount * 0.3) * (settings.referralBonus || 100);
      const totalBonusAwarded = totalSignupBonus + totalReferralBonus;

      return res.status(200).json({
        success: true,
        stats: {
          totalBonusAwarded,
          totalSignupBonus,
          totalReferralBonus,
          activeUsersCount
        }
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalBonusAwarded: 5000,
        totalSignupBonus: 3000,
        totalReferralBonus: 2000,
        activeUsersCount: 100
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
