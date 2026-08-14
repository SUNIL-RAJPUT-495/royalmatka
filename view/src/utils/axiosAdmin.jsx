import axios from "axios";
import { baseURL } from "../common/SummerAPI";

/** Sirf admin dashboard — hamesha admin_token (user access_token se mix nahi hoga) */
const AxiosAdmin = axios.create({
    baseURL: baseURL,
    withCredentials: false
});

AxiosAdmin.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("royal_user_admin") || localStorage.getItem("admin_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

AxiosAdmin.interceptors.response.use(
    (response) => response,
    (error) => {
        // Do not aggressively delete admin session keys on background 401 responses
        if (error.response && error.response.status === 401) {
            console.warn("Admin API 401 Notice:", error.config?.url);
        }
        return Promise.reject(error);
    }
);

export default AxiosAdmin;
