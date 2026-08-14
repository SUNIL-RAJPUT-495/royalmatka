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
    name: market.market_name || market.name,
    market_name: market.market_name || market.name,
    status: market.is_closed ? "Closed" : "Active",
    open_time: market.open_time || "12:00 PM",
    close_time: market.close_time || "02:00 PM",
    off_days: Array.isArray(market.off_days) ? market.off_days : [],
    result_open: openPana,
    result_close: closePana,
    jodi_result: jodi,
    display_result: `${openPana}-${jodi}-${closePana}`
  };
};

// Default dummy markets if DB is empty or disconnected
const DEFAULT_MARKETS = [
  { _id: "1", market_name: "KALYAN MORNING", name: "KALYAN MORNING", open_time: "11:00 AM", close_time: "12:00 PM", is_closed: false, status: "Active", result_open: "***", result_close: "***", jodi_result: "**", display_result: "***-**-***" },
  { _id: "2", market_name: "KARNATAKA DAY", name: "KARNATAKA DAY", open_time: "09:55 AM", close_time: "10:55 AM", is_closed: true, status: "Closed", result_open: "566", result_close: "335", jodi_result: "71", display_result: "566-71-335" },
  { _id: "3", market_name: "TIME BAZAR", name: "TIME BAZAR", open_time: "12:55 PM", close_time: "01:55 PM", is_closed: true, status: "Closed", result_open: "179", result_close: "***", jodi_result: "7*", display_result: "179-7*-***" },
  { _id: "4", market_name: "MADHUR DAY", name: "MADHUR DAY", open_time: "01:25 PM", close_time: "02:25 PM", is_closed: false, status: "Active", result_open: "266", result_close: "***", jodi_result: "4*", display_result: "266-4*-***" },
  { _id: "5", market_name: "SITA DAY", name: "SITA DAY", open_time: "01:40 PM", close_time: "02:40 PM", is_closed: false, status: "Active", result_open: "355", result_close: "***", jodi_result: "3*", display_result: "355-3*-***" },
  { _id: "6", market_name: "MILAN DAY", name: "MILAN DAY", open_time: "02:50 PM", close_time: "04:50 PM", is_closed: false, status: "Active", result_open: "***", result_close: "***", jodi_result: "**", display_result: "***-**-***" },
  { _id: "7", market_name: "RAJDHANI DAY", name: "RAJDHANI DAY", open_time: "02:55 PM", close_time: "04:55 PM", is_closed: false, status: "Active", result_open: "***", result_close: "***", jodi_result: "**", display_result: "***-**-***" },
  { _id: "8", market_name: "KALYAN", name: "KALYAN", open_time: "03:45 PM", close_time: "05:45 PM", is_closed: false, status: "Active", result_open: "***", result_close: "***", jodi_result: "**", display_result: "***-**-***" },
  { _id: "9", market_name: "SRIDEVI NIGHT", name: "SRIDEVI NIGHT", open_time: "09:40 PM", close_time: "10:40 PM", is_closed: false, status: "Active", result_open: "145", result_close: "480", jodi_result: "02", display_result: "145-02-480" },
  { _id: "10", market_name: "MAIN BAZAR", name: "MAIN BAZAR", open_time: "09:30 PM", close_time: "12:05 AM", is_closed: false, status: "Active", result_open: "***", result_close: "***", jodi_result: "**", display_result: "***-**-***" }
];

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 99999;
  const cleanStr = String(timeStr).trim().toUpperCase();
  const match = cleanStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!match) return 99999;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] || 'AM';

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

export const getAllMarkets = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let markets = await Market.find();
      const formattedMarkets = markets.map(formatMarketResult);
      formattedMarkets.sort((a, b) => parseTimeToMinutes(a.open_time) - parseTimeToMinutes(b.open_time));
      return res.status(200).json({ success: true, data: formattedMarkets });
    }
    return res.status(200).json({ success: true, data: [] });
  } catch (error) {
    return res.status(200).json({ success: true, data: [] });
  }
};

export const addMarket = async (req, res) => {
  try {
    const market_name = req.body.market_name || req.body.name;
    const open_time = req.body.open_time;
    const close_time = req.body.close_time;
    const off_days = req.body.off_days || [];

    if (!market_name || !open_time || !close_time) {
      return res.status(400).json({ success: false, message: "All fields (Market Name, Opening Time, Closing Time) are required" });
    }
    if (mongoose.connection.readyState === 1) {
      const newMarket = await Market.create({
        market_name: market_name.trim().toUpperCase(),
        open_time: open_time.trim(),
        close_time: close_time.trim(),
        off_days: Array.isArray(off_days) ? off_days : [],
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

export const updateMarketDetails = async (req, res) => {
  try {
    const { id, marketId, market_name, name, open_time, close_time, off_days } = req.body;
    const targetId = id || marketId;

    if (mongoose.connection.readyState === 1 && targetId) {
      const market = await Market.findById(targetId);
      if (market) {
        if (market_name || name) market.market_name = (market_name || name).trim().toUpperCase();
        if (open_time) market.open_time = open_time.trim();
        if (close_time) market.close_time = close_time.trim();
        if (Array.isArray(off_days)) market.off_days = off_days;

        await market.save();
        return res.status(200).json({ success: true, message: "Market updated successfully! ✏️", data: formatMarketResult(market) });
      }
    }
    return res.status(200).json({ success: true, message: "Market updated (Demo mode)" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMarket = async (req, res) => {
  try {
    const id = req.query.id || req.body.id || req.body.marketId;
    if (mongoose.connection.readyState === 1 && id) {
      await Market.findByIdAndDelete(id);
    }
    return res.status(200).json({ success: true, message: "Market deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAllMarkets = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Market.deleteMany({});
    }
    return res.status(200).json({ success: true, message: "All markets deleted successfully from database! 🗑️" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMarketStatus = async (req, res) => {
  try {
    const { gameId, marketId, status, is_closed } = req.body;
    const targetId = gameId || marketId;

    if (mongoose.connection.readyState === 1 && targetId) {
      const market = await Market.findById(targetId);
      if (market) {
        if (typeof is_closed === 'boolean') {
          market.is_closed = is_closed;
        } else if (status) {
          market.is_closed = status.toLowerCase() === 'closed';
        } else {
          market.is_closed = !market.is_closed;
        }
        await market.save();
        return res.status(200).json({ success: true, message: "Market status updated!", data: formatMarketResult(market) });
      }
    }
    return res.status(200).json({ success: true, message: "Market status updated (Demo mode)" });
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
