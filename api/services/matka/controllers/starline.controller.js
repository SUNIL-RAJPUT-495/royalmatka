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
      let markets = await StarlineMarket.find({ category }).sort({ createdAt: 1 });
      if (!markets || markets.length === 0) {
        await StarlineMarket.insertMany(DEFAULT_STARLINE);
        markets = await StarlineMarket.find({ category }).sort({ createdAt: 1 });
      }
      return res.status(200).json({ success: true, data: markets || [] });
    }
    return res.status(200).json({ success: true, data: DEFAULT_STARLINE });
  } catch (error) {
    return res.status(200).json({ success: true, data: DEFAULT_STARLINE });
  }
};

export const addStarlineMarket = async (req, res) => {
  try {
    const { time, category = "Starline" } = req.body;
    if (!time) {
      return res.status(400).json({ success: false, message: "Time is required" });
    }
    const newMarket = new StarlineMarket({
      time: String(time).trim(),
      category,
      pana_result: "***",
      digit_result: "*",
      display_result: "***-*",
      is_closed: false
    });
    await newMarket.save();
    return res.status(201).json({ success: true, message: "Starline market added successfully!", data: newMarket });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStarlineMarket = async (req, res) => {
  try {
    const { id } = req.params;
    const { time, is_closed, pana_result, digit_result } = req.body;
    const updateData = {};
    if (time !== undefined) updateData.time = time;
    if (is_closed !== undefined) updateData.is_closed = is_closed;
    if (pana_result !== undefined) updateData.pana_result = pana_result;
    if (digit_result !== undefined) updateData.digit_result = digit_result;
    if (pana_result !== undefined || digit_result !== undefined) {
      const p = pana_result || "***";
      const d = digit_result || "*";
      updateData.display_result = `${p}-${d}`;
    }

    const updated = await StarlineMarket.findByIdAndUpdate(id, updateData, { new: true });
    return res.status(200).json({ success: true, message: "Starline market updated!", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStarlineMarket = async (req, res) => {
  try {
    const { id } = req.params;
    await StarlineMarket.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Starline market deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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
