class SocketManager {

    constructor() {
        this.io = null;
    }

    initialize(io) {
        this.io = io;
    }

    emit(event, data) {

        if (!this.io) return;

        this.io.emit(event, data);

    }

    emitTo(socketId, event, data) {

        if (!this.io) return;

        this.io.to(socketId).emit(event, data);

    }

    emitRoom(room, event, data) {

        if (!this.io) return;

        this.io.to(room).emit(event, data);

    }

}

export default new SocketManager();