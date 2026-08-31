import StarlineMarket from "../models/StarlineMarket.js";
import { broadcastResultNotification } from "../../auth/controllers/notification.controller.js";
import mongoose from "mongoose";

const DEFAULT_STARLINE = [
  { time: "10:30 AM", pana_result: "***", digit_result: "*", display_result: "***-*", category: "Starline" },
  { time: "11:30 AM", pana_result: "***", digit_result: "*", display_result: "***-*", category: "Starline" },
  { time: "12:30 PM", pana_result: "***", digit_result: "*", display_result: "***-*", category: "Starline" },
  { time: "01:30 PM", pana_result: "***", digit_result: "*", display_result: "***-*", category: "Starline" },
  { time: "02:30 PM", pana_result: "***", digit_result: "*", display_result: "***-*", category: "Starline" },
  { time: "03:30 PM", pana_result: "***", digit_result: "*", display_result: "***-*", category: "Starline" },
  { time: "04:30 PM", pana_result: "***", digit_result: "*", display_result: "***-*", category: "Starline" },
  { time: "05:30 PM", pana_result: "***", digit_result: "*", display_result: "***-*", category: "Starline" },
  { time: "06:30 PM", pana_result: "***", digit_result: "*", display_result: "***-*", category: "Starline" },
  { time: "07:30 PM", pana_result: "***", digit_result: "*", display_result: "***-*", category: "Starline" },
  { time: "08:30 PM", pana_result: "***", digit_result: "*", display_result: "***-*", category: "Starline" },
  { time: "09:30 PM", pana_result: "***", digit_result: "*", display_result: "***-*", category: "Starline" }
];

export const getStarlineMarkets = async (req, res) => {
  try {
    const { category = "Starline" } = req.query;
    if (mongoose.connection.readyState === 1) {
      const markets = await StarlineMarket.find({ category }).sort({ createdAt: 1 });
      return res.status(200).json({ success: true, data: markets || [] });
    }
    return res.status(200).json({ success: true, data: [] });
  } catch (error) {
    return res.status(200).json({ success: true, data: [] });
  }
};

export const declareStarlineResult = async (req, res) => {
  try {
    const { marketId, panaResult, digitResult } = req.body;
    if (!marketId) {
      return res.status(400).json({ success: false, message: "Market ID is required" });
    }

    if (mongoose.connection.readyState === 1) {
      const market = await StarlineMarket.findById(marketId);
      if (!market) {
        return res.status(404).json({ success: false, message: "Starline market not found" });
      }

      if (panaResult) market.pana_result = String(panaResult).trim();
      
      let calcDigit = "*";
      if (market.pana_result && market.pana_result !== "***" && market.pana_result.length === 3) {
        const sum = market.pana_result.split('').reduce((acc, curr) => acc + (parseInt(curr, 10) || 0), 0);
        calcDigit = String(sum % 10);
      } else if (digitResult) {
        calcDigit = String(digitResult).trim();
      }

      market.digit_result = calcDigit;
      market.display_result = `${market.pana_result}-${calcDigit}`;
      await market.save();

      // Dispatch FCM Push Notification to all users
      broadcastResultNotification(
        `🌟 STARLINE (${market.time}) RESULT DECLARED`,
        `StarLine ${market.time} Result: ${market.display_result}`
      ).catch(() => {});

      return res.status(200).json({ success: true, message: "Starline result declared! 🌟", data: market });
    }

    return res.status(200).json({ success: true, message: "Starline result declared (Demo mode)" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
