import mongoose from "mongoose";

const GameHistorySchema = new mongoose.Schema(
  {
    roundId: String,

    crashMultiplier: Number,

    startTime: Date,

    endTime: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("GameHistory", GameHistorySchema);