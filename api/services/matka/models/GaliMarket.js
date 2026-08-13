import mongoose from "mongoose";

const galiMarketSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  time: { type: String, required: true },
  jodi_result: { type: String, default: "**" },
  is_closed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("GaliMarket", galiMarketSchema);
