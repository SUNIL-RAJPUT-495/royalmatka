class SocketManager {
  constructor() {
    this.wss = null;
  }

  initialize(wss) {
    this.wss = wss;
    console.log("📡 SocketManager initialized with WebSocket Server");
  }

  emit(event, data) {
    if (!this.wss) return;
    const message = JSON.stringify({ event, data });
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // 1 = OPEN
        try {
          client.send(message);
        } catch (err) {
          console.warn("Error sending message to client:", err);
        }
      }
    });
  }

  emitTo(socketId, event, data) {
    if (!this.wss) return;
    const message = JSON.stringify({ event, data });
    this.wss.clients.forEach((client) => {
      if (client.id === socketId && client.readyState === 1) {
        try {
          client.send(message);
        } catch (err) {
          console.warn(`Error sending message to client ${socketId}:`, err);
        }
      }
    });
  }

  emitRoom(room, event, data) {
    // Treat room emission as a general broadcast for simple local integration
    this.emit(event, data);
  }
}

export default new SocketManager();