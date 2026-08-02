import { useEffect } from "react";
import toast from "react-hot-toast";
import { getSocket } from "../api/socket.js";

/**
 * Subscribes to the "alert:triggered" socket event for the lifetime of the
 * mounting component (intended to be mounted once, at the app shell level,
 * so alerts surface no matter which page the user is currently on).
 */
export function usePriceAlerts() {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = ({ symbol, message }) => {
      toast(message, {
        icon: "🔔",
        duration: 8000,
        style: {
          background: "var(--color-accent-soft)",
          color: "var(--color-accent)",
          border: "1px solid var(--color-accent)",
        },
      });
    };

    socket.on("alert:triggered", handler);
    return () => socket.off("alert:triggered", handler);
  }, []);
}
