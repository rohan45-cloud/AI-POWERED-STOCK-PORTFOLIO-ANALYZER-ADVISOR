import Holding from "../models/Holding.js";

/**
 * Computes aggregate portfolio metrics from a user's holdings.
 * Kept separate from the controller so the upcoming AI-insights module
 * can reuse this same summary (e.g. for diversification/risk scoring)
 * without duplicating the math.
 */
export const buildPortfolioSummary = (holdings) => {
  let totalInvested = 0;
  let totalCurrentValue = 0;
  const sectorBreakdown = {};

  const enriched = holdings.map((h) => {
    const price = h.currentPrice ?? h.avgBuyPrice;
    const investedValue = h.quantity * h.avgBuyPrice;
    const currentValue = h.quantity * price;
    const profitLoss = currentValue - investedValue;
    const profitLossPercent =
      investedValue === 0 ? 0 : (profitLoss / investedValue) * 100;

    totalInvested += investedValue;
    totalCurrentValue += currentValue;

    const sectorKey = h.sector || "Unclassified";
    sectorBreakdown[sectorKey] =
      (sectorBreakdown[sectorKey] || 0) + currentValue;

    return {
      id: h._id,
      symbol: h.symbol,
      companyName: h.companyName,
      quantity: h.quantity,
      avgBuyPrice: h.avgBuyPrice,
      currentPrice: price,
      sector: h.sector,
      investedValue: round2(investedValue),
      currentValue: round2(currentValue),
      profitLoss: round2(profitLoss),
      profitLossPercent: round2(profitLossPercent),
      purchaseDate: h.purchaseDate,
    };
  });

  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalProfitLossPercent =
    totalInvested === 0 ? 0 : (totalProfitLoss / totalInvested) * 100;

  // Allocation percentage per holding, used for diversification insight later
  const allocation = enriched.map((h) => ({
    symbol: h.symbol,
    percent:
      totalCurrentValue === 0
        ? 0
        : round2((h.currentValue / totalCurrentValue) * 100),
  }));

  const sectorAllocation = Object.entries(sectorBreakdown).map(
    ([sector, value]) => ({
      sector,
      value: round2(value),
      percent:
        totalCurrentValue === 0 ? 0 : round2((value / totalCurrentValue) * 100),
    })
  );

  return {
    holdings: enriched,
    summary: {
      totalInvested: round2(totalInvested),
      totalCurrentValue: round2(totalCurrentValue),
      totalProfitLoss: round2(totalProfitLoss),
      totalProfitLossPercent: round2(totalProfitLossPercent),
      holdingsCount: enriched.length,
    },
    allocation,
    sectorAllocation,
  };
};

/**
 * Fetches all holdings for a user and returns the computed summary.
 */
export const getPortfolioForUser = async (userId) => {
  const holdings = await Holding.find({ user: userId }).sort({ createdAt: -1 });
  return buildPortfolioSummary(holdings);
};

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
