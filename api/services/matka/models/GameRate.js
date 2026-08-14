import mongoose from "mongoose";

const gameRateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, default: "" },
  value: { type: String, required: true, default: "1 ka 10" },
  category: { type: String, enum: ["Main Pana", "Starline", "Gali / Disawar", "Jackpot"], default: "Main Pana" },
  starred: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });

gameRateSchema.index({ active: 1, category: 1 });
gameRateSchema.index({ active: 1 });

export default mongoose.model("GameRate", gameRateSchema);
