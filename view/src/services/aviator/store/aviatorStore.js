import { useSyncExternalStore } from "react";
import socket from "../socket/socket";
import Axios from "../../../utils/axios";
import SummaryApi from "../../../common/SummerAPI";

const syncWalletWithBackend = async (amount, action) => {
  try {
    const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
    let savedUser = null;
    try { if (savedUserStr) savedUser = JSON.parse(savedUserStr); } catch (e) {}

    const res = await Axios({
      url: SummaryApi.updateUserWallet.url,
      method: SummaryApi.updateUserWallet.method,
      data: {
        amount: Number(amount),
        action: action,
        mobile: savedUser?.mobile || '',
        userId: savedUser?._id || savedUser?.id || ''
      }
    });

    if (res.data?.user && typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(res.data.user));
    }
  } catch (err) {
    console.warn("Wallet sync failed:", err);
  }
};

// Built-in store creator
export const create = (createState) => {
  let state;
  const listeners = new Set();

  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      state = (replace ?? (typeof nextState !== "object" || nextState === null))
        ? nextState
        : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener());
    }
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const api = { setState, getState, subscribe };
  state = createState(setState, getState, api);

  const useBoundStore = (selector = (s) => s) => {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state)
    );
  };

  Object.assign(useBoundStore, api);
  return useBoundStore;
};

// Mock names for simulating other players
const MOCK_NAMES = [
  "Aarav", "Amit", "Rahul", "Priya", "Vikram", "Sonia", "Rohan", "Riya", "Kabir", "Ananya",
  "Deepak", "Neha", "Arjun", "Karan", "Simran", "Rajesh", "Pooja", "Suresh", "Kiran", "Aditya",
  "Anoop", "Bobby", "Chetan", "Dinesh", "Gaurav", "Harish", "Ishaan", "Jatin", "Kunwar", "Manish"
];

// Helper to generate masked usernames like s***t
const getMaskedName = () => {
  const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
  const randNum = Math.floor(Math.random() * 90) + 10;
  const first = name.slice(0, 2).toLowerCase();
  const last = randNum.toString();
  return `${first}***${last[1]}`;
};

// Parse URL params for dynamic scaling
const getUrlParams = () => {
  if (typeof window === "undefined") return { currency: "INR", user: "demo", returnUrl: "" };
  const params = new URLSearchParams(window.location.search);
  return {
    currency: (params.get("currency") || "INR").toUpperCase(),
    user: params.get("user") || "demo",
    returnUrl: params.get("return_url") || ""
  };
};

const urlParams = getUrlParams();
const isUSD = urlParams.currency === "USD";

// Helper to get real user wallet balance from localStorage
const getInitialUserBalance = () => {
  try {
    const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
    if (savedUserStr) {
      const u = JSON.parse(savedUserStr);
      const withdrowalable = Number(u?.wallet?.withdrowalable ?? u?.withdrowalable) || 0;
      const bonus = Number(u?.wallet?.bonusBalance ?? u?.bonusBalance) || 0;
      return withdrowalable + bonus;
    }
  } catch (e) {}
  return 0;
};

// Set initial values based on user wallet balance
const INITIAL_BALANCE = getInitialUserBalance();
const PRESET_AMOUNTS = isUSD ? [1, 2, 5, 10] : [100, 200, 500, 1000];
const SIMULATED_BET_AMOUNTS = isUSD ? [1, 2, 5, 10, 20, 50, 100] : [100, 200, 500, 1000, 2000, 5000, 10000];

// Helper to generate a random crash multiplier
const generateCrashMultiplier = () => {
  const rand = Math.random();
  if (rand < 0.08) {
    return 1.00;
  } else if (rand < 0.50) {
    return parseFloat((1.01 + Math.random() * 0.98).toFixed(2));
  } else if (rand < 0.85) {
    return parseFloat((2.00 + Math.random() * 5.99).toFixed(2));
  } else if (rand < 0.96) {
    return parseFloat((8.00 + Math.random() * 21.99).toFixed(2));
  } else {
    return parseFloat((30.00 + Math.random() * 220.00).toFixed(2));
  }
};

