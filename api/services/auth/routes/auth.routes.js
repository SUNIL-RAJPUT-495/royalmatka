import express from "express";
import { createUser, adminLogin, sendOtp, verifyOtp, loginUser, loginOtp, getUserProfile, addBankAccount, addUpiId, updateUserWallet } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/create-user", createUser);
router.post("/login-user", loginUser);
router.post("/login-otp", loginOtp);
router.post("/admin-login", adminLogin);
router.get("/get-user-profile", getUserProfile);
router.post("/add-bank-account", addBankAccount);
router.post("/add-upi-id", addUpiId);
router.post("/update-wallet", updateUserWallet);

export default router;
