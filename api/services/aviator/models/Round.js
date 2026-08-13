import mongoose from "mongoose";

const RoundSchema = new mongoose.Schema(
  {
    roundId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["WAITING", "RUNNING", "CRASHED"],
      default: "WAITING",
      index: true,
    },

    crashMultiplier: {
      type: Number,
      required: true,
    },

    startTime: Date,

    endTime: Date,

    totalBets: {
      type: Number,
      default: 0,
    },

    totalBetAmount: {
      type: Number,
      default: 0,
    },

    totalPayout: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Round", RoundSchema);