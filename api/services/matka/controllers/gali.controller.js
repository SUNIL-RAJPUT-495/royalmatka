import GaliMarket from "../models/GaliMarket.js";
import Bid from "../models/Bid.js";
import User from "../../auth/models/User.js";
import GameRate from "../models/GameRate.js";
import mongoose from "mongoose";

// Helper to check if time has passed in IST
export const isTimePassedIST = (timeStr) => {
  if (!timeStr) return false;
  try {
    const now = new Date();
    const istTimeString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istNow = new Date(istTimeString);

    let cleanTime = String(timeStr).trim().toUpperCase();
    const match = cleanTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return false;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] ? match[3].toUpperCase() : "AM";

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const currentTotalMinutes = istNow.getHours() * 60 + istNow.getMinutes();
    const targetTotalMinutes = hours * 60 + minutes;

    return currentTotalMinutes >= targetTotalMinutes;
  } catch (err) {
    return false;
  }
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 99999;
  const cleanStr = String(timeStr).trim().toUpperCase();
  const match = cleanStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 99999;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : "AM";

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const DEFAULT_GALI_MARKETS = [
  { name: "DESAWAR", time: "04:00 AM", jodi_result: "**", is_closed: false },
  { name: "CHARMINAR", time: "02:00 PM", jodi_result: "**", is_closed: false },
  { name: "DELHI BAZAR", time: "03:00 PM", jodi_result: "**", is_closed: false },
  { name: "TAJ", time: "03:15 PM", jodi_result: "**", is_closed: false },
  { name: "SHRI GANESH", time: "04:30 PM", jodi_result: "**", is_closed: false },
  { name: "FARIDABAD", time: "05:50 PM", jodi_result: "**", is_closed: false },
  { name: "GAZIYABAD", time: "08:55 PM", jodi_result: "**", is_closed: false },
  { name: "GALI", time: "11:25 PM", jodi_result: "**", is_closed: false }
];

