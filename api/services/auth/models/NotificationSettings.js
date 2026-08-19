import mongoose from "mongoose";

const notificationSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "admin"
    },
    all: { type: Boolean, default: true },
    general: { type: Boolean, default: true },
    chat: { type: Boolean, default: true },
    calls: { type: Boolean, default: true },
    broadcasts: { type: Boolean, default: true },
    resultDeclared: { type: Boolean, default: true },
    mainGame: { type: Boolean, default: false },
    starline: { type: Boolean, default: false },
    jackpot: { type: Boolean, default: false },
    jackpotGali: { type: Boolean, default: false },
    winLoss: { type: Boolean, default: true },
    deposit: { type: Boolean, default: true },
    withdrawal: { type: Boolean, default: true },
    funds: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("NotificationSettings", notificationSettingsSchema);
