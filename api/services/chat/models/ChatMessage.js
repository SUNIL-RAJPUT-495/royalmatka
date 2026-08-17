import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    sender: {
      type: String,
      enum: ["user", "admin"],
      required: true
    },
    senderName: {
      type: String,
      default: ""
    },
    adminId: {
      type: String,
      default: ""
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    readByAdmin: {
      type: Boolean,
      default: false
    },
    readByUser: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

chatMessageSchema.index({ userId: 1, createdAt: 1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;
