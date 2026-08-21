import axios from "axios";
import mongoose from "mongoose";
import User from "../models/User.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import PaymentSettings from "../models/PaymentSettings.js";

const getCleanUrl = (baseUrl, path) => {
  if (!baseUrl) return "";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

// ==========================================
// 1. IMB CREATE ORDER
// ==========================================
export const createOrder = async (req, res) => {
  try {
    const { amount, mobile, userId } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required."
      });
    }

    let user = null;
    if (mongoose.connection.readyState === 1) {
      if (userId) user = await User.findById(userId);
      else if (mobile) user = await User.findOne({ mobile });
      else user = await User.findOne({ role: { $ne: "Admin" } });
    }

    if (!user) {
      user = { _id: "demo_user_id", name: "User", mobile: mobile || "9999999999", email: "" };
    }

    const transactionId = "TXN" + Date.now() + Math.floor(Math.random() * 1000);

    if (mongoose.connection.readyState === 1) {
      await PaymentTransaction.create({
        userId: user._id,
        type: 'Deposit',
        amount: Number(amount),
        method: 'IMB',
        transactionId: transactionId,
        status: 'Pending'
      });
    }

    const redirectUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/add-funds`
      : `http://localhost:5173/add-funds`;

    const imbSecret = process.env.IMB_CLIENT_SECRET || "demo_imb_secret";
    const payload = new URLSearchParams({
      customer_mobile: String(user.mobile).replace(/\D/g, ""),
      user_token: imbSecret,
      amount: String(amount),
      order_id: transactionId,
      customer_name: user.name || "Customer",
      remark1: user.email || 'N/A',
      remark2: 'Deposit',
      redirect_url: redirectUrl,
    });

    const imbBaseUrl = process.env.IMB_BASE_URL || "https://imb.pay";
    const IMB_CREATE_ORDER_URL = getCleanUrl(imbBaseUrl, "/api/create-order");

    if (process.env.IMB_BASE_URL) {
      const response = await axios.post(IMB_CREATE_ORDER_URL, payload.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const data = response.data;
      console.log("IMB Final Response:", data);

      if (data && data.status === true && data.result) {
        return res.status(200).json({
          success: true,
          message: "Order Created Successfully",
          payment_url: data.result.payment_url || data.result.paytm_link || data.result.bhim_link || data.result.check_link,
          orderId: transactionId
        });
      }
    }

    // Fallback response for testing if gateway URL not configured
    return res.status(200).json({
      success: true,
      message: "Order Created Successfully (Demo Link)",
      payment_url: `https://upi.link/pay?pa=sanwariyaboss@ybl&am=${amount}&tn=${transactionId}`,
      orderId: transactionId
    });

  } catch (error) {
    console.error("IMB Create Order Error:", error.response?.data || error.message);
    const errorDetail = error.response?.data?.message || error.response?.data || error.message;

    res.status(500).json({
      success: false,
      message: "Payment initialization failed.",
      error: errorDetail
    });
  }
};

// ==========================================
// 2. VERIFY PAYMENT 
// ==========================================
export const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ success: false, message: "Transaction ID missing" });
    }

    if (mongoose.connection.readyState === 1) {
      const transaction = await PaymentTransaction.findOne({ transactionId });
      if (!transaction) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }

      const imbSecret = process.env.IMB_CLIENT_SECRET || "demo_imb_secret";
      const statusPayload = {
        user_token: imbSecret,
        order_id: transactionId
      };

      let IMB_STATUS_URL = process.env.IMB_STATUS_URL;
      if (!IMB_STATUS_URL && process.env.IMB_BASE_URL) {
        IMB_STATUS_URL = getCleanUrl(process.env.IMB_BASE_URL, "/api/check-order-status");
      }

      if (IMB_STATUS_URL) {
        const response = await axios.post(IMB_STATUS_URL, statusPayload);
        const data = response.data;

        if (data.status === "SUCCESS" || data.status === "COMPLETED") {
          if (transaction.status !== "Approved") {
            transaction.accountDetails = data.upi_txn_id || data.bank_txn_id || transactionId;
            transaction.status = "Approved";
            await transaction.save();

            await creditUserDepositWithExposure(transaction.userId, transaction.amount);

            return res.status(200).json({
              success: true,
              message: "Payment Verified Successfully"
            });
          } else {
            return res.status(200).json({ success: true, message: "Already verified" });
          }
        }
      }
    }

    return res.status(200).json({ success: true, message: "Payment pending verification" });

  } catch (error) {
    console.error("Verify Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Internal Server Error during verification" });
  }
};

