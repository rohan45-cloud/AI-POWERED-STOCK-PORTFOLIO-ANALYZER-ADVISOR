import { create } from "zustand";
import { watchlistApi } from "../api/watchlist.js";

export const useWatchlistStore = create((set, get) => ({
  items: [],
  isLoading: false,
  isMutating: false,
  error: null,

  fetchWatchlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const { watchlist } = await watchlistApi.getWatchlist();
      set({ items: watchlist, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  addToWatchlist: async (payload) => {
    set({ isMutating: true });
    try {
      await watchlistApi.addToWatchlist(payload);
      await get().fetchWatchlist();
      set({ isMutating: false });
      return { success: true };
    } catch (err) {
      set({ isMutating: false });
      return { success: false, message: err.message };
    }
  },

  removeFromWatchlist: async (id) => {
    set({ isMutating: true });
    try {
      await watchlistApi.removeFromWatchlist(id);
      await get().fetchWatchlist();
      set({ isMutating: false });
      return { success: true };
    } catch (err) {
      set({ isMutating: false });
      return { success: false, message: err.message };
    }
  },
}));
