import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
    required: false,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 10000 // default balance 10,000 INR
  },
  role: {
    type: String,
    enum: ["User", "Admin"],
    default: "User"
  },
  status: {
    type: String,
    enum: ["Active", "Blocked"],
    default: "Active"
  }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
export default User;
