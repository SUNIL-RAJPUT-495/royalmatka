import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["Deposit", "Withdrawal", "Game", "Win", "Bonus"],
    default: "Deposit"
  },
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    default: "Manual" // "IMB", "Manual", "PayFromUPI"
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  utrNumber: {
    type: String,
    default: ""
  },
  accountDetails: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Confirmed"],
    default: "Pending"
  },
}, { timestamps: true });

paymentTransactionSchema.index({ type: 1, createdAt: -1 });
paymentTransactionSchema.index({ status: 1, type: 1 });
paymentTransactionSchema.index({ userId: 1, type: 1 });
paymentTransactionSchema.index({ utrNumber: 1 });

export const PaymentTransaction = mongoose.model("PaymentTransaction", paymentTransactionSchema);
export default PaymentTransaction;
