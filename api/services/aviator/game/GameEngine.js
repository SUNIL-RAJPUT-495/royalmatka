import { randomUUID } from "crypto";
import gameState from "./GameState.js";
import RoundManager from "./RoundManager.js";
import CrashEngine from "./CrashEngine.js";
import MultiplierEngine from "./MultiplierEngine.js";
import BetManager from "./BetManager.js";
import CashoutManager from "./CashoutManager.js";
import HistoryManager from "./HistoryManager.js";
import SocketManager from "./SocketManager.js";


class GameEngine {
    constructor() {
        this.gameInterval = null;
        this.countdownInterval = null;
        this.running = false;
    }

    // =============================
    // Start Engine
    // =============================
    start() {
        if (this.running) return;

        this.running = true;

        console.log("🚀 Aviator Game Engine Started");

        this.startWaiting();
    }

    // =============================
    // Waiting Phase
    // =============================
    async startWaiting() {

        gameState.reset();

        gameState.crashAt = await CrashEngine.generate();

        gameState.status = "WAITING";
        gameState.countdown = 5;

        console.log("\n==============================");
        console.log(`⏳ Waiting For Next Round... Target Crash: ${gameState.crashAt}x`);
        console.log("==============================\n");

        SocketManager.emit("game:status", {
            status: "WAITING",
            countdown: gameState.countdown,
            crashAt: gameState.crashAt
        });

        // 2. Start Countdown Timer
        this.countdownInterval = setInterval(async () => {

            gameState.countdown--;

            console.log(`⏳ ${gameState.countdown}`);

            SocketManager.emit("game:countdown", {
                countdown: gameState.countdown,
                crashAt: gameState.crashAt
            });

            if (gameState.countdown <= 0) {

                clearInterval(this.countdownInterval);

                await this.startRound();

            }

        }, 1000);

    }

    // =============================
    // Start Round
    // =============================
    async startRound() {

        gameState.roundId = randomUUID();

        gameState.status = "RUNNING";

        gameState.startedAt = new Date();

        gameState.endedAt = null;

        gameState.multiplier = MultiplierEngine.reset();

        if (!gameState.crashAt) {
            gameState.crashAt = await CrashEngine.generate();
        }

        // Create Round In Database
        await RoundManager.createRound();

        console.log("\n=======================================");
        console.log(`🎮 Round Started`);
        console.log(`🆔 Round ID : ${gameState.roundId}`);
        console.log(`💥 Crash At : ${gameState.crashAt}x`);
        console.log("=======================================\n");

        SocketManager.emit("game:start", {
            roundId: gameState.roundId,
            status: "RUNNING",
            crashAt: gameState.crashAt
        });

        this.startMultiplier();

    }


    // =============================
    // Multiplier Loop
    // =============================
    startMultiplier() {

        this.gameInterval = setInterval(async () => {

            gameState.multiplier = MultiplierEngine.next(
                gameState.multiplier
            );
            CashoutManager.autoCashout();

            SocketManager.emit("game:tick", {
                multiplier: gameState.multiplier
            });

            if (gameState.multiplier >= gameState.crashAt) {

                clearInterval(this.gameInterval);

                await this.endRound();

            }

        }, MultiplierEngine.tickRate);

    }

    // =============================
    // End Round
    // =============================
    async endRound() {

        gameState.status = "CRASHED";
        CashoutManager.crashRound();

        gameState.endedAt = new Date();

        await RoundManager.endRound();

        HistoryManager.add({
            roundId: gameState.roundId,
            crash: gameState.crashAt,
            endedAt: gameState.endedAt
        });

        SocketManager.emit("game:crash", {
            crashAt: gameState.crashAt,
            history: HistoryManager.getAll()
        });

        BetManager.clear();

        console.log("\n=======================================");
        console.log(`💥 Round Crashed At ${gameState.crashAt}x`);
        console.log("=======================================\n");

        // Wait 3 sec before next round
        setTimeout(() => {
            this.startWaiting();
        }, 3000);

    }


    // =============================
    // Stop Engine
    // =============================
    stop() {

        clearInterval(this.countdownInterval);
        clearInterval(this.gameInterval);

        this.running = false;

        console.log("🛑 Game Engine Stopped");

    }

    // =============================
    // Admin Controls
    // =============================
    async forceCrashNow() {
        if (gameState.status === "RUNNING") {
            console.log("⚠️ Admin triggered INSTANT CRASH!");
            clearInterval(this.gameInterval);
            await this.endRound();
            return { success: true, message: "Round crashed immediately" };
        }
        return { success: false, message: "Round is not currently flying" };
    }

    setNextCrashMultiplier(multiplier) {
        CrashEngine.setNextCrash(multiplier);
        console.log(`🎯 Admin set next crash multiplier to ${multiplier}x`);
        return { success: true, message: `Next round crash set to ${multiplier}x` };
    }

    getAdminStats() {
        const state = gameState.getState();
        const players = BetManager.getPlayers();
        return {
            ...state,
            players,
            history: HistoryManager.getAll()
        };
    }

    // =============================
    // Current Game State
    // =============================
    getState() {
        return gameState.getState();
    }

}

export default new GameEngine();