import axios from "axios";
import { baseURL } from "../common/SummerAPI";

const Axios = axios.create({
    baseURL: baseURL,
    withCredentials: false
});

Axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("user_token") || localStorage.getItem("token") || localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

Axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("User API 401 Notice:", error.config?.url);
        }
        return Promise.reject(error);
    }
);

export default Axios;