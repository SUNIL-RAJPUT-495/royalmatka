import mongoose from "mongoose";

// Helper to format date in IST (Asia/Kolkata) as YYYY-MM-DD
export const getISTDateString = (dateObj = new Date()) => {
  return new Date(dateObj).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

const bidSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true
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
      required: true,
      index: true
    },
    bidDate: {
      type: String,
      required: true,
      index: true,
      default: () => getISTDateString()
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
      default: "Pending",
      index: true
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

// Compound High-Performance Indexes for Microsecond Queries
bidSchema.index({ userMobile: 1, bidDate: -1, createdAt: -1 });
bidSchema.index({ marketName: 1, bidDate: -1, createdAt: -1 });
bidSchema.index({ userId: 1, createdAt: -1 });
bidSchema.index({ status: 1, createdAt: -1 });
bidSchema.index({ createdAt: -1 });
bidSchema.index({ bidDate: -1 });

export const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