// ==========================================
// 3. IMB WEBHOOK
// ==========================================
export const imbWebhook = async (req, res) => {
  try {
    const data = req.body;
    console.log("🔥 Webhook Received from IMB:", data);

    const transactionId = data.client_txn_id || data.order_id;

    if (!transactionId) {
      return res.status(400).send("Transaction ID missing");
    }

    if (mongoose.connection.readyState === 1) {
      const transaction = await PaymentTransaction.findOne({ transactionId });
      if (!transaction) {
        return res.status(404).send("Transaction not found");
      }

      if ((data.status === "SUCCESS" || data.status === "COMPLETED") && transaction.status !== "Approved") {
        transaction.accountDetails = data.upi_txn_id || data.bank_txn_id || transactionId;
        transaction.status = "Approved";
        await transaction.save();

        await creditUserDepositWithExposure(transaction.userId, transaction.amount);
        console.log(`✅ Transaction ${transactionId} marked as APPROVED via Webhook!`);
      } else if (data.status === "FAILED" && transaction.status !== "Approved") {
        transaction.status = "Rejected";
        await transaction.save();
        console.log(`❌ Transaction ${transactionId} marked as REJECTED via Webhook!`);
      }
    }

    return res.status(200).send("Webhook Received Successfully");

  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).send("Webhook processing failed");
  }
};

// ==========================================
// 4. MANUAL DEPOSIT REQUEST (QR / UPI + UTR)
// ==========================================
export const createManualDeposit = async (req, res) => {
  try {
    const { amount, utrNumber, mobile, userId } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }
    if (!utrNumber || utrNumber.trim().length < 4) {
      return res.status(400).json({ success: false, message: "Valid UTR / Reference Transaction ID is required" });
    }

    const cleanUtr = utrNumber.trim();

    if (mongoose.connection.readyState === 1) {
      // 1. Duplicate UTR Number Validation
      const existingTxn = await PaymentTransaction.findOne({ utrNumber: cleanUtr });
      if (existingTxn) {
        return res.status(400).json({
          success: false,
          message: "This UTR / Transaction Reference Number has already been submitted before! Duplicate UTR is not allowed."
        });
      }

      let query = {};
      if (userId) query._id = userId;
      else if (mobile) query.mobile = mobile;
      else query = { role: { $ne: "Admin" } };

      const user = await User.findOne(query);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      const transactionId = "TXN" + Date.now() + Math.floor(Math.random() * 1000);

      const transaction = await PaymentTransaction.create({
        userId: user._id,
        type: 'Deposit',
        amount: Number(amount),
        method: 'Manual UPI',
        transactionId: transactionId,
        utrNumber: cleanUtr,
        status: 'Pending'
      });

      return res.status(201).json({
        success: true,
        message: "Manual deposit request submitted successfully! 🎉 Admin will verify UTR and approve shortly.",
        transaction
      });
    }

    return res.status(201).json({
      success: true,
      message: "Deposit request submitted successfully! Admin will verify shortly."
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. PAYMENT SETTINGS (GET & UPDATE)
// ==========================================
export const getPaymentSettings = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let settings = await PaymentSettings.findOne().sort({ updatedAt: -1 });
      if (!settings) {
        settings = await PaymentSettings.create({
          upiId: "sanwariyaboss@ybl",
          displayName: "Sanwariya Boss",
          qrCodeUrl: "",
          activeFundSystem: "Manual",
          minAmount: 100,
          maxAmount: 20000,
          quickAmounts: [100, 300, 500, 1000, 5000, 10000]
        });
      }
      return res.status(200).json({ success: true, settings });
    }

    return res.status(200).json({
      success: true,
      settings: {
        upiId: "sanwariyaboss@ybl",
        displayName: "Sanwariya Boss",
        qrCodeUrl: "",
        activeFundSystem: "Manual",
        minAmount: 100,
        maxAmount: 20000,
        quickAmounts: [100, 300, 500, 1000, 5000, 10000]
      }
    });
  } catch (error) {
    console.error("getPaymentSettings Error:", error);
    return res.status(200).json({
      success: true,
      settings: {
        upiId: "sanwariyaboss@ybl",
        displayName: "Sanwariya Boss",
        qrCodeUrl: "",
        activeFundSystem: "Manual",
        minAmount: 100,
        maxAmount: 20000,
        quickAmounts: [100, 300, 500, 1000, 5000, 10000]
      }
    });
  }
};

