import express from "express";
import {
  createOrder,
  verifyPayment,
  imbWebhook,
  createManualDeposit,
  getPaymentSettings,
  updatePaymentSettings,
  getUserTransactions
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/imb-webhook", imbWebhook);
router.post("/manual-deposit", createManualDeposit);
router.get("/get-settings", getPaymentSettings);
router.post("/update-settings", updatePaymentSettings);
router.get("/user-transactions", getUserTransactions);

export default router;
