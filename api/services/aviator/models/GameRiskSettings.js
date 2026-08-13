import mongoose from "mongoose";

const GameRiskSettingsSchema = new mongoose.Schema(
  {
    game: {
      type: String,
      default: "AVIATOR",
      unique: true,
    },

    // Manual Control
    forceCrash: {
      type: Boolean,
      default: false,
    },

    forceCrashMultiplier: {
      type: Number,
      default: null,
    },

    // Risk Management
    maxTotalBet: {
      type: Number,
      default: 500000,
    },

    maxLiability: {
      type: Number,
      default: 1000000,
    },

    autoProtection: {
      type: Boolean,
      default: true,
    },

    // Profit Target
    targetProfitPercent: {
      type: Number,
      default: 15,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "GameRiskSettings",
  GameRiskSettingsSchema
);