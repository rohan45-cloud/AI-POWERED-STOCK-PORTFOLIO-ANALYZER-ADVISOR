import { create } from "zustand";
import { portfolioApi } from "../api/portfolio.js";

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export const usePortfolioStore = create((set, get) => ({
  holdings: [],
  summary: null,
  allocation: [],
  sectorAllocation: [],
  isLoading: false,
  isMutating: false,
  error: null,

  fetchPortfolio: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await portfolioApi.getPortfolio();
      set({
        holdings: data.holdings,
        summary: data.summary,
        allocation: data.allocation,
        sectorAllocation: data.sectorAllocation,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  addHolding: async (payload) => {
    set({ isMutating: true });
    try {
      await portfolioApi.addHolding(payload);
      await get().fetchPortfolio();
      set({ isMutating: false });
      return { success: true };
    } catch (err) {
      set({ isMutating: false });
      return { success: false, message: err.message };
    }
  },

  updateHolding: async (id, payload) => {
    set({ isMutating: true });
    try {
      await portfolioApi.updateHolding(id, payload);
      await get().fetchPortfolio();
      set({ isMutating: false });
      return { success: true };
    } catch (err) {
      set({ isMutating: false });
      return { success: false, message: err.message };
    }
  },

  // Applies a single live price tick to the in-memory holdings list and
  // recomputes the summary client-side, without a full server refetch.
  // This keeps the dashboard feeling "live" between full refreshes.
  applyLivePrice: (symbol, quote) => {
    if (!quote || typeof quote.current !== "number") return;

    set((state) => {
      const holdings = state.holdings.map((h) =>
        h.symbol === symbol
          ? {
              ...h,
              currentPrice: quote.current,
              currentValue: round2(h.quantity * quote.current),
              profitLoss: round2(
                h.quantity * quote.current - h.investedValue
              ),
              profitLossPercent:
                h.investedValue === 0
                  ? 0
                  : round2(
                      ((h.quantity * quote.current - h.investedValue) /
                        h.investedValue) *
                        100
                    ),
            }
          : h
      );

      const totalCurrentValue = holdings.reduce(
        (sum, h) => sum + h.currentValue,
        0
      );
      const totalInvested = holdings.reduce(
        (sum, h) => sum + h.investedValue,
        0
      );
      const totalProfitLoss = totalCurrentValue - totalInvested;
      const totalProfitLossPercent =
        totalInvested === 0 ? 0 : (totalProfitLoss / totalInvested) * 100;

      return {
        holdings,
        summary: state.summary
          ? {
              ...state.summary,
              totalCurrentValue: round2(totalCurrentValue),
              totalInvested: round2(totalInvested),
              totalProfitLoss: round2(totalProfitLoss),
              totalProfitLossPercent: round2(totalProfitLossPercent),
            }
          : state.summary,
      };
    });
  },

  deleteHolding: async (id) => {
    set({ isMutating: true });
    try {
      await portfolioApi.deleteHolding(id);
      await get().fetchPortfolio();
      set({ isMutating: false });
      return { success: true };
    } catch (err) {
      set({ isMutating: false });
      return { success: false, message: err.message };
    }
  },
}));
