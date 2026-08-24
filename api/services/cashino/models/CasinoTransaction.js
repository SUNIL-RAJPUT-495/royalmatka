import mongoose from "mongoose";

const casinoTransactionSchema = new mongoose.Schema(
  {
    serial_number: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    game_id: {
      type: String,
      default: ""
    },
    game_uid: {
      type: String,
      default: ""
    },
    game_round: {
      type: String,
      default: ""
    },
    game_name: {
      type: String,
      default: "Casino Game"
    },
    member_account: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    bet_amount: {
      type: Number,
      default: 0
    },
    win_amount: {
      type: Number,
      default: 0
    },
    credit_amount: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["PROCESSED", "DUPLICATE", "FAILED"],
      default: "PROCESSED"
    }
  },
  { timestamps: true }
);

export const CasinoTransaction = mongoose.model("CasinoTransaction", casinoTransactionSchema);
export default CasinoTransaction;
