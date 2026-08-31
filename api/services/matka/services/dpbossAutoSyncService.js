import Market from "../models/Market.js";
import Bid from "../models/Bid.js";
import User from "../../auth/models/User.js";
import GameRate from "../models/GameRate.js";
import DeclaredResultHistory from "../models/DeclaredResultHistory.js";
import { broadcastResultNotification } from "../../auth/controllers/notification.controller.js";
import mongoose from "mongoose";

const API_BASE_URL = 'https://dpbpssapi.growva.tech';

// Helper to calculate single digit from 3-digit Pana (Sum mod 10)
const calculateSingleDigit = (pana) => {
  if (!pana || pana === '***' || String(pana).trim().length !== 3 || isNaN(pana)) return '*';
  const sum = String(pana).trim().split('').reduce((acc, digit) => acc + (parseInt(digit, 10) || 0), 0);
  return String(sum % 10);
};

// Helper to parse rate values e.g. "1 ka 9.5" or "1 ka 140"
const parseMultiplier = (rateStr, defaultMult) => {
  if (!rateStr) return defaultMult;
  const str = String(rateStr).trim();
  const match = str.match(/(\d+(?:\.\d+)?)\s*ka\s*(\d+(?:\.\d+)?)/i);
  if (match) {
    const bet = parseFloat(match[1]);
    const win = parseFloat(match[2]);
    if (bet > 0 && win > 0) return win / bet;
  }
  const num = parseFloat(str);
  return isNaN(num) || num <= 0 ? defaultMult : num;
};

const getCurrentDateIST = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

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

const getCurrentTimeInMinutesIST = () => {
  const nowStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const nowIST = new Date(nowStr);
  return nowIST.getHours() * 60 + nowIST.getMinutes();
};

const isOpenTimeReached = (openTimeStr) => {
  if (!openTimeStr) return true;
  const openMins = parseTimeToMinutes(openTimeStr);
  if (openMins === 99999) return true;
  const currentMins = getCurrentTimeInMinutesIST();
  return currentMins >= openMins;
};

const isCloseTimeReached = (openTimeStr, closeTimeStr) => {
  if (!closeTimeStr) return true;
  const openMins = parseTimeToMinutes(openTimeStr);
  const closeMins = parseTimeToMinutes(closeTimeStr);
  if (closeMins === 99999) return true;
  const currentMins = getCurrentTimeInMinutesIST();

  if (closeMins < openMins) {
    return currentMins >= closeMins && currentMins < openMins;
  }
  return currentMins >= closeMins;
};

class DpbossAutoSyncService {
  constructor() {
    this.intervalId = null;
    this.midnightCheckId = null;
    this.lastResetDate = getCurrentDateIST();
    this.isSyncing = false;
    this.autoMasterEnabled = true; // Default ON
  }

  setAutoMaster(enabled) {
    this.autoMasterEnabled = Boolean(enabled);
    console.log(`⚡ DPBOSS Auto Master set to: ${this.autoMasterEnabled ? 'ON (Auto-Sync Active)' : 'OFF (Paused)'}`);
  }

  start() {
    console.log("🌐 DPBOSS Live API Auto-Sync Service Starting (30s Polling + Midnight Reset)...");
    
    // Check and clear outdated results immediately on service startup
    this.checkStartupDateReset();

    // 1. Run sync every 30 seconds
    this.intervalId = setInterval(() => {
      this.syncLiveApiResults();
    }, 30000);

    // Initial immediate sync after 5 seconds
    setTimeout(() => {
      this.syncLiveApiResults();
    }, 5000);

    // 2. Run Midnight Reset check every 1 minute
    this.midnightCheckId = setInterval(() => {
      this.checkMidnightReset();
    }, 60000);
  }

