import express from "express";
import { createUser, adminLogin, sendOtp, verifyOtp, loginUser, loginOtp } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/create-user", createUser);
router.post("/login-user", loginUser);
router.post("/login-otp", loginOtp);
router.post("/admin-login", adminLogin);

export default router;
