import mongoose from "mongoose";

const fcmTokenSchema = new mongoose.Schema(
  {
    fcmToken: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      default: null
    },
    mobile: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("FcmToken", fcmTokenSchema);