export const updatePaymentSettings = async (req, res) => {
  try {
    const { upiId, displayName, qrCodeUrl, activeFundSystem, imbToken, payFromUpiToken, minAmount, maxAmount, quickAmounts, isOtpEnabled } = req.body;

    if (mongoose.connection.readyState === 1) {
      let settings = await PaymentSettings.findOne().sort({ updatedAt: -1 });
      if (!settings) {
        settings = new PaymentSettings();
      }

      if (upiId !== undefined) settings.upiId = String(upiId).trim();
      if (displayName !== undefined) settings.displayName = String(displayName).trim();
      if (qrCodeUrl !== undefined) settings.qrCodeUrl = qrCodeUrl;
      if (activeFundSystem !== undefined) settings.activeFundSystem = activeFundSystem;
      if (imbToken !== undefined) settings.imbToken = imbToken;
      if (payFromUpiToken !== undefined) settings.payFromUpiToken = payFromUpiToken;
      if (minAmount !== undefined && !isNaN(minAmount)) settings.minAmount = Number(minAmount);
      if (maxAmount !== undefined && !isNaN(maxAmount)) settings.maxAmount = Number(maxAmount);
      if (isOtpEnabled !== undefined) settings.isOtpEnabled = Boolean(isOtpEnabled);
      if (quickAmounts !== undefined) {
        if (Array.isArray(quickAmounts)) {
          settings.quickAmounts = quickAmounts.map(Number).filter(n => !isNaN(n));
        } else if (typeof quickAmounts === 'string') {
          settings.quickAmounts = quickAmounts.split(',').map(n => Number(n.trim())).filter(n => !isNaN(n));
        }
      }

      await settings.save();
      return res.status(200).json({ success: true, message: "Payment settings updated successfully! 🎉", settings });
    }

    return res.status(200).json({ success: true, message: "Payment settings updated!" });
  } catch (error) {
    console.error("updatePaymentSettings Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserTransactions = async (req, res) => {
  try {
    const { userId, mobile } = req.query;

    if (mongoose.connection.readyState === 1) {
      let user = null;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId);
      }
      if (!user && mobile) {
        user = await User.findOne({ mobile });
      }

      let transactions = [];
      if (user) {
        transactions = await PaymentTransaction.find({
          $or: [{ userId: user._id }, { userId: user._id.toString() }]
        }).sort({ createdAt: -1 });
      } else {
        transactions = await PaymentTransaction.find().sort({ createdAt: -1 }).limit(50);
      }

      return res.status(200).json({ success: true, transactions });
    }

    return res.status(200).json({ success: true, transactions: [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. ADMIN: GET ALL TRANSACTIONS
// ==========================================
export const getAllTransactionsAdmin = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const transactions = await PaymentTransaction.find({ type: "Deposit" })
        .populate("userId", "name mobile email wallet balance")
        .sort({ createdAt: -1 });

      const allUsers = await User.find({}).lean();
      const userMap = new Map();
      allUsers.forEach(u => {
        if (u._id) userMap.set(u._id.toString(), u);
        if (u.mobile) userMap.set(u.mobile.toString().trim(), u);
      });

      const formatted = transactions.map(tx => {
        const doc = tx.toObject();

        let userObj = doc.userId;
        let matchedUser = null;

        if (userObj && typeof userObj === 'object' && userObj._id) {
          matchedUser = userMap.get(userObj._id.toString()) || userObj;
        }

        if (!matchedUser) {
          const rawId = typeof doc.userId === 'string'
            ? doc.userId
            : (doc.userId?._id?.toString() || doc.userId?.toString());
          if (rawId && userMap.has(rawId.toString())) {
            matchedUser = userMap.get(rawId.toString());
          }
        }

        if (!matchedUser && doc.accountDetails) {
          const matchedByAcc = allUsers.find(u => u.mobile && doc.accountDetails.includes(u.mobile));
          if (matchedByAcc) matchedUser = matchedByAcc;
        }

        const name = (matchedUser?.name && matchedUser.name !== 'N/A')
          ? matchedUser.name
          : (userObj?.name && userObj.name !== 'N/A')
          ? userObj.name
          : (doc.userName || doc.customer_name || matchedUser?.mobile || userObj?.mobile || 'User');

        const mobile = (matchedUser?.mobile && matchedUser.mobile !== 'N/A')
          ? matchedUser.mobile
          : (userObj?.mobile && userObj.mobile !== 'N/A')
          ? userObj.mobile
          : (doc.mobile || doc.customer_mobile || '');

        const email = (matchedUser?.email && matchedUser.email !== 'N/A')
          ? matchedUser.email
          : (userObj?.email && userObj.email !== 'N/A')
          ? userObj.email
          : '';

        const wallet = matchedUser?.wallet || userObj?.wallet || { withdrowalable: matchedUser?.balance || userObj?.balance || 0 };
        const balance = Math.max(
          Number(matchedUser?.balance || userObj?.balance || 0),
          Number((wallet?.withdrowalable || 0) + (wallet?.bonusBalance || 0))
        );

        userObj = {
          _id: matchedUser?._id || userObj?._id || doc.userId,
          name: name,
          mobile: mobile,
          email: email,
          wallet: wallet,
          balance: balance
        };

        let paymentSource = "Manual QR / UPI";
        const m = (doc.method || "").toLowerCase();
        if (m.includes("imb") || m.includes("gateway") || m.includes("online") || m.includes("auto")) {
          paymentSource = "Auto Gateway (IMB)";
        } else if (m.includes("payfromupi")) {
          paymentSource = "PayFromUPI Gateway";
        } else if (m.includes("manual")) {
          paymentSource = "Manual QR / UTR Upload";
        }

        return {
          ...doc,
          userId: userObj,
          paymentSource
        };
      });

      return res.status(200).json({ success: true, transactions: formatted });
    }

    return res.status(200).json({ success: true, transactions: [] });
  } catch (error) {
    console.error("getAllTransactionsAdmin Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const creditUserDepositWithExposure = async (userIdStr, amount) => {
  if (!userIdStr) return null;
  let user = null;
  if (mongoose.Types.ObjectId.isValid(userIdStr)) {
    user = await User.findById(userIdStr);
  }
  if (!user) {
    user = await User.findOne({
      $or: [{ _id: userIdStr }, { mobile: userIdStr }]
    });
  }
  if (!user) return null;

  if (!user.wallet) {
    user.wallet = { withdrowalable: 0, bonusBalance: 0, exposureAmount: 0 };
  }

  const amt = Number(amount) || 0;
  user.wallet.withdrowalable = (user.wallet.withdrowalable || 0) + amt;
  user.wallet.exposureAmount = (user.wallet.exposureAmount || 0) + amt;
  user.balance = (user.wallet.withdrowalable || 0) + (user.wallet.bonusBalance || 0);

  await user.save();
  return user;
};

// ==========================================
// 8. ADMIN: UPDATE TRANSACTION STATUS (APPROVE / REJECT)
// ==========================================
export const updateTransactionStatusAdmin = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    if (!transactionId || !status) {
      return res.status(400).json({ success: false, message: "transactionId and status are required" });
    }

    if (mongoose.connection.readyState === 1) {
      const tx = await PaymentTransaction.findById(transactionId);
      if (!tx) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }

      // If approving a deposit that was pending, credit user wallet & exposure amount
      if (status === "Approved" && tx.status !== "Approved" && tx.type === "Deposit") {
        await creditUserDepositWithExposure(tx.userId, tx.amount);
      }

      tx.status = status;
      await tx.save();

      return res.status(200).json({
        success: true,
        message: `Transaction ${status} successfully!`,
        transaction: tx
      });
    }

    return res.status(200).json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    console.error("updateTransactionStatusAdmin Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 9. USER: REQUEST WITHDRAWAL
// ==========================================
export const requestWithdrawal = async (req, res) => {
  try {
    const { userId, mobile, amount, method, accountDetails } = req.body;
    const amt = Number(amount);

    if (!amt || amt < 100) {
      return res.status(400).json({ success: false, message: "Minimum withdrawal amount is ₹100." });
    }

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (userId && mongoose.Types.ObjectId.isValid(userId)) query._id = userId;
      else if (mobile) query.mobile = mobile;
      else query = { role: { $ne: "Admin" } };

      const user = await User.findOne(query);
      if (!user) return res.status(404).json({ success: false, message: "User account not found." });

      const exposure = Number(user.wallet?.exposureAmount || 0);
      if (exposure > 0) {
        return res.status(400).json({
          success: false,
          isExposureLocked: true,
          exposureAmount: exposure,
          message: `Withdrawal Locked! You have a remaining exposure requirement of ₹${exposure.toFixed(2)}.`
        });
      }

      const available = Number(user.wallet?.withdrowalable !== undefined ? user.wallet.withdrowalable : user.balance || 0);
      if (available < amt) {
        return res.status(400).json({ success: false, message: `Insufficient withdrawable balance (Available: ₹${available.toFixed(2)}).` });
      }

      // Deduct from wallet balance (held for pending withdrawal)
      if (!user.wallet) user.wallet = { withdrowalable: 0, bonusBalance: 0 };
      user.wallet.withdrowalable = Math.max(0, (user.wallet.withdrowalable || 0) - amt);
      user.balance = (user.wallet.withdrowalable || 0) + (user.wallet.bonusBalance || 0);
      await user.save();

      const transactionId = "WDR" + Date.now() + Math.floor(Math.random() * 1000);
      const tx = await PaymentTransaction.create({
        userId: user._id,
        type: "Withdrawal",
        amount: amt,
        method: method || "Bank",
        accountDetails: accountDetails || "N/A",
        transactionId: transactionId,
        status: "Pending"
      });

      return res.status(201).json({
        success: true,
        message: "Withdrawal request submitted successfully! 🎉 Admin will process shortly.",
        transaction: tx
      });
    }

    return res.status(201).json({ success: true, message: "Withdrawal request submitted successfully! 🎉" });
  } catch (error) {
    console.error("requestWithdrawal Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 10. ADMIN: GET ALL WITHDRAWAL REQUESTS
// ==========================================
export const getAllWithdrawalsAdmin = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const transactions = await PaymentTransaction.find({ type: "Withdrawal" })
        .populate("userId", "name mobile email wallet balance")
        .sort({ createdAt: -1 });

      const allUsers = await User.find({}).lean();
      const userMap = new Map();
      allUsers.forEach(u => {
        if (u._id) userMap.set(u._id.toString(), u);
        if (u.mobile) userMap.set(u.mobile.toString().trim(), u);
      });

      const formatted = transactions.map(tx => {
        const doc = tx.toObject();

        let userObj = doc.userId;
        let matchedUser = null;

        if (userObj && typeof userObj === 'object' && userObj._id) {
          matchedUser = userMap.get(userObj._id.toString()) || userObj;
        }

        if (!matchedUser) {
          const rawId = typeof doc.userId === 'string'
            ? doc.userId
            : (doc.userId?._id?.toString() || doc.userId?.toString());
          if (rawId && userMap.has(rawId.toString())) {
            matchedUser = userMap.get(rawId.toString());
          }
        }

        const name = (matchedUser?.name && matchedUser.name !== 'N/A')
          ? matchedUser.name
          : (userObj?.name && userObj.name !== 'N/A')
          ? userObj.name
          : (doc.userName || doc.customer_name || matchedUser?.mobile || userObj?.mobile || 'User');

        const mobile = (matchedUser?.mobile && matchedUser.mobile !== 'N/A')
          ? matchedUser.mobile
          : (userObj?.mobile && userObj.mobile !== 'N/A')
          ? userObj.mobile
          : (doc.mobile || doc.customer_mobile || '');

        const email = (matchedUser?.email && matchedUser.email !== 'N/A')
          ? matchedUser.email
          : (userObj?.email && userObj.email !== 'N/A')
          ? userObj.email
          : '';

        userObj = {
          _id: matchedUser?._id || userObj?._id || doc.userId,
          name: name,
          mobile: mobile,
          email: email,
          wallet: matchedUser?.wallet || userObj?.wallet || { withdrowalable: matchedUser?.balance || userObj?.balance || 0 },
          balance: Math.max(
            Number(matchedUser?.balance || userObj?.balance || 0),
            Number((matchedUser?.wallet?.withdrowalable || 0) + (matchedUser?.wallet?.bonusBalance || 0))
          )
        };

        return {
          ...doc,
          userId: userObj
        };
      });

      return res.status(200).json(formatted);
    }

    return res.status(200).json([]);
  } catch (error) {
    console.error("getAllWithdrawalsAdmin Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 11. ADMIN: UPDATE WITHDRAWAL STATUS (APPROVE / REJECT)
// ==========================================
export const updateWithdrawalStatusAdmin = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    if (!transactionId || !status) {
      return res.status(400).json({ success: false, message: "transactionId and status are required" });
    }

    if (mongoose.connection.readyState === 1) {
      const tx = await PaymentTransaction.findById(transactionId);
      if (!tx) {
        return res.status(404).json({ success: false, message: "Withdrawal transaction not found" });
      }

      // If rejected, refund the amount back to user's wallet
      if (status === "Rejected" && tx.status === "Pending") {
        const user = await User.findById(tx.userId);
        if (user) {
          if (!user.wallet) user.wallet = { withdrowalable: 0, bonusBalance: 0 };
          user.wallet.withdrowalable = (user.wallet.withdrowalable || 0) + tx.amount;
          user.balance = (user.wallet.withdrowalable || 0) + (user.wallet.bonusBalance || 0);
          await user.save();
        }
      }

      tx.status = status;
      await tx.save();

      return res.status(200).json({
        success: true,
        message: `Withdrawal request ${status} successfully!`,
        transaction: tx
      });
    }

    return res.status(200).json({ success: true, message: `Withdrawal status updated to ${status}` });
  } catch (error) {
    console.error("updateWithdrawalStatusAdmin Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
