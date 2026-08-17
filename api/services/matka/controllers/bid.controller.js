import Market from "../models/Market.js";
import Bid, { getISTDateString } from "../models/Bid.js";
import User from "../../auth/models/User.js";
import GaliMarket from "../models/GaliMarket.js";

// Helper to check if market session time (e.g. "09:40 AM" or "10:40 PM") has passed in IST
export const isTimePassedIST = (timeStr) => {
  if (!timeStr) return false;
  try {
    const now = new Date();
    const istTimeString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istNow = new Date(istTimeString);

    let cleanTime = String(timeStr).trim().toUpperCase();
    const match = cleanTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
    if (!match) return false;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] || "AM";

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const currentTotalMinutes = istNow.getHours() * 60 + istNow.getMinutes();
    const targetTotalMinutes = hours * 60 + minutes;

    return currentTotalMinutes >= targetTotalMinutes;
  } catch (err) {
    return false;
  }
};

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

    // Backend Market Time & Status Verification
    const targetMarket = await Market.findOne({
      market_name: new RegExp(`^${String(marketName).trim()}$`, "i")
    });

    if (targetMarket) {
      if (targetMarket.is_closed) {
        return res.status(400).json({
          success: false,
          message: `Bidding for market '${marketName}' is currently closed.`
        });
      }

      const isOpenTimePassed = isTimePassedIST(targetMarket.open_time);
      const isCloseTimePassed = isTimePassedIST(targetMarket.close_time);

      if (isOpenTimePassed && isCloseTimePassed) {
        return res.status(400).json({
          success: false,
          message: `Bidding for market '${marketName}' is closed for today (${targetMarket.close_time}).`
        });
      }

      // Check each bid session
      for (const b of bids) {
        const sess = (b.session || "Open").toLowerCase();
        const mode = String(gameMode).toLowerCase();

        if (sess === "open" && isOpenTimePassed) {
          return res.status(400).json({
            success: false,
            message: `Open session bidding for '${marketName}' has closed (${targetMarket.open_time}).`
          });
        }
        if (sess === "close" && isCloseTimePassed) {
          return res.status(400).json({
            success: false,
            message: `Close session bidding for '${marketName}' has closed (${targetMarket.close_time}).`
          });
        }
        // Jodi / Sangam require Open time to be valid
        if ((mode.includes("jodi") || mode.includes("sangam") || mode.includes("brackets")) && isOpenTimePassed) {
          return res.status(400).json({
            success: false,
            message: `Jodi & Sangam bidding for '${marketName}' closes after Open time (${targetMarket.open_time}).`
          });
        }
      }
    }

    // Backend Gali Market Time & Status Verification
    const galiMarket = await GaliMarket.findOne({
      name: new RegExp(`^${String(marketName).trim()}$`, "i")
    });

    const isGaliMarket = Boolean(
      galiMarket || 
      req.body.type === 'gali' || 
      ['left-digit', 'right-digit', 'jodi-digit', 'jodi-bulk', 'digit-based'].includes(String(gameMode).toLowerCase())
    );

    if (galiMarket) {
      const timePassed = isTimePassedIST(galiMarket.time);
      const hasResult = galiMarket.jodi_result && galiMarket.jodi_result !== '**';

      if (galiMarket.is_closed || timePassed || hasResult) {
        return res.status(400).json({
          success: false,
          message: `Bidding for Gali market '${galiMarket.name}' is closed (${galiMarket.time}). Bids cannot be placed!`
        });
      }
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

    const currentISTDate = getISTDateString();

    // Prepare bid documents to insert
    const bidDocs = bids.map((item) => {
      const initialStatus = (item.status === 'Won' || item.status === 'Lost' || item.type === 'Won' || item.type === 'Lost')
        ? (item.status || item.type)
        : "Pending";

      return {
        userId: updatedUser._id,
        userName: updatedUser.name || "",
        userMobile: updatedUser.mobile,
        marketName: String(marketName).toUpperCase(),
        gameMode: gameMode,
        bidDate: item.bidDate || currentISTDate,
        session: item.session || "Open",
        digit: String(item.digit || item.jodi || item.pana || item.number || "").trim(),
        pana: String(item.pana || "").trim(),
        jodi: String(item.jodi || item.digit || "").trim(),
        openPana: String(item.openPana || "").trim(),
        closePana: String(item.closePana || "").trim(),
        openDigit: String(item.openDigit || "").trim(),
        closeDigit: String(item.closeDigit || "").trim(),
        type: isGaliMarket ? "gali" : (item.type || initialStatus),
        points: Number(item.points) || 0,
        status: initialStatus,
        winAmount: Number(item.winAmount) || 0
      };
    });

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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

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

    const totalCount = await Bid.countDocuments(filter);
    const bids = await Bid.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      bids: bids,
      page: page,
      limit: limit,
      totalCount: totalCount,
      hasMore: skip + bids.length < totalCount
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
      data: bids,
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

/**
 * @desc Update status & winAmount of an Aviator bid
 * @route POST /api/bid/update-aviator-bid
 * @access Public / Private
 */
export const updateAviatorBid = async (req, res) => {
  try {
    const { bidId, userId, mobile, status, winAmount, multiplier, points } = req.body;

    let targetBid = null;

    if (bidId) {
      targetBid = await Bid.findById(bidId);
    }

    if (!targetBid && (userId || mobile)) {
      // Find the latest pending Aviator bid for this user
      const query = { marketName: 'AVIATOR CASINO' };
      if (userId) query.userId = userId;
      else if (mobile) query.userMobile = String(mobile).trim();

      targetBid = await Bid.findOne(query).sort({ createdAt: -1 });
    }

    const nextStatus = status === 'Won' ? 'Won' : status === 'Lost' ? 'Lost' : 'Pending';
    const nextWinAmount = Number(winAmount) || 0;
    const nextDigit = multiplier ? `@${Number(multiplier).toFixed(2)}x` : undefined;

    if (targetBid) {
      targetBid.status = nextStatus;
      targetBid.type = nextStatus;
      targetBid.winAmount = nextWinAmount;
      if (nextDigit) targetBid.digit = nextDigit;
      if (nextDigit) targetBid.jodi = nextDigit;
      await targetBid.save();

      return res.status(200).json({
        success: true,
        bid: targetBid
      });
    } else if (mobile) {
      // Create resolved Aviator bid if missing
      const user = await User.findOne({ mobile: String(mobile).trim() });
      const newBid = await Bid.create({
        userId: user?._id || userId,
        userName: user?.name || '',
        userMobile: String(mobile).trim(),
        marketName: 'AVIATOR CASINO',
        gameMode: 'Aviator',
        bidDate: getISTDateString(),
        session: 'N/A',
        digit: nextDigit || '@1.00x',
        jodi: nextDigit || '@1.00x',
        type: nextStatus,
        points: Number(points) || 100,
        status: nextStatus,
        winAmount: nextWinAmount
      });

      return res.status(201).json({
        success: true,
        bid: newBid
      });
    }

    return res.status(400).json({
      success: false,
      message: "Bid or user details required to update Aviator bid."
    });
  } catch (error) {
    console.error("Error in updateAviatorBid:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update Aviator bid."
    });
  }
};