export const getGaliMarkets = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let rawMarkets = await GaliMarket.find().lean();
      
      if (!rawMarkets || rawMarkets.length === 0) {
        const created = await GaliMarket.insertMany(DEFAULT_GALI_MARKETS);
        rawMarkets = created.map(c => c.toObject());
      }

      const markets = rawMarkets.map(m => {
        const timePassed = isTimePassedIST(m.time);
        const hasResult = m.jodi_result && m.jodi_result !== '**';
        const isClosed = Boolean(m.is_closed || timePassed || hasResult);
        return {
          ...m,
          is_closed: isClosed
        };
      });

      markets.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
      return res.status(200).json({ success: true, data: markets });
    }
    return res.status(200).json({ success: true, data: DEFAULT_GALI_MARKETS });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const declareGaliResult = async (req, res) => {
  try {
    const { marketId, jodiResult } = req.body;
    if (!marketId) {
      return res.status(400).json({ success: false, message: "Market ID is required" });
    }
    const cleanJodi = String(jodiResult).trim();
    if (!cleanJodi || cleanJodi.length !== 2) {
      return res.status(400).json({ success: false, message: "2-Digit Jodi result is required (e.g. 45)" });
    }

    if (mongoose.connection.readyState === 1) {
      let market = null;
      if (mongoose.Types.ObjectId.isValid(marketId)) {
        market = await GaliMarket.findById(marketId);
      }
      if (!market) {
        market = await GaliMarket.findOne({ name: new RegExp(`^${String(marketId).trim()}$`, "i") });
      }

      if (!market) {
        return res.status(404).json({ success: false, message: "Gali market not found" });
      }

      market.jodi_result = cleanJodi;
      market.is_closed = true;
      await market.save();

      const lDigit = cleanJodi[0];
      const rDigit = cleanJodi[1];

      // Game rate multipliers (Default 1 ka 10 for Single, 1 ka 100 for Jodi)
      let rateSingleDigit = 10;
      let rateJodi = 100;

      try {
        const dbRates = await GameRate.find({ active: true }).lean();
        const galiCategoryRates = dbRates.filter(r => {
          const cat = (r.category || '').toLowerCase();
          return cat.includes('gali') || cat.includes('disawar') || cat.includes('jackpot');
        });

        const targetRatesList = galiCategoryRates.length > 0 ? galiCategoryRates : dbRates;

        for (const r of targetRatesList) {
          const rName = (r.name || '').toLowerCase();
          const valStr = String(r.value || '').trim();
          const match = valStr.match(/(\d+)\s*$/) || valStr.match(/ka\s*(\d+)/i) || valStr.match(/(\d+)/);
          const multVal = match ? parseInt(match[1], 10) : null;

          if (multVal && multVal > 0) {
            if (rName.includes('jodi')) {
              rateJodi = multVal;
            } else if (rName.includes('single') || rName.includes('ank') || rName.includes('digit')) {
              rateSingleDigit = multVal;
            }
          }
        }
      } catch (err) {
        console.warn("Using default Gali game rates:", err);
      }

      // Settle all Pending bids for this Gali market
      const pendingBids = await Bid.find({
        marketName: new RegExp(`^${market.name.trim()}$`, 'i'),
        status: "Pending"
      });

      let winnersCount = 0;
      let totalWinAmount = 0;

      for (const bid of pendingBids) {
        const mode = (bid.gameMode || bid.game_type || '').toLowerCase().replace(/-/g, ' ');
        const digit = String(bid.digit || bid.jodi || bid.pana || bid.number || bid.bid_digit || '').trim();
        const pts = Number(bid.points) || 0;

        let isWin = false;
        let mult = rateSingleDigit;

        if (mode.includes('left')) {
          if (digit === lDigit) { isWin = true; mult = rateSingleDigit; }
        } else if (mode.includes('right')) {
          if (digit === rDigit) { isWin = true; mult = rateSingleDigit; }
        } else if (mode.includes('jodi')) {
          if (digit === cleanJodi) { isWin = true; mult = rateJodi; }
        } else if (mode.includes('digit')) {
          if (digit === lDigit || digit === rDigit) { isWin = true; mult = rateSingleDigit; }
        }

        if (isWin) {
          const winAmount = pts * mult;
          bid.status = "Won";
          bid.winAmount = winAmount;
          bid.win_amount = winAmount;
          winnersCount++;
          totalWinAmount += winAmount;

          // Credit user wallet balance directly
          const mob = bid.userMobile || bid.mobile;
          if (mob) {
            await User.findOneAndUpdate(
              { mobile: mob },
              { $inc: { balance: winAmount, wallet_balance: winAmount } }
            );
          } else if (bid.userId) {
            await User.findByIdAndUpdate(
              bid.userId,
              { $inc: { balance: winAmount, wallet_balance: winAmount } }
            );
          }
        } else {
          bid.status = "Lost";
          bid.winAmount = 0;
          bid.win_amount = 0;
        }

        await bid.save();
      }

      return res.status(200).json({
        success: true,
        message: `Gali result ${cleanJodi} declared & settled! Winners: ${winnersCount}, Total Paid: ₹${totalWinAmount} 🎯`,
        data: market,
        settlement: {
          totalBids: pendingBids.length,
          winnersCount,
          totalWinAmount
        }
      });
    }

    return res.status(200).json({ success: true, message: "Gali result declared (Demo mode)" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addGaliMarket = async (req, res) => {
  try {
    const { name, time } = req.body;
    if (!name || !time) {
      return res.status(400).json({ success: false, message: "Market name and time are required" });
    }
    const newMarket = await GaliMarket.create({
      name: String(name).trim().toUpperCase(),
      time: String(time).trim(),
      jodi_result: "**",
      is_closed: false
    });
    return res.status(201).json({ success: true, message: "Gali market added successfully!", data: newMarket });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGaliMarket = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, time, is_closed, jodi_result } = req.body;
    
    let market = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      market = await GaliMarket.findById(id);
    }
    if (!market) {
      market = await GaliMarket.findOne({ name: new RegExp(`^${String(name || id).trim()}$`, "i") });
    }

    if (!market) {
      return res.status(404).json({ success: false, message: "Gali market not found" });
    }

    if (name) market.name = String(name).trim().toUpperCase();
    if (time) market.time = String(time).trim();
    if (is_closed !== undefined) market.is_closed = is_closed;
    if (jodi_result !== undefined) market.jodi_result = String(jodi_result).trim();
    await market.save();
    return res.status(200).json({ success: true, message: "Gali market updated successfully!", data: market });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGaliMarket = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await GaliMarket.findByIdAndDelete(id);
    } else {
      await GaliMarket.deleteMany({ name: new RegExp(`^${String(id).trim()}$`, "i") });
    }
    return res.status(200).json({ success: true, message: "Gali market deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAllGaliMarkets = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await GaliMarket.deleteMany({});
    }
    return res.status(200).json({ success: true, message: "All Gali markets deleted successfully from database! 🗑️" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
