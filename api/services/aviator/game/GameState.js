class GameState {
    constructor() {
        this.history = [];
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
    }

    getState() {
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
            history: this.history
        };
    }
}

export default new GameState();