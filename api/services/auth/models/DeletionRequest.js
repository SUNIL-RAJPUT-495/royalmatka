import mongoose from "mongoose";

const deletionRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  userId: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  reason: {
    type: String,
    default: "User requested account deletion",
    trim: true
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  actionDate: {
    type: Date
  },
  processedBy: {
    type: String,
    default: ""
  }
}, { timestamps: true });

deletionRequestSchema.index({ mobile: 1 });
deletionRequestSchema.index({ status: 1 });
deletionRequestSchema.index({ createdAt: -1 });

export const DeletionRequest = mongoose.model("DeletionRequest", deletionRequestSchema);
export default DeletionRequest;