// Generate simulated bets at the start of a round
const generateSimulatedBets = () => {
  const count = 20 + Math.floor(Math.random() * 25); // 20 to 45 players
  const bets = [];
  
  for (let i = 0; i < count; i++) {
    const maskedName = getMaskedName();
    const amount = SIMULATED_BET_AMOUNTS[Math.floor(Math.random() * SIMULATED_BET_AMOUNTS.length)];
    
    const targetRand = Math.random();
    let targetMultiplier;
    if (targetRand < 0.4) {
      targetMultiplier = parseFloat((1.10 + Math.random() * 0.70).toFixed(2));
    } else if (targetRand < 0.75) {
      targetMultiplier = parseFloat((1.80 + Math.random() * 2.20).toFixed(2));
    } else if (targetRand < 0.92) {
      targetMultiplier = parseFloat((4.00 + Math.random() * 12.00).toFixed(2));
    } else {
      targetMultiplier = parseFloat((16.00 + Math.random() * 80.00).toFixed(2));
    }

    bets.push({
      id: `sim_${i}_${Date.now()}`,
      username: maskedName,
      amount: amount,
      targetMultiplier: targetMultiplier,
      cashOutMultiplier: null,
      wonAmount: null,
      isCashedOut: false,
      isLost: false
    });
  }
  return bets.sort((a, b) => b.amount - a.amount);
};

// Initial state for one bet card
const initialBetState = {
  amount: isUSD ? 2.00 : 200,
  isPlaced: false,
  isQueued: false,
  isCashedOut: false,
  cashOutMultiplier: null,
  wonAmount: null,
  autoBet: false,
  autoCashOut: false,
  autoCashOutMultiplier: 2.00
};

