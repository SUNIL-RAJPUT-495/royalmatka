import mongoose from "mongoose";

const GameSettingsSchema = new mongoose.Schema(
  {
    game: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      default: "AVIATOR",
      enum: ["AVIATOR"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    targetProfitPercent: {
      type: Number,
      required: true,
      default: 15,
      min: 0,
      max: 100,
    },

    minCrash: {
      type: Number,
      required: true,
      default: 1.01,
      min: 1.01,
    },

    maxCrash: {
      type: Number,
      required: true,
      default: 100,
      min: 1.01,
    },

    autoMode: {
      type: Boolean,
      default: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("GameSettings", GameSettingsSchema);