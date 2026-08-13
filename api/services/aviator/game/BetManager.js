import gameState from "./GameState.js";

class BetManager {

    constructor() {
        this.MIN_BET = 10;
        this.MAX_BET = 100000;
    }

    /**
     * Place Bet
     */
    placeBet({
        userId,
        amount,
        autoCashout = null
    }) {

        // Game should be waiting
        if (gameState.status !== "WAITING") {
            return {
                success: false,
                message: "Betting Closed"
            };
        }

        // Amount Validation
        if (amount < this.MIN_BET) {
            return {
                success: false,
                message: `Minimum Bet is ${this.MIN_BET}`
            };
        }

        if (amount > this.MAX_BET) {
            return {
                success: false,
                message: `Maximum Bet is ${this.MAX_BET}`
            };
        }

        // Duplicate Bet
        if (gameState.players.has(userId)) {
            return {
                success: false,
                message: "Bet Already Placed"
            };
        }

        const player = {
            userId,
            betAmount: amount,
            autoCashout,
            cashoutMultiplier: null,
            payout: 0,
            status: "PLAYING",
            placedAt: new Date()
        };

        gameState.players.set(userId, player);

        gameState.totalPlayers = gameState.players.size;

        gameState.totalBetAmount += amount;

        return {
            success: true,
            message: "Bet Placed Successfully",
            data: player
        };
    }

    /**
     * Get Player
     */
    getPlayer(userId) {
        return gameState.players.get(userId);
    }

    /**
     * Remove Player
     */
    removePlayer(userId) {

        const player = gameState.players.get(userId);

        if (!player) return false;

        gameState.totalBetAmount -= player.betAmount;

        gameState.players.delete(userId);

        gameState.totalPlayers = gameState.players.size;

        return true;
    }

    /**
     * Get All Players
     */
    getPlayers() {
        return [...gameState.players.values()];
    }

    /**
     * Clear Round Bets
     */
    clear() {

        gameState.players.clear();

        gameState.totalPlayers = 0;

        gameState.totalBetAmount = 0;

    }

}

export default new BetManager();