export const useAviatorStore = create((set, get) => {
  let gameLoopInterval = null;
  let flightRequestFrame = null;
  let countdownInterval = null;
  let isConnectedToSocket = false;

  // Initialize a mock history of 45 items
  const initialHistory = [];
  for (let i = 0; i < 45; i++) {
    initialHistory.push(generateCrashMultiplier());
  }

  return {
    // Config parameters
    currency: urlParams.currency,
    user: urlParams.user,
    returnUrl: urlParams.returnUrl,
    isUSD: isUSD,
    isConnected: false,

    // State Variables
    status: "waiting", // "waiting" | "flying" | "crashed"
    multiplier: 1.00,
    crashMultiplier: 1.00,
    countdown: 5.0,
    countdownDuration: 5.0,
    balance: INITIAL_BALANCE,
    
    // User Bet Cards (0 is Left, 1 is Right)
    betCards: [
      { ...initialBetState, amount: isUSD ? 1.00 : 100 },
      { ...initialBetState, amount: isUSD ? 2.00 : 200 }
    ],

    // Statistics and history
    history: initialHistory,
    liveBets: [],
    myBetsHistory: [],

    // Setters / Actions
    setBalance: (amount) => set({ balance: parseFloat(amount.toFixed(2)) }),
    resetBalance: () => set({ balance: INITIAL_BALANCE }),

    // Update individual bet fields
    updateBetCard: (index, fields) => set((state) => {
      const updatedCards = [...state.betCards];
      updatedCards[index] = { ...updatedCards[index], ...fields };
      return { betCards: updatedCards };
    }),

    // Placing a bet - Instant money deduction on click
    placeBet: (index) => {
      const state = get();
      const card = state.betCards[index];
      
      if (card.isPlaced || card.isQueued) return;
      
      if (state.balance < card.amount) {
        return "Insufficient Balance";
      }

      // 1. Instant deduction from backend database
      syncWalletWithBackend(card.amount, 'deduct');

      // Emit to backend socket if connected
      if (socket.connected) {
        socket.emit("place_bet", {
          amount: card.amount,
          autoCashout: card.autoCashOut ? card.autoCashOutMultiplier : null
        });
      }

      // 2. Instant deduction from local UI balance
      const isWaiting = state.status === "waiting";
      set((state) => {
        const updatedCards = [...state.betCards];
        updatedCards[index] = {
          ...updatedCards[index],
          isPlaced: isWaiting,
          isQueued: !isWaiting
        };
        return {
          balance: parseFloat(Math.max(0, state.balance - card.amount).toFixed(2)),
          betCards: updatedCards
        };
      });

      return null;
    },

    // Cancel a bet - Instant refund on cancel
    cancelBet: (index) => {
      const state = get();
      const card = state.betCards[index];

      if (card.isQueued || (card.isPlaced && state.status === "waiting")) {
        // Instant refund to backend database
        syncWalletWithBackend(card.amount, 'credit');
        
        set((state) => {
          const updatedCards = [...state.betCards];
          updatedCards[index] = {
            ...updatedCards[index],
            isPlaced: false,
            isQueued: false
          };
          return {
            balance: parseFloat((state.balance + card.amount).toFixed(2)),
            betCards: updatedCards
          };
        });
      }
    },

    // Cash out during flight
    cashOut: (index, forceMultiplier = null) => {
      const state = get();
      const card = state.betCards[index];
      
      if (state.status !== "flying" || !card.isPlaced || card.isCashedOut) return;

      const cashOutMult = forceMultiplier || state.multiplier;
      const winAmt = parseFloat((card.amount * cashOutMult).toFixed(2));

      // Sync win crediting with MongoDB backend
      syncWalletWithBackend(winAmt, 'credit');

      if (socket.connected) {
        socket.emit("cashout");
      }

      set((state) => {
        const updatedCards = [...state.betCards];
        updatedCards[index] = {
          ...updatedCards[index],
          isCashedOut: true,
          cashOutMultiplier: cashOutMult,
          wonAmount: winAmt
        };

        const newRecord = {
          id: `bet_${Date.now()}_${index}`,
          amount: card.amount,
          cashOutMultiplier: cashOutMult,
          wonAmount: winAmt,
          status: "win",
          timestamp: new Date().toLocaleTimeString()
        };

        return {
          balance: parseFloat((state.balance + winAmt).toFixed(2)),
          betCards: updatedCards,
          myBetsHistory: [newRecord, ...state.myBetsHistory].slice(0, 60)
        };
      });
    },

    // Start the perpetual loop / Socket listener setup
    initGameLoop: () => {
      // Set up socket listeners once
      if (!isConnectedToSocket) {
        isConnectedToSocket = true;

        socket.on("connect", () => {
          set({ isConnected: true });
          socket.emit("get_state");
          // Stop local standalone timers when socket is active
          if (countdownInterval) clearInterval(countdownInterval);
          if (gameLoopInterval) clearInterval(gameLoopInterval);
          if (flightRequestFrame) cancelAnimationFrame(flightRequestFrame);
        });

        socket.on("disconnect", () => {
          set({ isConnected: false });
          // Fallback to local loop if disconnected
          get().startWaitingRound();
        });

        const handleGameState = (data) => {
          if (!data) return;
          const statusMap = { WAITING: "waiting", RUNNING: "flying", CRASHED: "crashed" };
          const formattedHistory = Array.isArray(data.history)
            ? data.history.map(h => typeof h === 'object' ? (h.crash || h.multiplier) : h)
            : get().history;

          set({
            status: statusMap[data.status] || data.status || "waiting",
            multiplier: data.multiplier || 1.00,
            crashMultiplier: data.crashAt || 1.00,
            countdown: data.countdown !== undefined ? data.countdown : 5,
            history: formattedHistory
          });
        };

        socket.on("game:init", handleGameState);
        socket.on("game:state", handleGameState);

        socket.on("game:history", (data) => {
          if (Array.isArray(data)) {
            const formatted = data.map(h => typeof h === 'object' ? (h.crash || h.multiplier) : h);
            set({ history: formatted });
          }
        });

        socket.on("game:status", (data) => {
          const statusMap = { WAITING: "waiting", RUNNING: "flying", CRASHED: "crashed" };
          const newStatus = statusMap[data.status] || data.status || "waiting";

          if (newStatus === "waiting") {
            set((state) => {
              const updatedCards = state.betCards.map(card => {
                const newlyPlaced = card.autoBet || card.isQueued;
                return {
                  ...card,
                  isPlaced: newlyPlaced,
                  isQueued: false,
                  isCashedOut: false,
                  cashOutMultiplier: null,
                  wonAmount: null
                };
              });

              return {
                status: "waiting",
                multiplier: 1.00,
                crashMultiplier: data.crashAt || state.crashMultiplier,
                countdown: data.countdown !== undefined ? data.countdown : 5,
                liveBets: generateSimulatedBets(),
                betCards: updatedCards
              };
            });
          } else {
            set({
              status: newStatus,
              crashMultiplier: data.crashAt || get().crashMultiplier,
              countdown: data.countdown !== undefined ? data.countdown : get().countdown
            });
          }
        });

        socket.on("game:countdown", (data) => {
          set({
            countdown: data.countdown,
            crashMultiplier: data.crashAt || get().crashMultiplier
          });
        });

        socket.on("game:start", (data) => {
          set({
            status: "flying",
            multiplier: 1.00,
            crashMultiplier: data?.crashAt || get().crashMultiplier
          });
        });

        socket.on("game:tick", (data) => {
          const currentMult = data.multiplier;
          const state = get();

          // Check Auto-Cashouts locally
          state.betCards.forEach((card, index) => {
            if (
              card.isPlaced &&
              !card.isCashedOut &&
              card.autoCashOut &&
              currentMult >= card.autoCashOutMultiplier
            ) {
              get().cashOut(index, card.autoCashOutMultiplier);
            }
          });

          // Update live bets
          const updatedLiveBets = state.liveBets.map(player => {
            if (!player.isCashedOut && currentMult >= player.targetMultiplier) {
              return {
                ...player,
                isCashedOut: true,
                cashOutMultiplier: player.targetMultiplier,
                wonAmount: parseFloat((player.amount * player.targetMultiplier).toFixed(2))
              };
            }
            return player;
          });

          set({
            status: "flying",
            multiplier: currentMult,
            liveBets: updatedLiveBets
          });
        });

        socket.on("game:crash", (data) => {
          const crashMult = data.crashAt;
          const state = get();

          const updatedCards = state.betCards.map((card, index) => {
            if (card.isPlaced && !card.isCashedOut) {
              const newRecord = {
                id: `bet_${Date.now()}_${index}`,
                amount: card.amount,
                cashOutMultiplier: null,
                wonAmount: null,
                status: "lost",
                timestamp: new Date().toLocaleTimeString()
              };
              set((prev) => ({
                myBetsHistory: [newRecord, ...prev.myBetsHistory].slice(0, 60)
              }));
            }
            return {
              ...card,
              isPlaced: false,
            };
          });

          const formattedHistory = data.history 
            ? data.history.map(h => typeof h === 'object' ? (h.crash || h.multiplier) : h) 
            : [crashMult, ...state.history].slice(0, 60);

          set({
            status: "crashed",
            multiplier: crashMult,
            crashMultiplier: crashMult,
            history: formattedHistory,
            betCards: updatedCards
          });
        });
      }

      if (socket.connected) {
        set({ isConnected: true });
        socket.emit("get_state");
      } else if (!gameLoopInterval && !countdownInterval && !flightRequestFrame) {
        get().startWaitingRound();
      }
    },

    stopGameLoop: () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (gameLoopInterval) clearInterval(gameLoopInterval);
      if (flightRequestFrame) cancelAnimationFrame(flightRequestFrame);
      countdownInterval = null;
      gameLoopInterval = null;
      flightRequestFrame = null;
    },

    // 1. WAITING ROUND STAGE (Fallback mode)
    startWaitingRound: () => {
      if (socket.connected) return;
      get().stopGameLoop();

      set((state) => {
        const updatedCards = state.betCards.map(card => {
          const newlyPlaced = card.autoBet || card.isQueued;
          return {
            ...card,
            isPlaced: newlyPlaced,
            isQueued: false,
            isCashedOut: false,
            cashOutMultiplier: null,
            wonAmount: null
          };
        });

        return {
          status: "waiting",
          multiplier: 1.00,
          countdown: 5.0,
          liveBets: generateSimulatedBets(),
          betCards: updatedCards
        };
      });

      const tickRate = 50;
      let step = 0;

      countdownInterval = setInterval(() => {
        step++;
        const remaining = Math.max(0, 5.0 - (step * tickRate) / 1000);
        set({ countdown: parseFloat(remaining.toFixed(2)) });

        if (remaining <= 0) {
          clearInterval(countdownInterval);
          get().startFlightRound();
        }
      }, tickRate);
    },

    // 2. FLIGHT ROUND STAGE (Fallback mode)
    startFlightRound: () => {
      if (socket.connected) return;
      get().stopGameLoop();
      
      const crashPoint = generateCrashMultiplier();
      const startTime = Date.now();

      set({
        status: "flying",
        multiplier: 1.00,
        crashMultiplier: crashPoint,
      });

      const updateFlight = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const currentMult = parseFloat(Math.min(100000, 1.00 + (elapsed * 0.08) + Math.pow(1.00004, Math.pow(elapsed * 1000, 1.05)) - 1).toFixed(2));

        const state = get();

        if (currentMult >= state.crashMultiplier) {
          get().crashRound();
          return;
        }

        // Check Auto-Cashouts
        state.betCards.forEach((card, index) => {
          if (
            card.isPlaced &&
            !card.isCashedOut &&
            card.autoCashOut &&
            currentMult >= card.autoCashOutMultiplier
          ) {
            get().cashOut(index, card.autoCashOutMultiplier);
          }
        });

        // Update simulated players' statuses
        const updatedLiveBets = state.liveBets.map(player => {
          if (!player.isCashedOut && currentMult >= player.targetMultiplier && player.targetMultiplier < state.crashMultiplier) {
            return {
              ...player,
              isCashedOut: true,
              cashOutMultiplier: player.targetMultiplier,
              wonAmount: parseFloat((player.amount * player.targetMultiplier).toFixed(2))
            };
          }
          return player;
        });

        set({
          multiplier: currentMult,
          liveBets: updatedLiveBets
        });

        flightRequestFrame = requestAnimationFrame(updateFlight);
      };

      flightRequestFrame = requestAnimationFrame(updateFlight);
    },

    // 3. CRASH STAGE (Fallback mode)
    crashRound: () => {
      if (socket.connected) return;
      get().stopGameLoop();
      
      const state = get();
      const crashMult = state.crashMultiplier;

      const updatedCards = state.betCards.map((card, index) => {
        if (card.isPlaced && !card.isCashedOut) {
          const newRecord = {
            id: `bet_${Date.now()}_${index}`,
            amount: card.amount,
            cashOutMultiplier: null,
            wonAmount: null,
            status: "lost",
            timestamp: new Date().toLocaleTimeString()
          };
          
          set((prev) => ({
            myBetsHistory: [newRecord, ...prev.myBetsHistory].slice(0, 60)
          }));
        }
        return {
          ...card,
          isPlaced: false,
        };
      });

      const updatedLiveBets = state.liveBets.map(player => {
        if (!player.isCashedOut) {
          return {
            ...player,
            isLost: true
          };
        }
        return player;
      });

      set(prev => ({
        status: "crashed",
        multiplier: crashMult,
        history: [crashMult, ...prev.history].slice(0, 60),
        betCards: updatedCards,
        liveBets: updatedLiveBets
      }));

      setTimeout(() => {
        if (get().status === "crashed") {
          get().startWaitingRound();
        }
      }, 3000);
    }
  };
});

