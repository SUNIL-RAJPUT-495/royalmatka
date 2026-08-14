import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    userName: {
      type: String,
      default: ""
    },
    userMobile: {
      type: String,
      required: true,
      index: true
    },
    marketName: {
      type: String,
      required: true,
      index: true
    },
    gameMode: {
      type: String,
      required: true
    },
    session: {
      type: String,
      enum: ["Open", "Close", "N/A"],
      default: "Open"
    },
    digit: {
      type: String,
      default: ""
    },
    pana: {
      type: String,
      default: ""
    },
    jodi: {
      type: String,
      default: ""
    },
    openPana: {
      type: String,
      default: ""
    },
    closePana: {
      type: String,
      default: ""
    },
    openDigit: {
      type: String,
      default: ""
    },
    closeDigit: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: ""
    },
    points: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: ["Pending", "Won", "Lost"],
      default: "Pending"
    },
    winAmount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
