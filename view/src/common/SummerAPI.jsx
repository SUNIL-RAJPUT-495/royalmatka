export const baseURL = "http://localhost:5010";
//export const baseURL = "https://royalmatkaapi.growva.tech";

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
    getChartHistory: {
        url: baseURL + "/api/matka/get-chart-history",
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
    changeUserPassword: {
        url: baseURL + "/api/user/change-password",
        method: "post"
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
    allTransactions: {
        url: baseURL + "/api/payment/all-transactions",
        method: "get"
    },
    updateStatusAdmin: {
        url: baseURL + "/api/payment/update-status",
        method: "post"
    },
    requestWithdrawal: {
        url: baseURL + "/api/payment/request-withdrawal",
        method: "post"
    },
    getAllWithdrawals: {
        url: baseURL + "/api/payment/all-withdrawals",
        method: "get"
    },
    updateWithdrawalStatus: {
        url: baseURL + "/api/payment/update-withdrawal-status",
        method: "post"
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
    adminAddFund: {
        url: baseURL + "/api/user/admin-add-fund",
        method: "post"
    },
    adminDeductFund: {
        url: baseURL + "/api/user/admin-deduct-fund",
        method: "post"
    },
    toggleUserStatus: {
        url: baseURL + "/api/user/toggle-status",
        method: "post"
    },
    adminChangePassword: {
        url: baseURL + "/api/user/admin-change-password",
        method: "post"
    },
    forceLogoutUser: {
        url: baseURL + "/api/user/force-logout",
        method: "post"
    },
    deleteUserByAdmin: {
        url: baseURL + "/api/user/delete-user",
        method: "delete"
    },
    getAdminList: {
        url: baseURL + "/api/user/get-admin-list",
        method: "get"
    },
    deleteAdmin: {
        url: baseURL + "/api/user/delete-admin",
        method: "delete"
    },
    adminSelfChangePassword: {
        url: baseURL + "/api/user/admin-self-change-password",
        method: "post"
    },

    // Notifications Management
    sendNotification: {
        url: baseURL + "/api/notification/send",
        method: "post"
    },
    getAllNotifications: {
        url: baseURL + "/api/notification/all",
        method: "get"
    },
    updateNotification: {
        url: baseURL + "/api/notification/update",
        method: "post"
    },
    deleteNotification: {
        url: baseURL + "/api/notification/delete",
        method: "delete"
    },
    getNotificationSettings: {
        url: baseURL + "/api/notification/settings",
        method: "get"
    },
    updateNotificationSettings: {
        url: baseURL + "/api/notification/settings",
        method: "post"
    },
    getWelcomePopup: {
        url: baseURL + "/api/user/get-welcome-popup",
        method: "get"
    },
    updateWelcomePopup: {
        url: baseURL + "/api/user/update-welcome-popup",
        method: "post"
    },
    getAppTheme: {
        url: baseURL + "/api/user/get-app-theme",
        method: "get"
    },
    updateAppTheme: {
        url: baseURL + "/api/user/update-app-theme",
        method: "post"
    },

    // Account Deletion Requests
    requestAccountDeletion: {
        url: baseURL + "/api/user/request-deletion",
        method: "post"
    },
    getAccountDeletionRequests: {
        url: baseURL + "/api/user/get-deletion-requests",
        method: "get"
    },
    approveAccountDeletionRequest: {
        url: baseURL + "/api/user/approve-deletion-request",
        method: "post"
    },
    rejectAccountDeletionRequest: {
        url: baseURL + "/api/user/reject-deletion-request",
        method: "post"
    },
    deleteAccountDeletionRequest: {
        url: baseURL + "/api/user/delete-deletion-request",
        method: "delete"
    },

    // Markets & Games
    addGame: {
        url: baseURL + "/api/market/add-market",
        method: "post"
    },
    updateMarket: {
        url: baseURL + "/api/market/update-market",
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
    deleteAllMarkets: {
        url: baseURL + "/api/market/delete-all-markets",
        method: "delete"
    },
    updateGameStatus: {
        url: baseURL + "/api/market/update-market-status",
        method: "post"
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
    addGaliMarket: {
        url: baseURL + "/api/market/add-gali-market",
        method: "post"
    },
    updateGaliMarket: {
        url: baseURL + "/api/market/update-gali-market",
        method: "put"
    },
    deleteGaliMarket: {
        url: baseURL + "/api/market/delete-gali-market",
        method: "delete"
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

    // Contact & Support Management
    getContact: {
        url: baseURL + "/api/contact/get-settings",
        method: "get"
    },
    updateContact: {
        url: baseURL + "/api/contact/update-settings",
        method: "post"
    },

    // How To Play Management
    getHowToPlay: {
        url: baseURL + "/api/settings/how-to-play",
        method: "get"
    },
    updateHowToPlay: {
        url: baseURL + "/api/settings/how-to-play",
        method: "post"
    },

    // Bonus & Transaction Settings
    getTransactionSettings: {
        url: baseURL + "/api/settings/get-settings",
        method: "get"
    },
    updateTransactionSettings: {
        url: baseURL + "/api/settings/update-settings",
        method: "post"
    },
    getBonusStats: {
        url: baseURL + "/api/settings/bonus-stats",
        method: "get"
    },
    getReferralStats: {
        url: baseURL + "/api/settings/get-referral-stats",
        method: "get"
    },

    // Bids Management
    placeBid: {
        url: baseURL + "/api/bid/place-bid",
        method: "post"
    },
    updateAviatorBid: {
        url: baseURL + "/api/bid/update-aviator-bid",
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
    deleteBid: {
        url: baseURL + "/api/bid/delete-bid",
        method: "delete"
    },

    // Notifications
    getAllNotifications: {
        url: baseURL + "/api/notification/get-all-notifications",
        method: "get"
    },
    sendNotification: {
        url: baseURL + "/api/notification/send",
        method: "post"
    },

    // Bonus & System Settings
    getTransactionSettings: {
        url: baseURL + "/api/settings/get-settings",
        method: "get"
    },
    updateTransactionSettings: {
        url: baseURL + "/api/settings/update-settings",
        method: "post"
    },
    getBonusStats: {
        url: baseURL + "/api/settings/bonus-stats",
        method: "get"
    },

    // Chat Management Endpoints
    getChatThreads: {
        url: baseURL + "/api/chat/admin/threads",
        method: "get"
    },
    getAdminChatMessages: {
        url: baseURL + "/api/chat/admin/messages",
        method: "get"
    },
    sendAdminChatMessage: {
        url: baseURL + "/api/chat/admin/send",
        method: "post"
    },
    clearUserChat: {
        url: baseURL + "/api/chat/admin/clear",
        method: "delete"
    },
    getUserChatMessages: {
        url: baseURL + "/api/chat/user/messages",
        method: "get"
    },
    sendUserChatMessage: {
        url: baseURL + "/api/chat/user/send",
        method: "post"
    }
};

export default SummaryApi;
