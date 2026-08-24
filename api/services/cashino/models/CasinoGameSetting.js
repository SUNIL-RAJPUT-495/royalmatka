import mongoose from "mongoose";

const casinoGameSettingSchema = new mongoose.Schema(
  {
    game_uid: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    game_id: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      default: ""
    },
    provider: {
      type: String,
      default: ""
    },
    category: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

export const CasinoGameSetting = mongoose.model("CasinoGameSetting", casinoGameSettingSchema);
export default CasinoGameSetting;
