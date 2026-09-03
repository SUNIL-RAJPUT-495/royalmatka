import express from "express";
import {
  createUser,
  adminLogin,
  sendOtp,
  verifyOtp,
  loginUser,
  loginOtp,
  getUserProfile,
  addBankAccount,
  addUpiId,
  updateUserWallet,
  changeUserPassword,
  getAllUsers,
  getAdminViewUser,
  toggleUserStatus,
  adminAddFund,
  adminDeductFund,
  adminChangePassword,
  forceLogoutUser,
  deleteUserByAdmin,
  getAdminList,
  deleteAdmin,
  adminSelfChangePassword,
  getWelcomePopupConfig,
  updateWelcomePopupConfig,
  getAppTheme,
  updateAppTheme,
  requestAccountDeletion,
  getAccountDeletionRequests,
  approveAccountDeletionRequest,
  rejectAccountDeletionRequest,
  deleteAccountDeletionRequest,
  getAdminDashboardStats,
  saveFcmToken
} from "../controllers/auth.controller.js";
import { verifyToken, verifyAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Public Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/create-user", createUser);
router.post("/login-user", loginUser);
router.post("/login-otp", loginOtp);
router.post("/admin-login", adminLogin);
router.get("/get-welcome-popup", getWelcomePopupConfig);
router.get("/get-app-theme", getAppTheme);

// Protected User Routes
router.get("/get-user-profile", verifyToken, getUserProfile);
router.post("/add-bank-account", verifyToken, addBankAccount);
router.post("/add-upi-id", verifyToken, addUpiId);
router.post("/update-wallet", verifyAdmin, updateUserWallet);
router.post("/change-password", verifyToken, changeUserPassword);
router.post("/save-fcm-token", verifyToken, saveFcmToken);
router.post("/request-deletion", verifyToken, requestAccountDeletion);

// Protected Admin Account Deletion Routes
router.get("/get-deletion-requests", verifyAdmin, getAccountDeletionRequests);
router.post("/approve-deletion-request", verifyAdmin, approveAccountDeletionRequest);
router.post("/reject-deletion-request", verifyAdmin, rejectAccountDeletionRequest);
router.delete("/delete-deletion-request/:id", verifyAdmin, deleteAccountDeletionRequest);

// Protected Admin User Management Routes
router.get("/get-all-users", verifyAdmin, getAllUsers);
router.get("/get-admin-list", verifyAdmin, getAdminList);
router.get("/get-user/:id", verifyAdmin, getAdminViewUser);
router.get("/get-user", verifyAdmin, getAllUsers);
router.post("/toggle-status", verifyAdmin, toggleUserStatus);
router.post("/admin-add-fund", verifyAdmin, adminAddFund);
router.post("/admin-deduct-fund", verifyAdmin, adminDeductFund);
router.post("/admin-change-password", verifyAdmin, adminChangePassword);
router.post("/admin-self-change-password", verifyAdmin, adminSelfChangePassword);
router.post("/force-logout", verifyAdmin, forceLogoutUser);
router.delete("/delete-user/:id", verifyAdmin, deleteUserByAdmin);
router.post("/delete-user", verifyAdmin, deleteUserByAdmin);
router.delete("/delete-admin/:id", verifyAdmin, deleteAdmin);
router.get("/admin-dashboard-stats", verifyAdmin, getAdminDashboardStats);

// Protected Admin Config Routes
router.post("/update-welcome-popup", verifyAdmin, updateWelcomePopupConfig);
router.post("/update-app-theme", verifyAdmin, updateAppTheme);

export default router;

