import gameState from "./GameState.js";

class BetManager {
    constructor() {
        this.MIN_BET = 1;
        this.MAX_BET = 100000;
    }

    /**
     * Place Bet
     * Supports betIndex (0 = Left Panel, 1 = Right Panel)
     * If game is RUNNING, queues bet into nextRoundBets for the upcoming round
     */
    placeBet({
        userId,
        username,
        amount,
        autoCashout = null,
        betIndex = 0
    }) {
        const amt = Number(amount) || 0;
        if (amt < 1) {
            return {
                success: false,
                message: "Invalid Bet Amount"
            };
        }

        const baseUser = userId || `user_${Date.now()}_${Math.random()}`;
        const cardIdx = Number(betIndex) || 0;
        // Unique key per user and per bet panel card (0 or 1)
        const idKey = `${baseUser}_card_${cardIdx}`;

        const isRunning = (gameState.status || "").toUpperCase() === "RUNNING";
        const targetMap = isRunning ? gameState.nextRoundBets : gameState.players;

        // Deduplication for current target round
        if (targetMap.has(idKey)) {
            const existingPlayer = targetMap.get(idKey);
            return {
                success: true,
                message: isRunning ? "Bet Queued For Next Round" : "Bet Already Placed",
                data: existingPlayer
            };
        }

        const player = {
            id: idKey,
            userId: baseUser,
            betIndex: cardIdx,
            username: username || baseUser || "User",
            user: username || baseUser || "User",
            amount: amt,
            betAmount: amt,
            autoCashout,
            cashOutMultiplier: null,
            wonAmount: null,
            isCashedOut: false,
            status: isRunning ? "QUEUED" : "PLAYING",
            placedAt: new Date()
        };

        targetMap.set(idKey, player);

        if (!isRunning) {
            gameState.totalPlayers = gameState.players.size;
            gameState.totalBetAmount = Array.from(gameState.players.values()).reduce((sum, p) => sum + p.amount, 0);
            console.log(`🎰 Active Bet Placed: User=${player.username} (Card ${cardIdx}), Amount=₹${amt}, TotalRoundBets=₹${gameState.totalBetAmount}`);
        } else {
            console.log(`⏳ Bet Queued For Next Round: User=${player.username} (Card ${cardIdx}), Amount=₹${amt}`);
        }

        return {
            success: true,
            message: isRunning ? "Bet Queued For Next Round" : "Bet Placed Successfully",
            data: player
        };
    }

    /**
     * Activate Next Round Queued Bets when WAITING phase starts
     */
    activateNextRoundBets() {
        if (gameState.nextRoundBets && gameState.nextRoundBets.size > 0) {
            for (const [key, player] of gameState.nextRoundBets.entries()) {
                player.status = "PLAYING";
                gameState.players.set(key, player);
            }
            gameState.nextRoundBets.clear();
        }
        gameState.totalPlayers = gameState.players.size;
        gameState.totalBetAmount = Array.from(gameState.players.values()).reduce((sum, p) => sum + p.amount, 0);
    }

    /**
     * Get Player
     */
    getPlayer(userId, betIndex = 0) {
        const idKey = `${userId}_card_${betIndex}`;
        return gameState.players.get(idKey) || gameState.players.get(userId);
    }

    /**
     * Remove Player
     */
    removePlayer(userId) {
        let removed = false;
        for (const [key, player] of gameState.players.entries()) {
            if (player.userId === userId || key.startsWith(`${userId}_`)) {
                gameState.totalBetAmount -= player.betAmount;
                gameState.players.delete(key);
                removed = true;
            }
        }
        gameState.totalPlayers = gameState.players.size;
        return removed;
    }

    /**
     * Get All Players / Bets
     */
    getPlayers() {
        return [...gameState.players.values()];
    }

    getBets() {
        return this.getPlayers();
    }

    getAllBets() {
        return this.getPlayers();
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