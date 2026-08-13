import mongoose from "mongoose";

const BetSchema = new mongoose.Schema(
  {
    roundId: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    betAmount: {
      type: Number,
      required: true,
    },

    autoCashout: Number,

    cashoutMultiplier: Number,

    payout: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "CASHED_OUT", "LOST"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Bet", BetSchema);