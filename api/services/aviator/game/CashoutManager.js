import gameState from "./GameState.js";

class CashoutManager {

    /**
     * Manual Cashout
     */
    cashout(userId) {

        // Round Running Check
        if (gameState.status !== "RUNNING") {
            return {
                success: false,
                message: "Round not running"
            };
        }

        const player = gameState.players.get(userId);

        if (!player) {
            return {
                success: false,
                message: "Player not found"
            };
        }

        // Already Cashed Out
        if (player.status === "CASHED_OUT") {
            return {
                success: false,
                message: "Already cashed out"
            };
        }

        // Player Lost
        if (player.status === "LOST") {
            return {
                success: false,
                message: "Player already lost"
            };
        }

        const multiplier = gameState.multiplier;

        const payout = Number(
            (player.betAmount * multiplier).toFixed(2)
        );

        player.cashoutMultiplier = multiplier;
        player.payout = payout;
        player.status = "CASHED_OUT";

        gameState.totalCashout += payout;

        return {
            success: true,
            message: "Cashout Successful",
            data: {
                multiplier,
                payout
            }
        };
    }

    /**
     * Auto Cashout
     */
    autoCashout() {

        for (const [userId, player] of gameState.players) {

            if (
                player.status === "PLAYING" &&
                player.autoCashout &&
                gameState.multiplier >= player.autoCashout
            ) {

                this.cashout(userId);

            }

        }

    }

    /**
     * Crash Round
     */
    crashRound() {

        for (const [, player] of gameState.players) {

            if (player.status === "PLAYING") {

                player.status = "LOST";

            }

        }

    }

    /**
     * Get Cashed Out Players
     */
    getWinners() {

        return [...gameState.players.values()].filter(
            player => player.status === "CASHED_OUT"
        );

    }

    /**
     * Get Lost Players
     */
    getLosers() {

        return [...gameState.players.values()].filter(
            player => player.status === "LOST"
        );

    }

}

export default new CashoutManager();