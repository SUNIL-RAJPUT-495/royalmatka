import mongoose from "mongoose";
import GameSettings from "../models/GameSettings.js";
import GameRiskSettings from "../models/GameRiskSettings.js";

class CrashEngine {
    constructor() {
        this.settings = null;
        this.riskSettings = null;
        this.overrideCrash = null;
    }

    setNextCrash(multiplier) {
        this.overrideCrash = Number(multiplier);
    }

    async loadRiskSettings() {
        if (mongoose.connection.readyState !== 1) {
            return this.riskSettings || { forceCrash: false, forceCrashMultiplier: null };
        }
        try {
            let risk = await GameRiskSettings.findOne({ game: "AVIATOR" });
            if (!risk) {
                risk = await GameRiskSettings.create({ game: "AVIATOR" });
            }
            this.riskSettings = risk;
            return risk;
        } catch (error) {
            return this.riskSettings || { forceCrash: false, forceCrashMultiplier: null };
        }
    }

    async loadSettings() {
        if (mongoose.connection.readyState !== 1) {
            return this.settings || { minCrash: 1.01, maxCrash: 100, autoMode: true };
        }

        try {
            let settings = await GameSettings.findOne({
                game: "AVIATOR",
            });

            if (!settings) {
                settings = await GameSettings.create({
                    game: "AVIATOR",
                    isActive: true,
                    targetProfitPercent: 15,
                    minCrash: 1.01,
                    maxCrash: 100,
                    autoMode: true,
                });
            }

            this.settings = settings;
            return settings;
        } catch (error) {
            return this.settings || { minCrash: 1.01, maxCrash: 100, autoMode: true };
        }
    }

    async generate() {
        // 1. In-memory override
        if (this.overrideCrash !== null) {
            const forced = this.overrideCrash;
            this.overrideCrash = null;
            return Number(forced.toFixed(2));
        }

        // 2. Database force crash
        const risk = await this.loadRiskSettings();
        if (risk && risk.forceCrash && risk.forceCrashMultiplier) {
            const forced = risk.forceCrashMultiplier;
            if (mongoose.connection.readyState === 1) {
                risk.forceCrash = false;
                await risk.save().catch(() => {});
            }
            return Number(forced.toFixed(2));
        }

        // 3. Normal generation
        const settings = await this.loadSettings();
        const min = settings?.minCrash || 1.01;
        const max = settings?.maxCrash || 100;

        const crashPoint = Math.random() * (max - min) + min;
        return Number(crashPoint.toFixed(2));
    }
}

export default new CrashEngine();