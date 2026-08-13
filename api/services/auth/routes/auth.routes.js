import express from "express";
import { createUser, adminLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/create-user", createUser);
router.post("/admin-login", adminLogin);
router.post("/login-user", adminLogin);

export default router;
