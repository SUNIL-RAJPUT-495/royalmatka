import mongoose from "mongoose";

const starlineMarketSchema = new mongoose.Schema({
  time: { type: String, required: true },
  pana_result: { type: String, default: "***" },
  digit_result: { type: String, default: "*" },
  display_result: { type: String, default: "***-*" },
  is_closed: { type: Boolean, default: false },
  category: { type: String, enum: ["Starline", "Jackpot"], default: "Starline" }
}, { timestamps: true });

export default mongoose.model("StarlineMarket", starlineMarketSchema);
