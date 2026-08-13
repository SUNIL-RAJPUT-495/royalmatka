import SummaryApi, { baseURL } from "../../../common/SummerAPI";

const getSocketUrl = () => {
  if (import.meta.env.VITE_AVIATOR_SOCKET_URL) return import.meta.env.VITE_AVIATOR_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  const socketBase = SummaryApi.aviatorSocket?.url || baseURL || "http://localhost:5010";
  if (socketBase && (socketBase.startsWith("http://") || socketBase.startsWith("https://"))) {
    return socketBase;
  }
  if (typeof window !== "undefined" && window.location?.hostname) {
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    return `${protocol}//${window.location.hostname}:5010`;
  }
  return "http://localhost:5010";
};

// Zero-dependency Event-driven Socket Client with auto-reconnect
class SafeSocketClient {
  constructor(url) {
    this.url = url;
    this.events = new Map();
    this.id = 'aviator-sock-' + Math.random().toString(36).substr(2, 9);
    this.connected = false;
    this.ws = null;
    this.reconnectTimer = null;
    this.isManualDisconnect = false;
    this.init();
  }

  init() {
    if (this.isManualDisconnect) return;
    try {
      const targetUrl = getSocketUrl();
      const wsUrl = targetUrl.startsWith("https") 
        ? targetUrl.replace(/^https/, 'wss') 
        : targetUrl.replace(/^http/, 'ws');
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.connected = true;
        console.log("🟢 Connected to Aviator Socket Server:", this.id);
        this.emitLocal("connect");
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
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
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        this.connected = false;
        console.warn("Socket error encountered");
        this.emitLocal("disconnect");
      };
    } catch (err) {
      this.connected = false;
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.isManualDisconnect) return;
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        console.log("🔄 Reconnecting to Aviator Socket...");
        this.init();
      }, 3000);
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
    this.isManualDisconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
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
