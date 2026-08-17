import GameSettings from "../models/GameSettings.js";
import GameRiskSettings from "../models/GameRiskSettings.js";
import GameEngine from "../game/GameEngine.js";
import CrashEngine from "../game/CrashEngine.js";
import mongoose from "mongoose";
import Bid from "../../matka/models/Bid.js";

export const getSettings = async (req, res) => {
  try {
    let settings = null;
    let riskSettings = null;

    if (mongoose.connection.readyState === 1) {
      settings = await GameSettings.findOne({ game: "AVIATOR" });
      if (!settings) {
        settings = await GameSettings.create({ game: "AVIATOR" });
      }

      riskSettings = await GameRiskSettings.findOne({ game: "AVIATOR" });
      if (!riskSettings) {
        riskSettings = await GameRiskSettings.create({ game: "AVIATOR" });
      }
    } else {
      settings = await CrashEngine.loadSettings();
      riskSettings = await CrashEngine.loadRiskSettings();
    }

    return res.json({
      success: true,
      data: {
        settings,
        riskSettings,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const {
      autoMode,
      targetProfitPercent,
      minCrash,
      maxCrash,
      maxTotalBet,
      maxLiability,
      autoProtection,
    } = req.body;

    let settings = null;
    let riskSettings = null;

    if (mongoose.connection.readyState === 1) {
      settings = await GameSettings.findOneAndUpdate(
        { game: "AVIATOR" },
        {
          ...(autoMode !== undefined && { autoMode }),
          ...(targetProfitPercent !== undefined && { targetProfitPercent }),
          ...(minCrash !== undefined && { minCrash }),
          ...(maxCrash !== undefined && { maxCrash }),
        },
        { new: true, upsert: true }
      );

      riskSettings = await GameRiskSettings.findOneAndUpdate(
        { game: "AVIATOR" },
        {
          ...(maxTotalBet !== undefined && { maxTotalBet }),
          ...(maxLiability !== undefined && { maxLiability }),
          ...(autoProtection !== undefined && { autoProtection }),
          ...(targetProfitPercent !== undefined && { targetProfitPercent }),
        },
        { new: true, upsert: true }
      );
    } else {
      CrashEngine.settings = {
        ...CrashEngine.settings,
        ...(autoMode !== undefined && { autoMode }),
        ...(targetProfitPercent !== undefined && { targetProfitPercent }),
        ...(minCrash !== undefined && { minCrash }),
        ...(maxCrash !== undefined && { maxCrash }),
      };
      CrashEngine.riskSettings = {
        ...CrashEngine.riskSettings,
        ...(maxTotalBet !== undefined && { maxTotalBet }),
        ...(maxLiability !== undefined && { maxLiability }),
        ...(autoProtection !== undefined && { autoProtection }),
        ...(targetProfitPercent !== undefined && { targetProfitPercent }),
      };
      settings = CrashEngine.settings;
      riskSettings = CrashEngine.riskSettings;
    }

    // Update CrashEngine in-memory cache IMMEDIATELY so new profit % takes effect instantly!
    CrashEngine.settings = settings;
    CrashEngine.riskSettings = riskSettings;

    console.log(`⚙️ Admin Target Profit Percent Updated to ${targetProfitPercent}%! Live engine updated.`);

    return res.json({
      success: true,
      message: `Settings updated successfully to ${targetProfitPercent}% profit`,
      data: { settings, riskSettings },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forceCrashNext = async (req, res) => {
  try {
    const { multiplier } = req.body;

    if (!multiplier || isNaN(multiplier) || multiplier < 1.0) {
      return res.status(400).json({
        success: false,
        message: "Valid multiplier >= 1.0 is required",
      });
    }

    const mult = Number(parseFloat(multiplier).toFixed(2));
    GameEngine.setNextCrashMultiplier(mult);

    if (mongoose.connection.readyState === 1) {
      await GameRiskSettings.findOneAndUpdate(
        { game: "AVIATOR" },
        { forceCrash: true, forceCrashMultiplier: mult },
        { upsert: true }
      );
    }

    return res.json({
      success: true,
      message: `Next round crash point set to ${mult}x`,
      multiplier: mult,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forceCrashNow = async (req, res) => {
  try {
    const result = await GameEngine.forceCrashNow();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStats = async (req, res) => {
  try {
    const liveState = GameEngine.getAdminStats();

    let lifetimeBets = 0;
    let lifetimePayouts = 0;

    if (mongoose.connection.readyState === 1) {
      const aggResult = await Bid.aggregate([
        { $match: { marketName: "AVIATOR CASINO" } },
        {
          $group: {
            _id: null,
            totalBets: { $sum: "$points" },
            totalPayouts: { $sum: "$winAmount" }
          }
        }
      ]).catch(() => []);

      if (aggResult && aggResult.length > 0) {
        lifetimeBets = Number(aggResult[0].totalBets) || 0;
        lifetimePayouts = Number(aggResult[0].totalPayouts) || 0;
      }
    }

    const lifetimeProfit = Math.max(0, lifetimeBets - lifetimePayouts);
    const lifetimeMargin = lifetimeBets > 0 ? Math.round((lifetimeProfit / lifetimeBets) * 100) : 100;

    const currentPlayers = liveState.players || [];
    const currentRoundBetTotal = currentPlayers.reduce((sum, p) => sum + (Number(p.amount || p.betAmount) || 0), 0);
    const currentRoundPayoutTotal = currentPlayers.reduce((sum, p) => sum + (Number(p.wonAmount) || 0), 0);

    return res.json({
      success: true,
      data: {
        ...liveState,
        lifetimeBets,
        lifetimePayouts,
        lifetimeProfit,
        lifetimeMargin,
        currentRoundBetTotal,
        currentRoundPayoutTotal
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
