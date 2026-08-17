import mongoose from "mongoose";

const declaredResultHistorySchema = new mongoose.Schema({
  market_name: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String, // YYYY-MM-DD (IST)
    required: true,
    index: true
  },
  open_pana: {
    type: String,
    default: "***"
  },
  close_pana: {
    type: String,
    default: "***"
  },
  jodi_result: {
    type: String,
    default: "**"
  }
}, { timestamps: true });

declaredResultHistorySchema.index({ market_name: 1, date: -1 });

export const DeclaredResultHistory = mongoose.model("DeclaredResultHistory", declaredResultHistorySchema);
export default DeclaredResultHistory;
