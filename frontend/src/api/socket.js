import { io } from "socket.io-client";

let socket = null;

/**
 * Returns a singleton authenticated socket connection. Connects lazily on
 * first call so we don't open a socket before the user is logged in.
 */
export const getSocket = () => {
    if (socket && socket.connected) return socket;

    const token = localStorage.getItem("token");
    if (!token) return null;

    if (socket) {
        socket.disconnect();
    }

    socket = io("/", {
        path: "/socket.io",
        auth: { token },
        transports: ["websocket", "polling"],
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};