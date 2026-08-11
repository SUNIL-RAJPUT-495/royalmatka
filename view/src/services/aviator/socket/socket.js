import { io } from "socket.io-client";
import { baseURL } from "../../../common/SummerAPI";

const getSocketUrl = () => {
  if (import.meta.env.VITE_AVIATOR_SOCKET_URL) return import.meta.env.VITE_AVIATOR_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (baseURL && (baseURL.startsWith("http://localhost:") || baseURL.startsWith("http://127.0.0.1:"))) {
    return "http://localhost:8082";
  }
  if (baseURL && (baseURL.startsWith("http://") || baseURL.startsWith("https://"))) {
    return baseURL;
  }
  if (typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:8082`;
  }
  return "http://localhost:8082";
};

export const socket = io(getSocketUrl(), {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("🟢 Connected to Aviator Socket Server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 Disconnected from Aviator Socket Server");
});

export default socket;