  async checkStartupDateReset() {
    if (mongoose.connection.readyState !== 1) return;
    try {
      const todayIST = getCurrentDateIST();
      const res = await Market.updateMany(
        { result_date: { $ne: todayIST } },
        {
          $set: {
            result_open: "***",
            result_close: "***",
            jodi_result: "**"
          }
        }
      );
      if (res.modifiedCount > 0) {
        console.log(`🧹 Startup Reset: Cleared ${res.modifiedCount} outdated market results to ***-**-***.`);
      }
    } catch (err) {
      console.error("Error performing startup date reset:", err);
    }
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.midnightCheckId) clearInterval(this.midnightCheckId);
    console.log("⏸️ DPBOSS Auto-Sync Service stopped.");
  }

  // Check if Midnight (12:00 AM IST) has arrived for New Day Reset
  async checkMidnightReset() {
    try {
      const currentDateIST = getCurrentDateIST();
      if (currentDateIST !== this.lastResetDate) {
        console.log(`🌙 Midnight New Day Detected (${currentDateIST})! Clearing market results for fresh day...`);
        this.lastResetDate = currentDateIST;
        await this.resetAllMarketsForNewDay();
      }
    } catch (err) {
      console.error("Error checking midnight reset:", err);
    }
  }

  // Reset all market active results back to ***-**-*** at 12:00 AM
  async resetAllMarketsForNewDay() {
    if (mongoose.connection.readyState !== 1) return;
    try {
      const res = await Market.updateMany({}, {
        $set: {
          result_open: "***",
          result_close: "***",
          jodi_result: "**",
          result_date: ""
        }
      });
      console.log(`🎉 New Day Reset Complete! ${res.modifiedCount || 0} markets reset to ***-**-***.`);
    } catch (err) {
      console.error("Failed to reset markets for new day:", err);
    }
  }

  // Auto-sync Live Results from https://dpbpssapi.growva.tech/api/markets
  async syncLiveApiResults() {
    if (!this.autoMasterEnabled) {
      // Auto Master is OFF! Skip automatic syncing.
      return;
    }
    if (this.isSyncing || mongoose.connection.readyState !== 1) return;
    this.isSyncing = true;

    try {
      const response = await fetch(`${API_BASE_URL}/api/markets`);
      const data = await response.json();

      if (!data || !Array.isArray(data.markets)) {
        this.isSyncing = false;
        return;
      }

      const externalMarkets = data.markets;
      const dbMarkets = await Market.find({});
      const todayIST = getCurrentDateIST();

      for (const dbMarket of dbMarkets) {
        const dbName = (dbMarket.market_name || dbMarket.name || '').toUpperCase().trim();
        if (!dbName) continue;

        // Match with external market
        const matchedApiItem = externalMarkets.find(
          item => (item.name || '').toUpperCase().trim() === dbName
        );

        if (!matchedApiItem || !matchedApiItem.result || matchedApiItem.result.includes('***') || matchedApiItem.result === 'Loading...') {
          continue;
        }

        // Parse result e.g. "126-90-299" or "278-7"
        const rawResult = String(matchedApiItem.result).trim();
        const parts = rawResult.split('-');

        let apiOpenPana = '';
        let apiJodi = '';
        let apiClosePana = '';

        if (parts.length === 3) {
          apiOpenPana = parts[0];
          apiJodi = parts[1];
          apiClosePana = parts[2];
        } else if (parts.length === 2) {
          apiOpenPana = parts[0];
          apiJodi = parts[1];
        }

        let needsUpdate = false;
        let updateOpen = false;
        let updateClose = false;

        const canSyncOpen = isOpenTimeReached(dbMarket.open_time);
        const canSyncClose = isCloseTimeReached(dbMarket.open_time, dbMarket.close_time);

        // Check if Open Pana is newly declared AND open time reached
        if (canSyncOpen && apiOpenPana && apiOpenPana.length === 3) {
          // If updating for a new day, clear previous close result
          if (dbMarket.result_date !== todayIST) {
            dbMarket.result_close = '***';
          }
          if (!dbMarket.result_open || dbMarket.result_open === '***' || dbMarket.result_open !== apiOpenPana) {
            dbMarket.result_open = apiOpenPana;
            dbMarket.result_date = todayIST;
            needsUpdate = true;
            updateOpen = true;
          }
        }

        // Check if Close Pana is newly declared AND close time reached
        if (canSyncClose && apiClosePana && apiClosePana.length === 3) {
          if (!dbMarket.result_close || dbMarket.result_close === '***' || dbMarket.result_close !== apiClosePana) {
            dbMarket.result_close = apiClosePana;
            dbMarket.result_date = todayIST;
            needsUpdate = true;
            updateClose = true;
          }
        }

        // Calculate center Jodi
        const openDigit = calculateSingleDigit(dbMarket.result_open);
        const closeDigit = calculateSingleDigit(dbMarket.result_close);

        if (openDigit !== '*' && closeDigit !== '*') {
          dbMarket.jodi_result = `${openDigit}${closeDigit}`;
        } else if (openDigit !== '*') {
          dbMarket.jodi_result = `${openDigit}*`;
        } else if (apiJodi) {
          dbMarket.jodi_result = apiJodi;
        }

        if (needsUpdate) {
          await dbMarket.save();
          console.log(`🎯 Auto-Synced Live Result for ${dbName}: ${dbMarket.result_open}-${dbMarket.jodi_result}-${dbMarket.result_close}`);

          // Broadcast FCM Push Notification to all users
          const notifTitle = `📢 ${dbName.toUpperCase()} RESULT DECLARED`;
          const notifMsg = `${dbName} Result Declared: ${dbMarket.result_open}-${dbMarket.jodi_result}-${dbMarket.result_close}`;
          broadcastResultNotification(notifTitle, notifMsg).catch(() => {});

          // Trigger automated payout settlement for this market
          await this.settleMarketBids(dbMarket, updateOpen, updateClose);

          // Save record in history collection
          await DeclaredResultHistory.findOneAndUpdate(
            { market_name: dbName, date: todayIST },
            {
              open_pana: dbMarket.result_open || "***",
              close_pana: dbMarket.result_close || "***",
              jodi_result: dbMarket.jodi_result || "**"
            },
            { upsert: true, new: true }
          ).catch(() => {});
        }
      }
    } catch (err) {
      console.warn("Auto-sync loop warning:", err.message);
    } finally {
      this.isSyncing = false;
    }
  }

  // Settle pending user bids & credit winnings to wallets
  async settleMarketBids(marketDoc, updateOpen, updateClose) {
    try {
      const marketName = marketDoc.market_name || marketDoc.name;
      const pendingBids = await Bid.find({
        marketName: new RegExp(`^${marketName.trim()}$`, 'i'),
        status: "Pending"
      });

      if (pendingBids.length === 0) return;

      const openPanaValid = marketDoc.result_open && marketDoc.result_open !== '***' && String(marketDoc.result_open).trim().length === 3;
      const closePanaValid = marketDoc.result_close && marketDoc.result_close !== '***' && String(marketDoc.result_close).trim().length === 3;

      const openDigit = calculateSingleDigit(marketDoc.result_open);
      const closeDigit = calculateSingleDigit(marketDoc.result_close);

      // Dynamic Rate Multipliers
      let rateSingleDigit = 9.5;
      let rateJodi = 95;
      let rateSinglePana = 140;
      let rateDoublePana = 280;
      let rateTriplePana = 600;
      let rateSangam = 1000;

      try {
        const dbRates = await GameRate.find({ active: true }).lean();
        for (const r of dbRates) {
          const rName = (r.name || '').toLowerCase();
          if (rName.includes('single digit') || rName.includes('single ank')) rateSingleDigit = parseMultiplier(r.value, 9.5);
          else if (rName.includes('jodi')) rateJodi = parseMultiplier(r.value, 95);
          else if (rName.includes('single pana') || rName.includes('single patti')) rateSinglePana = parseMultiplier(r.value, 140);
          else if (rName.includes('double pana') || rName.includes('double patti')) rateDoublePana = parseMultiplier(r.value, 280);
          else if (rName.includes('triple pana') || rName.includes('triple patti')) rateTriplePana = parseMultiplier(r.value, 600);
          else if (rName.includes('sangam')) rateSangam = parseMultiplier(r.value, 1000);
        }
      } catch (e) {}

      for (const bid of pendingBids) {
        const mode = (bid.gameMode || '').toLowerCase().replace(/-/g, ' ');
        const pts = Number(bid.points) || 0;
        const session = bid.session || 'Open';

        let shouldEvaluate = false;
        let isWin = false;
        let mult = rateSingleDigit;

        if (session === 'Open') {
          if (openPanaValid) {
            shouldEvaluate = true;
            if (mode.includes('single digit') || mode.includes('single ank') || mode.includes('ank') || mode.includes('two digit') || mode.includes('odd') || mode.includes('even') || mode.includes('digit based')) {
              if (openDigit !== '*' && String(bid.digit) === String(openDigit)) { isWin = true; mult = rateSingleDigit; }
            } else if (mode.includes('single pana') || mode.includes('single patti') || mode.includes('sp motor')) {
              if (String(bid.pana || bid.digit) === String(marketDoc.result_open)) { isWin = true; mult = rateSinglePana; }
            } else if (mode.includes('double pana') || mode.includes('double patti') || mode.includes('dp motor')) {
              if (String(bid.pana || bid.digit) === String(marketDoc.result_open)) { isWin = true; mult = rateDoublePana; }
            } else if (mode.includes('triple pana') || mode.includes('triple patti')) {
              if (String(bid.pana || bid.digit) === String(marketDoc.result_open)) { isWin = true; mult = rateTriplePana; }
            } else if (mode.includes('sp dp tp')) {
              if (String(bid.pana || bid.digit) === String(marketDoc.result_open)) {
                isWin = true;
                const targetPana = String(marketDoc.result_open);
                const isTriple = targetPana[0] === targetPana[1] && targetPana[1] === targetPana[2];
                const isDouble = targetPana[0] === targetPana[1] || targetPana[1] === targetPana[2] || targetPana[0] === targetPana[2];
                mult = isTriple ? rateTriplePana : (isDouble ? rateDoublePana : rateSinglePana);
              }
            }
          }
        } else if (session === 'Close') {
          if (closePanaValid) {
            shouldEvaluate = true;
            if (mode.includes('single digit') || mode.includes('single ank') || mode.includes('ank') || mode.includes('two digit') || mode.includes('odd') || mode.includes('even') || mode.includes('digit based')) {
              if (closeDigit !== '*' && String(bid.digit) === String(closeDigit)) { isWin = true; mult = rateSingleDigit; }
            } else if (mode.includes('single pana') || mode.includes('single patti') || mode.includes('sp motor')) {
              if (String(bid.pana || bid.digit) === String(marketDoc.result_close)) { isWin = true; mult = rateSinglePana; }
            } else if (mode.includes('double pana') || mode.includes('double patti') || mode.includes('dp motor')) {
              if (String(bid.pana || bid.digit) === String(marketDoc.result_close)) { isWin = true; mult = rateDoublePana; }
            } else if (mode.includes('triple pana') || mode.includes('triple patti')) {
              if (String(bid.pana || bid.digit) === String(marketDoc.result_close)) { isWin = true; mult = rateTriplePana; }
            } else if (mode.includes('sp dp tp')) {
              if (String(bid.pana || bid.digit) === String(marketDoc.result_close)) {
                isWin = true;
                const targetPana = String(marketDoc.result_close);
                const isTriple = targetPana[0] === targetPana[1] && targetPana[1] === targetPana[2];
                const isDouble = targetPana[0] === targetPana[1] || targetPana[1] === targetPana[2] || targetPana[0] === targetPana[2];
                mult = isTriple ? rateTriplePana : (isDouble ? rateDoublePana : rateSinglePana);
              }
            }
          }
        } else if (mode.includes('jodi') || mode.includes('red brackets')) {
          if (openPanaValid && closePanaValid) {
            shouldEvaluate = true;
            if (marketDoc.jodi_result && !marketDoc.jodi_result.includes('*') && String(bid.jodi || bid.digit) === String(marketDoc.jodi_result)) {
              isWin = true; mult = rateJodi;
            }
          }
        } else if (mode.includes('sangam') || mode.includes('sang')) {
          if (openPanaValid && closePanaValid) {
            shouldEvaluate = true;
            if (bid.openPana && bid.closePana && String(bid.openPana) === String(marketDoc.result_open) && String(bid.closePana) === String(marketDoc.result_close)) {
              isWin = true; mult = rateSangam;
            } else if (bid.openDigit && bid.closePana && String(bid.openDigit) === String(openDigit) && String(bid.closePana) === String(marketDoc.result_close)) {
              isWin = true; mult = rateSangam;
            } else if (bid.openPana && bid.closeDigit && String(bid.openPana) === String(marketDoc.result_open) && String(bid.closeDigit) === String(closeDigit)) {
              isWin = true; mult = rateSangam;
            }
          }
        }

        if (shouldEvaluate) {
          if (isWin) {
            const winAmt = Math.round(pts * mult);
            bid.status = "Won";
            bid.winAmount = winAmt;
            await bid.save();

            if (bid.userMobile || bid.userId) {
              const userQuery = bid.userId ? { _id: bid.userId } : { mobile: bid.userMobile };
              await User.findOneAndUpdate(userQuery, { 
                $inc: { 
                  balance: winAmt,
                  "wallet.withdrowalable": winAmt 
                } 
              });
            }
          } else {
            bid.status = "Lost";
            bid.winAmount = 0;
            await bid.save();
          }
        }
      }
    } catch (err) {
      console.error("Error settling market bids:", err);
    }
  }
}

export const dpbossAutoSyncService = new DpbossAutoSyncService();
export default dpbossAutoSyncService;
