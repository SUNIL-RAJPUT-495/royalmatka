import NEXX_CONFIG from "../config/nexx.config.js";
import { encryptPayload, decryptPayload } from "../utils/encryption.util.js";
import CasinoTransaction from "../models/CasinoTransaction.js";
import CasinoGameSetting from "../models/CasinoGameSetting.js";
import User from "../../auth/models/User.js";

/**
 * @desc Get Server IP Whitelist status (whoami)
 * @route GET /api/cashino/whoami
 * @access Admin / Public
 */
export const getWhoAmI = async (req, res) => {
  try {
    const response = await fetch(`${NEXX_CONFIG.API_URL}/whoami?token=${NEXX_CONFIG.TOKEN}`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching Nexx whoami:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to connect to NexxAPI server.",
      error: error.message
    });
  }
};

/**
 * @desc Get Providers Catalog
 * @route GET /api/cashino/providers
 * @access Public
 */
export const getProviders = async (req, res) => {
  try {
    const response = await fetch(`${NEXX_CONFIG.API_URL}/providers?token=${NEXX_CONFIG.TOKEN}`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching providers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch casino providers.",
      error: error.message
    });
  }
};

/**
 * @desc Get Games Catalog with ON/OFF Status Support
 * @route GET /api/cashino/games
 * @access Public
 */
export const getGames = async (req, res) => {
  try {
    const { brand_id, limit = 500, offset = 0, q, user_side, filter_active } = req.query;

    let url = `${NEXX_CONFIG.API_URL}/games?token=${NEXX_CONFIG.TOKEN}&limit=${limit}&offset=${offset}`;
    if (brand_id) url += `&brand_id=${brand_id}`;
    if (q) url += `&q=${encodeURIComponent(q)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 0 && data.data?.games) {
      // Fetch DB game settings
      const settings = await CasinoGameSetting.find();
      const statusMap = new Map();
      settings.forEach((s) => {
        statusMap.set(String(s.game_uid), s.status);
      });

      // Merge status into games list
      let gamesList = data.data.games.map((g) => {
        const customStatus = statusMap.get(String(g.game_uid)) || "Active";
        return {
          ...g,
          status: customStatus
        };
      });

      // If user_side or filter_active, filter out Inactive games
      if (user_side === "true" || filter_active === "true") {
        gamesList = gamesList.filter((g) => g.status === "Active");
      }

      data.data.games = gamesList;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching games:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch casino games.",
      error: error.message
    });
  }
};

/**
 * @desc Toggle Casino Game Active / Inactive Status (ON / OFF)
 * @route POST /api/cashino/toggle-game-status
 * @access Admin
 */
export const toggleGameStatus = async (req, res) => {
  try {
    const { game_uid, status, name, provider, category, game_id } = req.body;

    if (!game_uid) {
      return res.status(400).json({
        success: false,
        message: "game_uid is required."
      });
    }

    const newStatus = status === "Inactive" ? "Inactive" : "Active";

    const setting = await CasinoGameSetting.findOneAndUpdate(
      { game_uid: String(game_uid) },
      {
        game_uid: String(game_uid),
        game_id: String(game_id || ""),
        name: name || "",
        provider: provider || "",
        category: category || "",
        status: newStatus
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Game status updated to ${newStatus}`,
      data: setting
    });
  } catch (error) {
    console.error("Error toggling game status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update game status."
    });
  }
};

/**
 * @desc Get GGR Balance
 * @route GET /api/cashino/ggr-balance
 * @access Admin
 */
export const getGgrBalance = async (req, res) => {
  try {
    const response = await fetch(`${NEXX_CONFIG.API_URL}/ggr-balance?token=${NEXX_CONFIG.TOKEN}`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching GGR balance:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch GGR balance.",
      error: error.message
    });
  }
};

/**
 * @desc Launch Casino Game
 * @route POST /api/cashino/launch
 * @access Private
 */
