class GameState {
    constructor() {
        this.history = [];
        this.nextRoundBets = new Map();
        this.reset();
    }

    reset() {
        this.roundId = null;

        this.status = "WAITING";
        // WAITING | RUNNING | CRASHED

        this.multiplier = 1.00;

        this.countdown = 5;

        this.startedAt = null;

        this.endedAt = null;

        this.crashAt = null;

        this.players = new Map();

        this.totalPlayers = 0;

        this.totalBetAmount = 0;

        this.totalCashout = 0;

        this.targetProfitPercent = 25;

        this.maxPayout = Infinity;
    }

    getState() {
        const houseProfit = this.totalBetAmount - this.totalCashout;
        const profitPercent = this.totalBetAmount > 0
            ? Number(((houseProfit / this.totalBetAmount) * 100).toFixed(2))
            : 0;

        return {
            roundId: this.roundId,
            status: this.status,
            multiplier: this.multiplier,
            countdown: this.countdown,
            startedAt: this.startedAt,
            endedAt: this.endedAt,
            crashAt: this.crashAt,
            totalPlayers: this.totalPlayers,
            totalBetAmount: this.totalBetAmount,
            totalCashout: this.totalCashout,
            targetProfitPercent: this.targetProfitPercent,
            maxPayout: this.maxPayout,
            houseProfit,
            profitPercent,
            history: this.history
        };
    }
}

export default new GameState();