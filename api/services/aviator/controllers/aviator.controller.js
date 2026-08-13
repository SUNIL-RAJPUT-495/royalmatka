import GameSettings from "../models/GameSettings.js";
import GameRiskSettings from "../models/GameRiskSettings.js";
import GameEngine from "../game/GameEngine.js";
import CrashEngine from "../game/CrashEngine.js";
import mongoose from "mongoose";

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

    return res.json({
      success: true,
      message: "Settings updated successfully",
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
    const stats = GameEngine.getAdminStats();
    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
