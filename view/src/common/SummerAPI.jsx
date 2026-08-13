//export const baseURL = "http://localhost:5010";
export const baseURL = "https://royalmatkaapi.growva.tech";

const SummaryApi = {
    aviatorSocket: {
        url: baseURL
    },
    creatUser: {
        url: baseURL + "/api/user/create-user",
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
    declareResult: {
        url: baseURL + "/api/market/declare-result",
        method: "post"
    },
    getAllUsers: {
        url: baseURL + "/api/user/get-all-users",
        method: "get"
    },
    getAdminDashboardStats: {
        url: baseURL + "/api/user/admin-dashboard-stats",
        method: "get"
    },
    getAllResults: {
        url: baseURL + "/api/market/get-all-results",
        method: "get"
    },
    getMarketResults: {
        url: baseURL + "/api/market/get-market-results",
        method: "get"
    },
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
