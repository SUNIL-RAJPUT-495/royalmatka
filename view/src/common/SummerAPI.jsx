//export const baseURL = "http://localhost:5010";
 export const baseURL = "https://royalmatkaapi.growva.tech";

const SummaryApi = {
    // Aviator Socket & Admin Endpoints
    aviatorSocket: {
        url: baseURL
    },
    getAviatorSettings: {
        url: baseURL + "/api/aviator/settings",
        method: "get"
    },
    updateAviatorSettings: {
        url: baseURL + "/api/aviator/settings",
        method: "post"
    },
    forceCrashNext: {
        url: baseURL + "/api/aviator/force-crash-next",
        method: "post"
    },
    forceCrashNow: {
        url: baseURL + "/api/aviator/force-crash-now",
        method: "post"
    },
    getAviatorStats: {
        url: baseURL + "/api/aviator/stats",
        method: "get"
    },

    // User Auth Endpoints
    creatUser: {
        url: baseURL + "/api/user/create-user",
        method: "post"
    },
    createUser: {
        url: baseURL + "/api/user/create-user",
        method: "post"
    },
    sendOtp: {
        url: baseURL + "/api/user/send-otp",
        method: "post"
    },
    verifyOtp: {
        url: baseURL + "/api/user/verify-otp",
        method: "post"
    },
    loginOtp: {
        url: baseURL + "/api/user/login-otp",
        method: "post"
    },
    loginUser: {
        url: baseURL + "/api/user/login-user",
        method: "post"
    },
    getUserProfile: {
        url: baseURL + "/api/user/get-user-profile",
        method: "get"
    },
    addBankAccount: {
        url: baseURL + "/api/user/add-bank-account",
        method: "post"
    },
    addUpiId: {
        url: baseURL + "/api/user/add-upi-id",
        method: "post"
    },
    updateUserWallet: {
        url: baseURL + "/api/user/update-wallet",
        method: "post"
    },

    // Payment Gateway & Deposits
    createOrder: {
        url: baseURL + "/api/payment/create-order",
        method: "post"
    },
    verifyPayment: {
        url: baseURL + "/api/payment/verify-payment",
        method: "post"
    },
    manualDeposit: {
        url: baseURL + "/api/payment/manual-deposit",
        method: "post"
    },
    getPaymentSettings: {
        url: baseURL + "/api/payment/get-settings",
        method: "get"
    },
    updatePaymentSettings: {
        url: baseURL + "/api/payment/update-settings",
        method: "post"
    },
    getUserTransactions: {
        url: baseURL + "/api/payment/user-transactions",
        method: "get"
    },

    // Admin Auth & User Management
    adminLogin: {
        url: baseURL + "/api/user/admin-login",
        method: "post"
    },
    getAllUsers: {
        url: baseURL + "/api/user/get-all-users",
        method: "get"
    },
    getAdminViewUser: {
        url: baseURL + "/api/user/get-user",
        method: "get"
    },
    getAdminDashboardStats: {
        url: baseURL + "/api/user/admin-dashboard-stats",
        method: "get"
    },
    getReferralStats: {
        url: baseURL + "/api/user/get-referral-stats",
        method: "get"
    },

    // Markets & Games
    addGame: {
        url: baseURL + "/api/market/add-market",
        method: "post"
    },
    getGame: {
        url: baseURL + "/api/market/get-all-markets",
        method: "get"
    },
    deleteMarket: {
        url: baseURL + "/api/market/delete-market",
        method: "delete"
    },
    declareResult: {
        url: baseURL + "/api/market/declare-result",
        method: "post"
    },
    getStarlineMarkets: {
        url: baseURL + "/api/market/get-starline-markets",
        method: "get"
    },
    declareStarlineResult: {
        url: baseURL + "/api/market/declare-starline-result",
        method: "post"
    },
    getGaliMarkets: {
        url: baseURL + "/api/market/get-gali-markets",
        method: "get"
    },
    declareGaliResult: {
        url: baseURL + "/api/market/declare-gali-result",
        method: "post"
    },
    getGameRates: {
        url: baseURL + "/api/market/get-game-rates",
        method: "get"
    },
    addGameRate: {
        url: baseURL + "/api/market/add-game-rate",
        method: "post"
    },
    updateGameRate: {
        url: baseURL + "/api/market/update-game-rate",
        method: "post"
    },
    deleteGameRate: {
        url: baseURL + "/api/market/delete-game-rate",
        method: "delete"
    },
    getAllResults: {
        url: baseURL + "/api/market/get-all-results",
        method: "get"
    },
    getMarketResults: {
        url: baseURL + "/api/market/get-market-results",
        method: "get"
    },

    // Bids Management
    placeBid: {
        url: baseURL + "/api/bid/place-bid",
        method: "post"
    },
    getUserBids: {
        url: baseURL + "/api/bid/get-user-bids",
        method: "get"
    },
    getAllBids: {
        url: baseURL + "/api/bid/get-all-bids",
        method: "get"
    },

    // Notifications
    getAllNotifications: {
        url: baseURL + "/api/notification/get-all-notifications",
        method: "get"
    },
    sendNotification: {
        url: baseURL + "/api/notification/send",
        method: "post"
    }
};

export default SummaryApi;
