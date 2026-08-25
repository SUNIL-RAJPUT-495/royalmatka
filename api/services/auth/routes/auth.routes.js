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
router.post("/change-password", changeUserPassword);
router.post("/save-fcm-token", saveFcmToken);

// Account Deletion Routes
router.post("/request-deletion", requestAccountDeletion);
router.get("/get-deletion-requests", getAccountDeletionRequests);
router.post("/approve-deletion-request", approveAccountDeletionRequest);
router.post("/reject-deletion-request", rejectAccountDeletionRequest);
router.delete("/delete-deletion-request/:id", deleteAccountDeletionRequest);

// Admin User Management Routes
router.get("/get-all-users", getAllUsers);
router.get("/get-admin-list", getAdminList);
router.get("/get-user/:id", getAdminViewUser);
router.get("/get-user", getAllUsers);
router.post("/toggle-status", toggleUserStatus);
router.post("/admin-add-fund", adminAddFund);
router.post("/admin-deduct-fund", adminDeductFund);
router.post("/admin-change-password", adminChangePassword);
router.post("/admin-self-change-password", adminSelfChangePassword);
router.post("/force-logout", forceLogoutUser);
router.delete("/delete-user/:id", deleteUserByAdmin);
router.post("/delete-user", deleteUserByAdmin);
router.delete("/delete-admin/:id", deleteAdmin);
router.get("/admin-dashboard-stats", getAdminDashboardStats);

// Welcome Popup Config Routes
router.get("/get-welcome-popup", getWelcomePopupConfig);
router.post("/update-welcome-popup", updateWelcomePopupConfig);

// App Theme Settings Routes
router.get("/get-app-theme", getAppTheme);
router.post("/update-app-theme", updateAppTheme);

export default router;

