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
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("royal_user_admin");
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_data");
            localStorage.removeItem("is_admin_logged_in");
            window.dispatchEvent(new CustomEvent("on-unauthorized-admin"));
        }
        return Promise.reject(error);
    }
);

export default AxiosAdmin;
