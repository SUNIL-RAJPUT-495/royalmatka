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

// Zero-dependency Event-driven Socket Client (compatible with socket.io events)
class SafeSocketClient {
  constructor(url) {
    this.url = url;
    this.events = new Map();
    this.id = 'aviator-sock-' + Math.random().toString(36).substr(2, 9);
    this.connected = false;
    this.ws = null;
    this.init();
  }

  init() {
    try {
      const wsUrl = this.url.replace(/^http/, 'ws');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.connected = true;
        console.log("🟢 Connected to Aviator Socket Server:", this.id);
        this.emitLocal("connect");
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.event) {
            this.emitLocal(parsed.event, parsed.data);
          }
        } catch (e) {
          // ignore non-json messages
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        console.log("🔴 Disconnected from Aviator Socket Server");
        this.emitLocal("disconnect");
      };

      this.ws.onerror = () => {
        this.connected = false;
      };
    } catch (err) {
      // Fallback gracefully without throwing
      this.connected = false;
    }
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    return this;
  }

  off(event, callback) {
    if (this.events.has(event)) {
      if (callback) {
        this.events.get(event).delete(callback);
      } else {
        this.events.delete(event);
      }
    }
    return this;
  }

  emit(event, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ event, data }));
      } catch (err) {
        console.warn('Socket send error:', err);
      }
    }
    this.emitLocal(event, data);
    return this;
  }

  emitLocal(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  disconnect() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }
    this.connected = false;
  }
}

export const socket = new SafeSocketClient(getSocketUrl());

export default socket;
