import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["Deposit", "Withdrawal"],
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
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  remark: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export const PaymentTransaction = mongoose.model("PaymentTransaction", paymentTransactionSchema);
export default PaymentTransaction;
