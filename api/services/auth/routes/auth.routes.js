import express from "express";
import { createUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/create-user", createUser);

export default router;
