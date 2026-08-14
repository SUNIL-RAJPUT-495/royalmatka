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

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/imb-webhook", imbWebhook);
router.post("/manual-deposit", createManualDeposit);
router.get("/get-settings", getPaymentSettings);
router.post("/update-settings", updatePaymentSettings);
router.get("/user-transactions", getUserTransactions);
router.get("/all-transactions", getAllTransactionsAdmin);
router.post("/update-status", updateTransactionStatusAdmin);
router.post("/request-withdrawal", requestWithdrawal);
router.get("/all-withdrawals", getAllWithdrawalsAdmin);
router.post("/update-withdrawal-status", updateWithdrawalStatusAdmin);

export default router;
