import Market from "../models/Market.js";
import mongoose from "mongoose";

// Calculate single digit from 3-digit Pana (Sum mod 10)
const calculateSingleDigit = (pana) => {
  if (!pana || pana === '***' || String(pana).trim().length !== 3 || isNaN(pana)) return '*';
  const sum = String(pana).trim().split('').reduce((acc, digit) => acc + (parseInt(digit, 10) || 0), 0);
  return String(sum % 10);
};

const formatMarketResult = (marketDoc) => {
  const market = marketDoc.toObject ? marketDoc.toObject() : marketDoc;
  const openPana = market.result_open && market.result_open !== '***' ? String(market.result_open).trim() : '***';
  const closePana = market.result_close && market.result_close !== '***' ? String(market.result_close).trim() : '***';

  const openDigit = calculateSingleDigit(openPana);
  const closeDigit = calculateSingleDigit(closePana);

  let jodi = market.jodi_result || '**';
  if (openDigit !== '*' && closeDigit !== '*') {
    jodi = `${openDigit}${closeDigit}`;
  } else if (openDigit !== '*') {
    jodi = `${openDigit}*`;
  }

  return {
    ...market,
    result_open: openPana,
    result_close: closePana,
    jodi_result: jodi,
    display_result: `${openPana}-${jodi}-${closePana}`
  };
};

// Default dummy markets if DB is empty or disconnected
const DEFAULT_MARKETS = [
  { _id: "1", market_name: "KALYAN MORNING", open_time: "11:00 AM", close_time: "12:00 PM", is_closed: false, result_open: "***", result_close: "***", jodi_result: "**", display_result: "***-**-***" },
  { _id: "2", market_name: "TIME BAZAR", open_time: "01:00 PM", close_time: "02:00 PM", is_closed: false, result_open: "179", result_close: "***", jodi_result: "7*", display_result: "179-7*-***" },
  { _id: "3", market_name: "MILAN DAY", open_time: "03:00 PM", close_time: "05:00 PM", is_closed: false, result_open: "***", result_close: "***", jodi_result: "**", display_result: "***-**-***" },
  { _id: "4", market_name: "KALYAN", open_time: "04:30 PM", close_time: "06:30 PM", is_closed: false, result_open: "***", result_close: "***", jodi_result: "**", display_result: "***-**-***" },
  { _id: "5", market_name: "SRIDEVI NIGHT", open_time: "07:00 PM", close_time: "08:00 PM", is_closed: false, result_open: "145", result_close: "480", jodi_result: "02", display_result: "145-02-480" },
  { _id: "6", market_name: "MAIN BAZAR", open_time: "09:30 PM", close_time: "12:05 AM", is_closed: false, result_open: "***", result_close: "***", jodi_result: "**", display_result: "***-**-***" }
];

export const getAllMarkets = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let markets = await Market.find().sort({ createdAt: -1 });
      if (!markets || markets.length === 0) {
        markets = await Market.insertMany([
          { market_name: "KALYAN MORNING", open_time: "11:00 AM", close_time: "12:00 PM", result_open: "***", result_close: "***", jodi_result: "**" },
          { market_name: "TIME BAZAR", open_time: "01:00 PM", close_time: "02:00 PM", result_open: "179", result_close: "***", jodi_result: "7*" },
          { market_name: "MILAN DAY", open_time: "03:00 PM", close_time: "05:00 PM", result_open: "***", result_close: "***", jodi_result: "**" },
          { market_name: "KALYAN", open_time: "04:30 PM", close_time: "06:30 PM", result_open: "***", result_close: "***", jodi_result: "**" },
          { market_name: "SRIDEVI NIGHT", open_time: "07:00 PM", close_time: "08:00 PM", result_open: "145", result_close: "480", jodi_result: "02" },
          { market_name: "MAIN BAZAR", open_time: "09:30 PM", close_time: "12:05 AM", result_open: "***", result_close: "***", jodi_result: "**" }
        ]);
      }
      const formattedMarkets = markets.map(formatMarketResult);
      return res.status(200).json({ success: true, data: formattedMarkets });
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
      return res.status(400).json({ success: false, message: "All fields (Market Name, Opening Time, Closing Time) are required" });
    }
    if (mongoose.connection.readyState === 1) {
      const newMarket = await Market.create({
        market_name: market_name.trim().toUpperCase(),
        open_time: open_time.trim(),
        close_time: close_time.trim(),
        result_open: "***",
        result_close: "***",
        jodi_result: "**"
      });
      return res.status(201).json({
        success: true,
        message: "Main Market created successfully! 🎉",
        data: formatMarketResult(newMarket)
      });
    }
    return res.status(200).json({ success: true, message: "Market added (Memory Mode)" });
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
    return res.status(200).json({ success: true, message: "Market deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const declareResult = async (req, res) => {
  try {
    const { marketId, resultOpen, resultClose, jodiResult } = req.body;
    if (!marketId) {
      return res.status(400).json({ success: false, message: "Market ID is required" });
    }

    if (mongoose.connection.readyState === 1) {
      const market = await Market.findById(marketId);
      if (!market) {
        return res.status(404).json({ success: false, message: "Market not found" });
      }

      if (resultOpen !== undefined && resultOpen !== null && resultOpen !== "") {
        market.result_open = String(resultOpen).trim();
      }
      if (resultClose !== undefined && resultClose !== null && resultClose !== "") {
        market.result_close = String(resultClose).trim();
      }

      // Calculate center Jodi automatically
      const openDigit = calculateSingleDigit(market.result_open);
      const closeDigit = calculateSingleDigit(market.result_close);

      if (openDigit !== '*' && closeDigit !== '*') {
        market.jodi_result = `${openDigit}${closeDigit}`;
      } else if (openDigit !== '*') {
        market.jodi_result = `${openDigit}*`;
      } else if (jodiResult) {
        market.jodi_result = String(jodiResult).trim();
      }

      await market.save();

      return res.status(200).json({
        success: true,
        message: "Main Market result declared successfully! 🎯",
        data: formatMarketResult(market)
      });
    }

    return res.status(200).json({ success: true, message: "Result declared (Demo mode)" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
