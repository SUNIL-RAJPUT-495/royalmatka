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
            return this.settings || { minCrash: 1.01, maxCrash: 100, autoMode: true, targetProfitPercent: 25 };
        }

        try {
            let settings = await GameSettings.findOne({
                game: "AVIATOR",
            });

            if (!settings) {
                settings = await GameSettings.create({
                    game: "AVIATOR",
                    isActive: true,
                    targetProfitPercent: 25,
                    minCrash: 1.01,
                    maxCrash: 100,
                    autoMode: true,
                });
            }

            this.settings = settings;
            return settings;
        } catch (error) {
            return this.settings || { minCrash: 1.01, maxCrash: 100, autoMode: true, targetProfitPercent: 25 };
        }
    }

    computeWorstCasePayout(crashPoint, activeBets) {
        if (!Array.isArray(activeBets) || activeBets.length === 0) return 0;
        return activeBets.reduce((sum, b) => {
            const amt = Number(b.amount || b.betAmount) || 0;
            const auto = b.autoCashout ? Number(b.autoCashout) : null;

            if (auto && auto <= crashPoint) {
                return sum + amt * auto;
            }

            return sum + amt * crashPoint;
        }, 0);
    }

    computeMaxSafeCrash(activeBets, maxPayout) {
        if (!Array.isArray(activeBets) || activeBets.length === 0 || maxPayout <= 0) {
            return 1.00;
        }

        let low = 1.00;
        let high = 100;

        for (let i = 0; i < 50; i++) {
            const mid = (low + high) / 2;
            const payout = this.computeWorstCasePayout(mid, activeBets);

            if (payout <= maxPayout) {
                low = mid;
            } else {
                high = mid;
            }
        }

        return Number(Math.max(1.00, low).toFixed(2));
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

        // 3. Admin Profit Margin Algorithm (100% Admin Profit Protection)
        const settings = await this.loadSettings();
        const targetProfitPercent = Number(settings?.targetProfitPercent ?? 25);
        const profitMargin = Math.min(0.95, Math.max(0.05, targetProfitPercent / 100));

        // Calculate total real user bets
        const realBetsTotal = Array.isArray(activeBets) 
            ? activeBets.reduce((sum, b) => sum + (Number(b.amount || b.betAmount) || 0), 0)
            : 0;

        let crashPoint = 1.20;

        if (realBetsTotal > 0) {
            const maxAllowedPayout = realBetsTotal * (1 - profitMargin);
            const maxSafeCrash = this.computeMaxSafeCrash(activeBets, maxAllowedPayout);
            const maxCapMultiplier = Math.max(1.00, parseFloat((maxAllowedPayout / realBetsTotal).toFixed(2)));

            const rand = Math.random();
            if (rand < 0.45) {
                // 45% early crash (1.00x - 1.15x) -> Immediate Admin Profit
                crashPoint = parseFloat((1.00 + Math.random() * 0.15).toFixed(2));
            } else if (rand < 0.85) {
                // 40% controlled crash (1.16x - 1.45x)
                crashPoint = parseFloat((1.16 + Math.random() * 0.29).toFixed(2));
            } else {
                // 15% stretch crash (1.46x - 2.10x)
                crashPoint = parseFloat((1.46 + Math.random() * 0.64).toFixed(2));
            }

            // Cap strictly at maxSafeCrash & maxCapMultiplier to guarantee Admin profit %
            const safeCap = Math.max(1.00, Math.min(maxSafeCrash, maxCapMultiplier > 1.00 ? maxCapMultiplier : 1.15));
            crashPoint = Math.min(crashPoint, safeCap);
        } else {
            // No real user bets placed in this round -> High exciting multipliers (5x, 15x, 30x, 50x, 100x+)
            const rand = Math.random();
            if (rand < 0.20) {
                // 20% low/med: 1.20x - 3.00x
                crashPoint = parseFloat((1.20 + Math.random() * 1.80).toFixed(2));
            } else if (rand < 0.55) {
                // 35% medium high: 3.50x - 14.50x
                crashPoint = parseFloat((3.50 + Math.random() * 11.00).toFixed(2));
            } else if (rand < 0.85) {
                // 30% big high: 15.00x - 45.00x
                crashPoint = parseFloat((15.00 + Math.random() * 30.00).toFixed(2));
            } else {
                // 15% sky high: 45.00x - 120.00x
                crashPoint = parseFloat((45.00 + Math.random() * 75.00).toFixed(2));
            }
        }

        const min = settings?.minCrash || 1.00;
        const max = settings?.maxCrash || 100;
        crashPoint = Math.max(min, Math.min(max, crashPoint));

        return Number(crashPoint.toFixed(2));
    }
}

export default new CrashEngine();
