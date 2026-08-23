import mongoose from "mongoose";

const marketSchema = new mongoose.Schema({
  market_name: { type: String, required: true, trim: true },
  open_time: { type: String, required: true },
  close_time: { type: String, required: true },
  off_days: { type: [String], default: [] },
  is_closed: { type: Boolean, default: false },
  result_open: { type: String, default: "***" },
  result_close: { type: String, default: "***" },
  jodi_result: { type: String, default: "**" },
  result_date: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Market", marketSchema);
