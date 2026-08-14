import Bid from "../models/Bid.js";
import User from "../../auth/models/User.js";

/**
 * @desc Place bids in bulk for Main Market
 * @route POST /api/bid/place-bid
 * @access Public / Private
 */
export const placeBid = async (req, res) => {
  try {
    const { userId, mobile, marketName, gameMode, bids } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "User mobile number is required to place bids."
      });
    }

    if (!marketName || !gameMode) {
      return res.status(400).json({
        success: false,
        message: "Market name and game mode are required."
      });
    }

    if (!Array.isArray(bids) || bids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one bid item is required."
      });
    }

    // Calculate total points required for all bids
    const totalPoints = bids.reduce((sum, item) => sum + (Number(item.points) || 0), 0);

    if (totalPoints <= 0) {
      return res.status(400).json({
        success: false,
        message: "Total bid points must be greater than zero."
      });
    }

    // Find User by mobile or userId
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne({ mobile: String(mobile).trim() });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please log in again."
      });
    }

    const currentBalance = Number(user.balance || 0);

    if (currentBalance < totalPoints) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance! Available: ₹${currentBalance.toFixed(1)}`
      });
    }

    // Deduct totalPoints atomically from user balance
    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: user._id,
        balance: { $gte: totalPoints } 
      },
      { 
        $inc: { 
          balance: -totalPoints,
          "wallet.withdrowalable": -totalPoints 
        } 
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: "Transaction failed. Insufficient balance or concurrent modification."
      });
    }

    // Prepare bid documents to insert
    const bidDocs = bids.map((item) => ({
      userId: updatedUser._id,
      userName: updatedUser.name || "",
      userMobile: updatedUser.mobile,
      marketName: String(marketName).toUpperCase(),
      gameMode: gameMode,
      session: item.session || "Open",
      digit: item.digit || "",
      pana: item.pana || "",
      jodi: item.jodi || "",
      openPana: item.openPana || "",
      closePana: item.closePana || "",
      openDigit: item.openDigit || "",
      closeDigit: item.closeDigit || "",
      type: item.type || "",
      points: Number(item.points) || 0,
      status: "Pending",
      winAmount: 0
    }));

    // Bulk insert bids
    const insertedBids = await Bid.insertMany(bidDocs);

    return res.status(200).json({
      success: true,
      message: `${insertedBids.length} bids placed successfully! 🎉`,
      newBalance: updatedUser.balance,
      placedCount: insertedBids.length,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        mobile: updatedUser.mobile,
        balance: updatedUser.balance,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error("Error in placeBid controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to place bids due to a server error."
    });
  }
};

/**
 * @desc Get User Bids History
 * @route GET /api/bid/get-user-bids?mobile=9999999999
 * @access Public / Private
 */
export const getUserBids = async (req, res) => {
  try {
    const { mobile, userId } = req.query;
    let filter = {};

    if (userId) {
      filter.userId = userId;
    } else if (mobile) {
      filter.userMobile = String(mobile).trim();
    } else {
      return res.status(400).json({
        success: false,
        message: "User mobile or userId is required."
      });
    }

    const bids = await Bid.find(filter).sort({ createdAt: -1 }).limit(100);

    return res.status(200).json({
      success: true,
      bids: bids
    });
  } catch (error) {
    console.error("Error in getUserBids controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user bids."
    });
  }
};

/**
 * @desc Get All Bids (Admin)
 * @route GET /api/bid/get-all-bids
 * @access Admin
 */
export const getAllBids = async (req, res) => {
  try {
    const bids = await Bid.find().sort({ createdAt: -1 }).limit(500);

    return res.status(200).json({
      success: true,
      bids: bids
    });
  } catch (error) {
    console.error("Error in getAllBids controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all bids."
    });
  }
};

/**
 * @desc Delete a bid (Admin)
 * @route DELETE /api/bid/delete-bid/:id
 * @access Admin
 */
export const deleteBid = async (req, res) => {
  try {
    const { id } = req.params;
    await Bid.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Bid deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteBid controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete bid."
    });
  }
};
