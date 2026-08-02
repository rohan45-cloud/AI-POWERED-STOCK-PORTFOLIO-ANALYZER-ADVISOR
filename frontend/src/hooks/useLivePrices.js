import { useEffect, useRef } from "react";
import { getSocket } from "../api/socket.js";

/**
 * Subscribes to live price updates for the given list of symbols and calls
 * onUpdate(symbol, quote) whenever the server pushes a new price.
 * Automatically unsubscribes from symbols that are removed from the list,
 * and from everything on unmount.
 */
export function useLivePrices(symbols, onUpdate) {
  const subscribedRef = useRef(new Set());

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    const socket = getSocket();
    if (!socket) return;

    const current = new Set(symbols);
    const previouslySubscribed = subscribedRef.current;

    const toSubscribe = symbols.filter((s) => !previouslySubscribed.has(s));
    const toUnsubscribe = [...previouslySubscribed].filter(
      (s) => !current.has(s)
    );

    if (toSubscribe.length > 0) socket.emit("subscribe", toSubscribe);
    if (toUnsubscribe.length > 0) socket.emit("unsubscribe", toUnsubscribe);

    subscribedRef.current = current;

    const handler = ({ symbol, quote }) => {
      onUpdate(symbol, quote);
    };
    socket.on("price:update", handler);

    return () => {
      socket.off("price:update", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(",")]);

  useEffect(() => {
    return () => {
      const socket = getSocket();
      if (socket && subscribedRef.current.size > 0) {
        socket.emit("unsubscribe", [...subscribedRef.current]);
      }
    };
  }, []);
}
