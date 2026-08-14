import mongoose from "mongoose";

const marketSchema = new mongoose.Schema({
  market_name: { type: String, required: true, trim: true },
  open_time: { type: String, required: true },
  close_time: { type: String, required: true },
  open_result_time: { type: String, default: "" },
  close_result_time: { type: String, default: "" },
  off_days: { type: [String], default: [] },
  is_closed: { type: Boolean, default: false },
  status: { type: String, default: "Active" },
  result_open: { type: String, default: "***" },
  result_close: { type: String, default: "***" },
  jodi_result: { type: String, default: "**" },
}, { timestamps: true });

export default mongoose.model("Market", marketSchema);
