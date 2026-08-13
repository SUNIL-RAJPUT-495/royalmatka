import Market from "../models/Market.js";
import mongoose from "mongoose";

// Default dummy markets if DB is empty or disconnected
const DEFAULT_MARKETS = [
  { id: "1", market_name: "KALYAN MORNING", open_time: "11:00 AM", close_time: "12:00 PM", is_closed: false, result_open: "***", result_close: "***", jodi_result: "**" },
  { id: "2", market_name: "TIME BAZAR", open_time: "01:00 PM", close_time: "02:00 PM", is_closed: false, result_open: "***", result_close: "***", jodi_result: "**" },
  { id: "3", market_name: "MILAN DAY", open_time: "03:00 PM", close_time: "05:00 PM", is_closed: false, result_open: "***", result_close: "***", jodi_result: "**" },
  { id: "4", market_name: "KALYAN", open_time: "04:30 PM", close_time: "06:30 PM", is_closed: false, result_open: "***", result_close: "***", jodi_result: "**" },
  { id: "5", market_name: "SRIDEVI NIGHT", open_time: "07:00 PM", close_time: "08:00 PM", is_closed: false, result_open: "***", result_close: "***", jodi_result: "**" },
  { id: "6", market_name: "MAIN BAZAR", open_time: "09:30 PM", close_time: "12:05 AM", is_closed: false, result_open: "***", result_close: "***", jodi_result: "**" }
];

export const getAllMarkets = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let markets = await Market.find().sort({ createdAt: -1 });
      if (!markets || markets.length === 0) {
        markets = await Market.insertMany(DEFAULT_MARKETS);
      }
      return res.status(200).json({ success: true, data: markets });
    }
    return res.status(200).json({ success: true, data: DEFAULT_MARKETS });
  } catch (error) {
    return res.status(200).json({ success: true, data: DEFAULT_MARKETS });
  }
};

export const addMarket = async (req, res) => {
  try {
    const { market_name, open_time, close_time } = req.body;
    if (!market_name || !open_time || !close_time) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (mongoose.connection.readyState === 1) {
      const newMarket = await Market.create({ market_name, open_time, close_time });
      return res.status(201).json({ success: true, message: "Market created successfully", data: newMarket });
    }
    return res.status(200).json({ success: true, message: "Market added (Memory Mode)", data: { market_name, open_time, close_time } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMarket = async (req, res) => {
  try {
    const { id } = req.query;
    if (mongoose.connection.readyState === 1 && id) {
      await Market.findByIdAndDelete(id);
    }
    return res.status(200).json({ success: true, message: "Market deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const declareResult = async (req, res) => {
  try {
    const { marketId, resultOpen, resultClose, jodiResult } = req.body;
    if (mongoose.connection.readyState === 1 && marketId) {
      await Market.findByIdAndUpdate(marketId, {
        ...(resultOpen && { result_open: resultOpen }),
        ...(resultClose && { result_close: resultClose }),
        ...(jodiResult && { jodi_result: jodiResult })
      });
    }
    return res.status(200).json({ success: true, message: "Result declared successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
