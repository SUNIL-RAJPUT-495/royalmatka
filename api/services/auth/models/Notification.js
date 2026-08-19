import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    isGlobal: {
      type: Boolean,
      default: true
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    reads: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
