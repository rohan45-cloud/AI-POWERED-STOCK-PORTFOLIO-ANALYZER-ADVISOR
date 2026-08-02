import PortfolioSnapshot from "../models/PortfolioSnapshot.js";
import { getPortfolioForUser } from "./portfolioService.js";

/**
 * Normalizes any Date to midnight UTC of that calendar day. Used as the
 * snapshot key so multiple captures on the same day overwrite each other
 * (upsert) instead of creating duplicate rows.
 */
export const normalizeToUtcMidnight = (date = new Date()) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * Captures today's portfolio summary as a snapshot (upsert — safe to call
 * multiple times a day, e.g. once per login, without creating duplicates).
 */
export const captureSnapshot = async (userId) => {
  const { summary } = await getPortfolioForUser(userId);
  const today = normalizeToUtcMidnight();

  const snapshot = await PortfolioSnapshot.findOneAndUpdate(
    { user: userId, date: today },
    {
      user: userId,
      date: today,
      totalInvested: summary.totalInvested,
      totalCurrentValue: summary.totalCurrentValue,
      totalProfitLoss: summary.totalProfitLoss,
      totalProfitLossPercent: summary.totalProfitLossPercent,
      holdingsCount: summary.holdingsCount,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return snapshot;
};

/**
 * Returns snapshots for the last `days` days, oldest first — ready to feed
 * directly into a line chart on the frontend.
 */
export const getSnapshotHistory = async (userId, days = 90) => {
  const since = normalizeToUtcMidnight(
    new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  );

  const snapshots = await PortfolioSnapshot.find({
    user: userId,
    date: { $gte: since },
  }).sort({ date: 1 });

  return snapshots.map((s) => ({
    date: s.date,
    totalInvested: s.totalInvested,
    totalCurrentValue: s.totalCurrentValue,
    totalProfitLoss: s.totalProfitLoss,
    totalProfitLossPercent: s.totalProfitLossPercent,
  }));
};
