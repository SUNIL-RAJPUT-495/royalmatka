import mongoose from "mongoose";

const welcomePopupSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true
    },
    eliteLabel: {
      type: String,
      default: "Elite Experience"
    },
    headingLine: {
      type: String,
      default: "WELCOME TO"
    },
    brandName: {
      type: String,
      default: "SanwariyaBoss"
    },
    trustBadgeText: {
      type: String,
      default: "INDIA'S #1 TRUSTED APP"
    },
    ratesHeading: {
      type: String,
      default: "Live Payout Rates"
    },
    ratesSubLabel: {
      type: String,
      default: "10 Ka Rate"
    },
    ctaButtonText: {
      type: String,
      default: "Start Playing Now"
    },
    footerLine1: {
      type: String,
      default: "Authorized Gaming Environment"
    },
    footerLine2: {
      type: String,
      default: "Target your success with SanwariyaBoss 🎯"
    },
    heroDescription: {
      type: String,
      default: "Play safely with trusted rates and transparent payout rules."
    },
    ratesDescription: {
      type: String,
      default: "Below rates are for quick reference. Please verify before placing bids."
    },
    highlights: [
      {
        type: String
      }
    ],
    notes: [
      {
        type: String
      }
    ],
    statCards: [
      {
        label: { type: String },
        value: { type: String },
        color: { type: String, default: "emerald" }
      }
    ]
  },
  { timestamps: true }
);

welcomePopupSchema.index({ enabled: 1 });

export const WelcomePopupConfig = mongoose.model("WelcomePopupConfig", welcomePopupSchema);
export default WelcomePopupConfig;
