import gameState from "./GameState.js";

class BetManager {

    constructor() {
        this.MIN_BET = 10;
        this.MAX_BET = 100000;
    }

    /**
     * Place Bet
     */
    /**
     * Place Bet
     */
    placeBet({
        userId,
        username,
        amount,
        autoCashout = null
    }) {
        // Amount Validation
        const amt = Number(amount) || 0;
        if (amt < 1) {
            return {
                success: false,
                message: `Invalid Bet Amount`
            };
        }

        const idKey = userId || `user_${Date.now()}_${Math.random()}`;

        const player = {
            id: idKey,
            userId: idKey,
            username: username || userId || "User",
            user: username || userId || "User",
            amount: amt,
            betAmount: amt,
            autoCashout,
            cashOutMultiplier: null,
            wonAmount: null,
            isCashedOut: false,
            status: "PLAYING",
            placedAt: new Date()
        };

        gameState.players.set(idKey, player);
        gameState.totalPlayers = gameState.players.size;
        gameState.totalBetAmount += amt;

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