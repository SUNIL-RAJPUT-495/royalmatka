import gameState from "./GameState.js";

class HistoryManager {

    constructor() {
        this.MAX_HISTORY = 60;
        this.initDefaultHistory();
    }

    initDefaultHistory() {
        if (gameState.history.length === 0) {
            for (let i = 0; i < 60; i++) {
                const rand = Math.random();
                let crash = 1.01;
                if (rand < 0.1) crash = 1.00;
                else if (rand < 0.5) crash = parseFloat((1.01 + Math.random() * 0.98).toFixed(2));
                else if (rand < 0.85) crash = parseFloat((2.00 + Math.random() * 4.99).toFixed(2));
                else crash = parseFloat((7.00 + Math.random() * 25.00).toFixed(2));

                gameState.history.push({
                    roundId: `init_${i}`,
                    crash: crash,
                    endedAt: new Date()
                });
            }
        }
    }

    add(round) {

        gameState.history.unshift(round);

        if (gameState.history.length > this.MAX_HISTORY) {
            gameState.history.pop();
        }

    }

    getAll() {
        return gameState.history;
    }

    latest() {
        return gameState.history[0] || null;
    }

    clear() {
        gameState.history = [];
    }

}

export default new HistoryManager();