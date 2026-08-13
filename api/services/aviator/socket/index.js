import { WebSocketServer } from "ws";
import SocketManager from "../game/SocketManager.js";
import BetManager from "../game/BetManager.js";
import CashoutManager from "../game/CashoutManager.js";
import gameState from "../game/GameState.js";
import HistoryManager from "../game/HistoryManager.js";

const initializeAviatorSockets = (server) => {
  const wss = new WebSocketServer({ server });
  SocketManager.initialize(wss);

  wss.on("connection", (ws) => {
    ws.id = "sock_" + Math.random().toString(36).substr(2, 9);
    console.log(`🔌 New client connected: ${ws.id}`);

    const historyArray = HistoryManager.getAll().map(h => typeof h === 'object' ? h.crash : h);

    // Send initial game settings / status
    ws.send(JSON.stringify({
      event: "game:status",
      data: {
        status: gameState.status || "WAITING",
        countdown: gameState.countdown || 5,
        multiplier: gameState.multiplier || 1.00,
        crashAt: gameState.crashAt || 1.00
      }
    }));

    // Send initial full game state
    ws.send(JSON.stringify({
      event: "game:init",
      data: {
        status: gameState.status || "WAITING",
        countdown: gameState.countdown || 5,
        multiplier: gameState.multiplier || 1.00,
        crashAt: gameState.crashAt || 1.00,
        history: historyArray
      }
    }));

    // Send history
    ws.send(JSON.stringify({
      event: "game:history",
      data: historyArray
    }));

    ws.on("message", (message) => {
      try {
        const parsed = JSON.parse(message);
        const { event, data } = parsed;

        if (event === "get_state") {
          const currentHistory = HistoryManager.getAll().map(h => typeof h === 'object' ? h.crash : h);
          ws.send(JSON.stringify({
            event: "game:init",
            data: {
              status: gameState.status || "WAITING",
              countdown: gameState.countdown || 5,
              multiplier: gameState.multiplier || 1.00,
              crashAt: gameState.crashAt || 1.00,
              history: currentHistory
            }
          }));
        }

        if (event === "place_bet") {
          const amount = Number(data?.amount || 10);
          const autoCashout = data?.autoCashout ? Number(data.autoCashout) : null;
          const userId = data?.userId || ws.id;

          const res = BetManager.placeBet({
            userId,
            amount,
            autoCashout
          });

          if (res.success) {
            ws.send(JSON.stringify({
              event: "bet:placed",
              data: { success: true, bet: res.data }
            }));
            // Broadcast all bets update
            SocketManager.emit("bet:list", Array.from(gameState.players.values()));
          } else {
            ws.send(JSON.stringify({
              event: "bet:error",
              data: { message: res.message }
            }));
          }
        }

        if (event === "cashout") {
          const userId = data?.userId || ws.id;
          const res = CashoutManager.cashout(userId);

          if (res.success) {
            ws.send(JSON.stringify({
              event: "bet:cashedout",
              data: { success: true, data: res.data }
            }));
            // Broadcast all bets update
            SocketManager.emit("bet:list", Array.from(gameState.players.values()));
          } else {
            ws.send(JSON.stringify({
              event: "bet:error",
              data: { message: res.message }
            }));
          }
        }

      } catch (err) {
        console.warn("Error processing socket message:", err.message);
      }
    });

    ws.on("close", () => {
      console.log(`🔌 Client disconnected: ${ws.id}`);
      BetManager.removePlayer(ws.id);
    });
  });
};

export default initializeAviatorSockets;
