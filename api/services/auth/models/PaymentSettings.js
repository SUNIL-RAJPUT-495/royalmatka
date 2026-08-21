import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema({
  upiId: {
    type: String,
    default: "sanwariyaboss@ybl"
  },
  displayName: {
    type: String,
    default: "Sanwariya Boss"
  },
  qrCodeUrl: {
    type: String,
    default: ""
  },
  activeFundSystem: {
    type: String,
    enum: ["IMB", "PayFromUPI", "Manual"],
    default: "Manual"
  },
  imbToken: {
    type: String,
    default: ""
  },
  payFromUpiToken: {
    type: String,
    default: ""
  },
  minAmount: {
    type: Number,
    default: 100
  },
  maxAmount: {
    type: Number,
    default: 20000
  },
  quickAmounts: {
    type: [Number],
    default: [100, 300, 500, 1000, 2000, 5000, 10000]
  },
  isOtpEnabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const PaymentSettings = mongoose.model("PaymentSettings", paymentSettingsSchema);
export default PaymentSettings;
