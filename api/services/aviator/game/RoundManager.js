import mongoose from "mongoose";
import Round from "../models/Round.js";
import gameState from "./GameState.js";

class RoundManager {

    async createRound() {
        if (mongoose.connection.readyState !== 1) return null;

        try {
            const round = await Round.create({
                roundId: gameState.roundId,
                status: "RUNNING",
                startTime: new Date(),
                crashMultiplier: gameState.crashAt
            });
            return round;
        } catch (error) {
            console.warn("⚠️ Round DB create failed:", error.message);
            return null;
        }
    }

    async endRound() {
        if (mongoose.connection.readyState !== 1) return;

        try {
            await Round.findOneAndUpdate(
                {
                    roundId: gameState.roundId
                },
                {
                    status: "CRASHED",
                    endTime: new Date(),
                    crashMultiplier: gameState.crashAt,
                    totalPlayers: gameState.totalPlayers,
                    totalBetAmount: gameState.totalBetAmount,
                    totalPayout: gameState.totalCashout
                }
            );
        } catch (error) {
            console.warn("⚠️ Round DB update failed:", error.message);
        }
    }

}

export default new RoundManager();
