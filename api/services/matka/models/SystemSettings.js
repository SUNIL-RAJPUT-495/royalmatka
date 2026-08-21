import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    signupBonus: { type: Number, default: 50 },
    referralBonus: { type: Number, default: 100 },
    referredBonus: { type: Number, default: 50 },
    maxReferrals: { type: Number, default: 10 },
    isPercentage: { type: Boolean, default: false },
    minDeposit: { type: Number, default: 100 },
    minWithdrawal: { type: Number, default: 500 },
    maxWithdrawal: { type: Number, default: 50000 },
    welcomePopupText: { type: String, default: "Welcome to SanwariyaBoss!" }
  },
  { timestamps: true }
);

export const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);
export default SystemSettings;
