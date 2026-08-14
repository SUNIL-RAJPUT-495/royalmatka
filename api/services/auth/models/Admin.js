import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    rawPassword: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["Super Admin", "Admin", "Sub Admin", "Operator"],
      default: "Sub Admin"
    },
    permissions: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active"
    },
    isForceLoggedOut: {
      type: Boolean,
      default: false
    },
    tokenVersion: {
      type: Number,
      default: 0
    },
    lastLoginIp: {
      type: String,
      default: ""
    },
    lastLoginDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

adminSchema.index({ role: 1 });
adminSchema.index({ status: 1 });

export const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
