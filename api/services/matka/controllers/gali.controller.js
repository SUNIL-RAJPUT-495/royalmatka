import GaliMarket from "../models/GaliMarket.js";
import mongoose from "mongoose";

const DEFAULT_GALI_MARKETS = [
  { name: "DESAWAR", time: "04:00 AM", jodi_result: "**", is_closed: false },
  { name: "FARIDABAD", time: "05:50 PM", jodi_result: "**", is_closed: false },
  { name: "GAZIYABAD", time: "08:55 PM", jodi_result: "**", is_closed: false },
  { name: "GALI", time: "11:25 PM", jodi_result: "**", is_closed: false },
  { name: "DELHI BAZAR", time: "03:00 PM", jodi_result: "**", is_closed: false },
  { name: "SHRI GANESH", time: "04:30 PM", jodi_result: "**", is_closed: false },
  { name: "TAJ", time: "03:15 PM", jodi_result: "**", is_closed: false },
  { name: "CHARMINAR", time: "02:00 PM", jodi_result: "**", is_closed: false }
];

export const getGaliMarkets = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let markets = await GaliMarket.find().sort({ createdAt: 1 });
      if (!markets || markets.length === 0) {
        markets = await GaliMarket.insertMany(DEFAULT_GALI_MARKETS);
      }
      return res.status(200).json({ success: true, data: markets });
    }
    return res.status(200).json({ success: true, data: DEFAULT_GALI_MARKETS });
  } catch (error) {
    return res.status(200).json({ success: true, data: DEFAULT_GALI_MARKETS });
  }
};

export const declareGaliResult = async (req, res) => {
  try {
    const { marketId, jodiResult } = req.body;
    if (!marketId) {
      return res.status(400).json({ success: false, message: "Market ID is required" });
    }
    if (!jodiResult || String(jodiResult).trim().length !== 2) {
      return res.status(400).json({ success: false, message: "2-Digit Jodi result is required (e.g. 45)" });
    }

    if (mongoose.connection.readyState === 1) {
      const market = await GaliMarket.findById(marketId);
      if (!market) {
        return res.status(404).json({ success: false, message: "Gali market not found" });
      }

      market.jodi_result = String(jodiResult).trim();
      await market.save();

      return res.status(200).json({
        success: true,
        message: `Gali Bazar result ${jodiResult} declared successfully! 🎯`,
        data: market
      });
    }

    return res.status(200).json({ success: true, message: "Gali result declared (Demo mode)" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