export const launchGame = async (req, res) => {
  try {
    const { game_uid, return_url } = req.body;

    if (!game_uid) {
      return res.status(400).json({
        success: false,
        message: "game_uid is required to launch a game."
      });
    }

    // Identify user
    const userId = req.user?.id || req.user?._id;
    let user = null;

    if (userId) {
      user = await User.findById(userId);
    }

    if (!user && req.body.mobile) {
      user = await User.findOne({ mobile: req.body.mobile });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found. Please log in again."
      });
    }

    if (user.status === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked. Please contact support."
      });
    }

    const currentBalance = typeof user.balance === "number" ? user.balance : (user.wallet?.withdrowalable || 0);

    // Build host protocol & domain for return/callback URL
    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:5010";
    const origin = req.get("origin") || `${protocol}://${host}`;

    const defaultReturn = `${origin}/casino`;
    const defaultCallback = `${protocol}://${host}/api/cashino/callback`;

    // Plaintext payload structure
    const plaintext = {
      user_id: String(user._id),
      balance: Number(currentBalance.toFixed(2)),
      game_uid: String(game_uid),
      token: NEXX_CONFIG.TOKEN,
      timestamp: Date.now(),
      return: return_url || defaultReturn,
      callback: process.env.CASINO_CALLBACK_URL || defaultCallback,
      currency_code: NEXX_CONFIG.CURRENCY,
      language: "en"
    };

    // Encrypt payload with secret
    const ciphertext = encryptPayload(plaintext, NEXX_CONFIG.SECRET);

    // Call NexxAPI Launch endpoint
    const response = await fetch(`${NEXX_CONFIG.API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: NEXX_CONFIG.TOKEN,
        payload: ciphertext
      })
    });

    const data = await response.json();

    if (data.code === 0 && data.data?.url) {
      return res.status(200).json({
        success: true,
        message: "Game launched successfully",
        url: data.data.url
      });
    } else {
      return res.status(400).json({
        success: false,
        message: data.msg || "Failed to launch game.",
        code: data.code
      });
    }
  } catch (error) {
    console.error("Error in launchGame:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error launching game.",
      error: error.message
    });
  }
};

/**
 * @desc Settlement Callback Handler from NexxAPI
 * @route POST /api/cashino/callback
 * @access Public (Server-to-Server)
 */
export const handleCallback = async (req, res) => {
  try {
    let payloadData = req.body;

    // Handle encrypted callback payload if present
    if (payloadData && payloadData.payload) {
      try {
        payloadData = decryptPayload(payloadData.payload, NEXX_CONFIG.SECRET);
      } catch (decErr) {
        console.error("Error decrypting Nexx callback payload:", decErr);
        return res.status(400).json({ code: 1, msg: "Decryption failed" });
      }
    }

    const {
      game_id,
      game_uid,
      game_round,
      member_account,
      bet_amount,
      win_amount,
      credit_amount,
      timestamp,
      serial_number,
      game_name
    } = payloadData;

    if (!serial_number || credit_amount === undefined || !member_account) {
      return res.status(400).json({ code: 1, msg: "Invalid payload params" });
    }

    // Deduplication check using serial_number
    const existingTx = await CasinoTransaction.findOne({ serial_number });
    if (existingTx) {
      return res.status(200).json({ code: 0, msg: "Duplicate callback ignored" });
    }

    // Find User by member_account (_id or mobile)
    let user = null;
    if (member_account.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(member_account);
    }
    if (!user) {
      user = await User.findOne({ mobile: member_account });
    }

    const updatedCredit = Number(credit_amount);

    if (user) {
      user.balance = updatedCredit;
      if (!user.wallet) user.wallet = {};
      user.wallet.withdrowalable = updatedCredit;
      await user.save();
    }

    // Record Transaction
    await CasinoTransaction.create({
      serial_number,
      game_id: String(game_id || ""),
      game_uid: String(game_uid || ""),
      game_round: String(game_round || ""),
      game_name: game_name || "Casino Game",
      member_account: String(member_account),
      userId: user ? user._id : null,
      bet_amount: Number(bet_amount || 0),
      win_amount: Number(win_amount || 0),
      credit_amount: updatedCredit,
      timestamp: timestamp ? new Date(Number(timestamp)) : new Date(),
      status: "PROCESSED"
    });

    return res.status(200).json({ code: 0, msg: "Success" });
  } catch (error) {
    console.error("Error in casino handleCallback:", error);
    return res.status(500).json({ code: 1, msg: "Internal server error" });
  }
};

/**
 * @desc Get Recent Settlement Transactions Log
 * @route GET /api/cashino/transactions
 * @access Admin
 */
export const getTransactions = async (req, res) => {
  try {
    const transactions = await CasinoTransaction.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "name mobile email");

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error("Error fetching casino transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions."
    });
  }
};

/**
 * @desc Proxy NexxAPI Game Images to bypass CORP (Cross-Origin Resource Policy) restrictions
 * @route GET /api/cashino/proxy-image
 * @access Public
 */
export const proxyImage = async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl || !imageUrl.startsWith("http")) {
      return res.status(400).send("Invalid image URL");
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(404).send("Image not found");
    }

    const contentType = response.headers.get("content-type") || "image/png";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (error) {
    console.error("Error proxying casino image:", error);
    return res.status(500).send("Failed to proxy image");
  }
};

export default {
  getWhoAmI,
  getProviders,
  getGames,
  toggleGameStatus,
  getGgrBalance,
  launchGame,
  handleCallback,
  getTransactions,
  proxyImage
};
