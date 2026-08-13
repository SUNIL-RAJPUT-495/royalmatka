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

    async generate(activeBets = []) {
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

        // 3. Admin Profit House Edge Algorithm (Guaranteed Admin Profit)
        const settings = await this.loadSettings();
        const profitMargin = (settings?.targetProfitPercent || 25) / 100; // Default 25% Admin Profit

        // Calculate total bets placed by real users
        const totalBetAmount = Array.isArray(activeBets) 
            ? activeBets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
            : 0;

        let crashPoint = 1.20;

        if (totalBetAmount > 0) {
            // Admin Profit Ceiling: Max total payout = Total Bets * (1 - profitMargin)
            const maxAllowedPayout = totalBetAmount * (1 - profitMargin);
            
            const rand = Math.random();
            if (rand < 0.35) {
                // 35% chance: Early crash at 1.00x - 1.15x (Immediate House Profit)
                crashPoint = parseFloat((1.00 + Math.random() * 0.15).toFixed(2));
            } else if (rand < 0.75) {
                // 40% chance: Low crash at 1.16x - 1.85x
                crashPoint = parseFloat((1.16 + Math.random() * 0.69).toFixed(2));
            } else if (rand < 0.95) {
                // 20% chance: Medium crash at 1.86x - 3.20x
                crashPoint = parseFloat((1.86 + Math.random() * 1.34).toFixed(2));
            } else {
                // 5% chance: Controlled stretch 3.21x - 5.50x
                crashPoint = parseFloat((3.21 + Math.random() * 2.29).toFixed(2));
            }

            // Enforce hard mathematical cap so payout NEVER exceeds maxAllowedPayout
            const maxCap = Math.max(1.00, parseFloat((maxAllowedPayout / totalBetAmount).toFixed(2)));
            crashPoint = Math.min(crashPoint, maxCap);
        } else {
            // No real bets placed
            const rand = Math.random();
            if (rand < 0.20) crashPoint = 1.00 + Math.random() * 0.20;
            else if (rand < 0.65) crashPoint = 1.21 + Math.random() * 1.50;
            else if (rand < 0.90) crashPoint = 2.71 + Math.random() * 3.50;
            else crashPoint = 6.21 + Math.random() * 20.0;
        }

        const min = settings?.minCrash || 1.00;
        const max = settings?.maxCrash || 100;
        crashPoint = Math.max(min, Math.min(max, crashPoint));

        return Number(crashPoint.toFixed(2));
    }
}

export default new CrashEngine();