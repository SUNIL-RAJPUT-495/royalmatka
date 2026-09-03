import express from "express";
import {
  createOrder,
  verifyPayment,
  imbWebhook,
  createManualDeposit,
  getPaymentSettings,
  updatePaymentSettings,
  getUserTransactions,
  getAllTransactionsAdmin,
  updateTransactionStatusAdmin,
  requestWithdrawal,
  getAllWithdrawalsAdmin,
  updateWithdrawalStatusAdmin
} from "../controllers/payment.controller.js";
import { verifyToken, verifyAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Webhook & Public Payment Settings
router.post("/imb-webhook", imbWebhook);
router.get("/get-settings", getPaymentSettings);

// User Protected Payment Routes
router.post("/create-order", verifyToken, createOrder);
router.post("/verify-payment", verifyToken, verifyPayment);
router.post("/manual-deposit", verifyToken, createManualDeposit);
router.get("/user-transactions", verifyToken, getUserTransactions);
router.post("/request-withdrawal", verifyToken, requestWithdrawal);

// Admin Protected Payment Routes
router.post("/update-settings", verifyAdmin, updatePaymentSettings);
router.get("/all-transactions", verifyAdmin, getAllTransactionsAdmin);
router.post("/update-status", verifyAdmin, updateTransactionStatusAdmin);
router.get("/all-withdrawals", verifyAdmin, getAllWithdrawalsAdmin);
router.post("/update-withdrawal-status", verifyAdmin, updateWithdrawalStatusAdmin);

export default router;
