import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  wallet: {
    withdrowalable: {
      type: Number,
      default: 0,
      description: "Money deposited or won by the user"
    },
    bonusBalance: {
      type: Number,
      default: 0,
      description: "Bonus money from referrals or signup"
    }
  },
  role: {
    type: String,
    enum: ["User", "Admin"],
    default: "User"
  },
  status: {
    type: String,
    enum: ["Active", "Blocked"],
    default: "Active"
  },
  registrationIp: {
    type: String,
    default: ""
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLoginIp: {
    type: String,
    default: ""
  },
  lastLoginDate: {
    type: Date,
    default: Date.now
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true
  },
  referredBy: {
    type: String,
    default: ""
  },
  totalReferrals: {
    type: Number,
    default: 0
  },
  referralEarnings: {
    type: Number,
    default: 0
  },
  bankAccounts: [
    {
      bankName: { type: String, trim: true },
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, uppercase: true, trim: true },
      isPrimary: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  upiIds: [
    {
      upiId: { type: String, trim: true },
      provider: { type: String, default: "UPI" },
      isPrimary: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
export default User;
