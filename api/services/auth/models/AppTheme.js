import mongoose from "mongoose";

const appThemeSchema = new mongoose.Schema(
  {
    themeId: {
      type: String,
      required: true,
      default: "orange-noir"
    },
    themeData: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

appThemeSchema.index({ themeId: 1 });

export const AppThemeConfig = mongoose.model("AppThemeConfig", appThemeSchema);
export default AppThemeConfig;
