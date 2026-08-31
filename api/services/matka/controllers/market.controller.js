import Market from "../models/Market.js";
import Bid from "../models/Bid.js";
import User from "../../auth/models/User.js";
import GameRate from "../models/GameRate.js";
import DeclaredResultHistory from "../models/DeclaredResultHistory.js";
import Notification from "../../auth/models/Notification.js";
import { broadcastResultNotification } from "../../auth/controllers/notification.controller.js";
import mongoose from "mongoose";
import dpbossAutoSyncService from "../services/dpbossAutoSyncService.js";

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

// Calculate single digit from 3-digit Pana (Sum mod 10)
const calculateSingleDigit = (pana) => {
  if (!pana || pana === '***' || String(pana).trim().length !== 3 || isNaN(pana)) return '*';
  const sum = String(pana).trim().split('').reduce((acc, digit) => acc + (parseInt(digit, 10) || 0), 0);
  return String(sum % 10);
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

const formatMarketResult = (marketDoc) => {
  const market = marketDoc.toObject ? marketDoc.toObject() : marketDoc;
  const todayIST = getCurrentDateIST();

  let rawOpen = market.result_open && market.result_open !== '***' ? String(market.result_open).trim() : '***';
  let rawClose = market.result_close && market.result_close !== '***' ? String(market.result_close).trim() : '***';

  // Guard 1: If result_date is not today's date, hide old results!
  if (market.result_date && market.result_date !== todayIST) {
    rawOpen = '***';
    rawClose = '***';
  }

  // Guard 2: If current time is before market open_time, hide open result!
  if (!isOpenTimeReached(market.open_time)) {
    rawOpen = '***';
  }

  // Guard 3: If current time is before market close_time, hide close result!
  if (!isCloseTimeReached(market.open_time, market.close_time)) {
    rawClose = '***';
  }

  const openPana = rawOpen;
  const closePana = rawClose;

  const openDigit = calculateSingleDigit(openPana);
  const closeDigit = calculateSingleDigit(closePana);

  let jodi = '**';
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
      const cleanName = market_name.trim().toUpperCase();
      const existingMarket = await Market.findOne({ 
        market_name: new RegExp(`^${cleanName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') 
      });

      if (existingMarket) {
        return res.status(400).json({ 
          success: false, 
          message: `Market "${cleanName}" already exists in Database!` 
        });
      }

      const newMarket = await Market.create({
        market_name: cleanName,
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
    const { marketId, market_name, marketName, game, openPana, closePana, resultOpen, resultClose, jodiResult } = req.body;
    const targetName = (market_name || marketName || game || '').trim();
    const openPanaVal = resultOpen || openPana;
    const closePanaVal = resultClose || closePana;

    if (mongoose.connection.readyState === 1) {
      let market = null;
      if (marketId) {
        market = await Market.findById(marketId);
      }
      if (!market && targetName) {
        market = await Market.findOne({ market_name: new RegExp(`^${targetName}$`, 'i') });
      }

      if (!market && targetName) {
        market = await Market.create({
          market_name: targetName.toUpperCase(),
          open_time: "09:00 AM",
          close_time: "10:00 PM",
          result_open: openPanaVal || "***",
          result_close: closePanaVal || "***",
          jodi_result: jodiResult || "**"
        });
      }

      if (market) {
        const todayIST = getCurrentDateIST();
        const hasOpenToSet = openPanaVal !== undefined && openPanaVal !== null && openPanaVal !== "" && openPanaVal !== "***";
        const hasCloseToSet = closePanaVal !== undefined && closePanaVal !== null && closePanaVal !== "" && closePanaVal !== "***";

        if (hasOpenToSet && !isOpenTimeReached(market.open_time)) {
          return res.status(400).json({
            success: false,
            message: `Cannot declare Open result before market open time (${market.open_time})!`
          });
        }

        if (hasCloseToSet && !isCloseTimeReached(market.open_time, market.close_time)) {
          return res.status(400).json({
            success: false,
            message: `Cannot declare Close result before market close time (${market.close_time})!`
          });
        }

        // If updating for a new day, reset close result when setting fresh open result
        if (market.result_date !== todayIST && hasOpenToSet) {
          market.result_close = "***";
        }

        if (hasOpenToSet) {
          market.result_open = String(openPanaVal).trim();
          market.result_date = todayIST;
        }
        if (hasCloseToSet) {
          market.result_close = String(closePanaVal).trim();
          market.result_date = todayIST;
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

        // Dynamic Rate Multipliers (Default standard rates)
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
        } catch (rErr) {
          console.warn("Using default game rates:", rErr);
        }

        // Settle bids phased: Open result settles Open bids, Close result settles Close & Jodi bids
        const finalMarketName = market.market_name || targetName;

        // 1. Create Broadcast / Global Notification for all users and send FCM Push
        try {
          let notifTitle = `📢 ${finalMarketName.toUpperCase()} RESULT DECLARED`;
          let notifMsg = "";
          if (hasOpenToSet && hasCloseToSet) {
            notifMsg = `${finalMarketName} Full Result: ${market.result_open}-${market.jodi_result}-${market.result_close}`;
          } else if (hasOpenToSet) {
            notifMsg = `${finalMarketName} Open Pana ${market.result_open} (Digit ${openDigit}) Declared! Result: ${market.result_open}-${openDigit}*`;
          } else if (hasCloseToSet) {
            notifMsg = `${finalMarketName} Close Pana ${market.result_close} (Digit ${closeDigit}) Declared! Full Result: ${market.result_open}-${market.jodi_result}-${market.result_close}`;
          }

          if (notifMsg) {
            await broadcastResultNotification(notifTitle, notifMsg);
          }
        } catch (nErr) {
          console.warn("Global notification creation failed:", nErr);
        }

        const pendingBids = await Bid.find({
          marketName: new RegExp(`^${finalMarketName.trim()}$`, 'i'),
          status: "Pending"
        });

        const openPanaValid = market.result_open && market.result_open !== '***' && String(market.result_open).trim().length === 3;
        const closePanaValid = market.result_close && market.result_close !== '***' && String(market.result_close).trim().length === 3;

        for (const bid of pendingBids) {
          const mode = (bid.gameMode || '').toLowerCase().replace(/-/g, ' ');
          const pts = Number(bid.points) || 0;
          const session = bid.session || 'Open';

          let shouldEvaluate = false;
          let isWin = false;
          let mult = rateSingleDigit;

          // 1. OPEN SESSION BIDS (Settle immediately when Open result is declared)
          if (session === 'Open') {
            if (openPanaValid) {
              shouldEvaluate = true;
              if (mode.includes('single digit') || mode.includes('single ank') || mode.includes('ank') || mode.includes('two digit') || mode.includes('odd') || mode.includes('even') || mode.includes('digit based')) {
                if (openDigit !== '*' && String(bid.digit) === String(openDigit)) { isWin = true; mult = rateSingleDigit; }
              } else if (mode.includes('single pana') || mode.includes('single patti') || mode.includes('sp motor')) {
                if (String(bid.pana || bid.digit) === String(market.result_open)) { isWin = true; mult = rateSinglePana; }
              } else if (mode.includes('double pana') || mode.includes('double patti') || mode.includes('dp motor')) {
                if (String(bid.pana || bid.digit) === String(market.result_open)) { isWin = true; mult = rateDoublePana; }
              } else if (mode.includes('triple pana') || mode.includes('triple patti')) {
                if (String(bid.pana || bid.digit) === String(market.result_open)) { isWin = true; mult = rateTriplePana; }
              } else if (mode.includes('sp dp tp')) {
                if (String(bid.pana || bid.digit) === String(market.result_open)) {
                  isWin = true;
                  const targetPana = String(market.result_open);
                  const isTriple = targetPana[0] === targetPana[1] && targetPana[1] === targetPana[2];
                  const isDouble = targetPana[0] === targetPana[1] || targetPana[1] === targetPana[2] || targetPana[0] === targetPana[2];
                  mult = isTriple ? rateTriplePana : (isDouble ? rateDoublePana : rateSinglePana);
                }
              }
            }
          }

          // 2. CLOSE SESSION BIDS (Settle immediately when Close result is declared)
          else if (session === 'Close') {
            if (closePanaValid) {
              shouldEvaluate = true;
              if (mode.includes('single digit') || mode.includes('single ank') || mode.includes('ank') || mode.includes('two digit') || mode.includes('odd') || mode.includes('even') || mode.includes('digit based')) {
                if (closeDigit !== '*' && String(bid.digit) === String(closeDigit)) { isWin = true; mult = rateSingleDigit; }
              } else if (mode.includes('single pana') || mode.includes('single patti') || mode.includes('sp motor')) {
                if (String(bid.pana || bid.digit) === String(market.result_close)) { isWin = true; mult = rateSinglePana; }
              } else if (mode.includes('double pana') || mode.includes('double patti') || mode.includes('dp motor')) {
                if (String(bid.pana || bid.digit) === String(market.result_close)) { isWin = true; mult = rateDoublePana; }
              } else if (mode.includes('triple pana') || mode.includes('triple patti')) {
                if (String(bid.pana || bid.digit) === String(market.result_close)) { isWin = true; mult = rateTriplePana; }
              } else if (mode.includes('sp dp tp')) {
                if (String(bid.pana || bid.digit) === String(market.result_close)) {
                  isWin = true;
                  const targetPana = String(market.result_close);
                  const isTriple = targetPana[0] === targetPana[1] && targetPana[1] === targetPana[2];
                  const isDouble = targetPana[0] === targetPana[1] || targetPana[1] === targetPana[2] || targetPana[0] === targetPana[2];
                  mult = isTriple ? rateTriplePana : (isDouble ? rateDoublePana : rateSinglePana);
                }
              }
            }
          }

          // 3. JODI, RED BRACKETS & SANGAM BIDS (Settle when both Open and Close are declared)
          else if (mode.includes('jodi') || mode.includes('red brackets')) {
            if (openPanaValid && closePanaValid) {
              shouldEvaluate = true;
              if (market.jodi_result && !market.jodi_result.includes('*') && String(bid.jodi || bid.digit) === String(market.jodi_result)) {
                isWin = true; mult = rateJodi;
              }
            }
          } else if (mode.includes('sangam') || mode.includes('sang')) {
            if (openPanaValid && closePanaValid) {
              shouldEvaluate = true;
              if (bid.openPana && bid.closePana && String(bid.openPana) === String(market.result_open) && String(bid.closePana) === String(market.result_close)) {
                isWin = true; mult = rateSangam;
              } else if (bid.openDigit && bid.closePana && String(bid.openDigit) === String(openDigit) && String(bid.closePana) === String(market.result_close)) {
                isWin = true; mult = rateSangam;
              } else if (bid.openPana && bid.closeDigit && String(bid.openPana) === String(market.result_open) && String(bid.closeDigit) === String(closeDigit)) {
                isWin = true; mult = rateSangam;
              }
            }
          }

          // Execute settlement if evaluated in current declaration phase
          if (shouldEvaluate) {
            const userTargetId = String(bid.userId || bid.userMobile || '');
            const bidDigitPana = String(bid.digit || bid.pana || bid.jodi || '');

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

              // Send Win Notification to Bidder
              if (userTargetId) {
                await Notification.create({
                  title: `🎉 WINNER! ${finalMarketName.toUpperCase()}`,
                  content: `Congratulations! You WON ₹${winAmt} on your bid (${bid.gameMode || 'Bid'} - Digit: ${bidDigitPana}) in ${finalMarketName}! ₹${winAmt} credited to your wallet.`,
                  isGlobal: false,
                  targetUser: userTargetId
                }).catch(() => {});
              }
            } else {
              bid.status = "Lost";
              bid.winAmount = 0;
              await bid.save();

              // Send Loss Notification to Bidder
              if (userTargetId) {
                await Notification.create({
                  title: `❌ BID RESULT: ${finalMarketName.toUpperCase()}`,
                  content: `Your bid of ₹${pts} on (${bid.gameMode || 'Bid'} - Digit: ${bidDigitPana}) in ${finalMarketName} did not match. Better luck next time!`,
                  isGlobal: false,
                  targetUser: userTargetId
                }).catch(() => {});
              }
            }
          }
        }

        // Save permanent record to DeclaredResultHistory collection for Charts
        await DeclaredResultHistory.findOneAndUpdate(
          { market_name: market.market_name.toUpperCase(), date: todayIST },
          {
            open_pana: market.result_open || "***",
            close_pana: market.result_close || "***",
            jodi_result: market.jodi_result || "**"
          },
          { upsert: true, new: true }
        ).catch(() => {});

        return res.status(200).json({
          success: true,
          message: "Result declared & session bids settled successfully! 🎯",
          data: formatMarketResult(market)
        });
      }
    }

    return res.status(200).json({ success: true, message: "Result declared (Demo mode)" });
  } catch (error) {
    console.error("Error declaring result:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMarketChartHistory = async (req, res) => {
  try {
    const marketName = (req.query.market_name || req.query.market || '').trim().toUpperCase();
    let history = [];
    if (mongoose.connection.readyState === 1 && marketName) {
      history = await DeclaredResultHistory.find({
        market_name: new RegExp(`^${marketName}$`, 'i')
      }).sort({ date: -1 }).limit(100).lean();
    }
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleAutoMaster = async (req, res) => {
  try {
    const { enabled } = req.body;
    const isEnabled = typeof enabled === 'boolean' ? enabled : req.body.enabled !== 'false';
    dpbossAutoSyncService.setAutoMaster(isEnabled);
    return res.status(200).json({
      success: true,
      message: `Auto Master System ${isEnabled ? 'ENABLED ⚡' : 'PAUSED ⏸️'}`,
      autoMasterEnabled: isEnabled
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
