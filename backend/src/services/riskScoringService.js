/**
 * Deterministic risk & diversification scoring. Deliberately NOT delegated
 * to an LLM — these are numbers a user might make financial decisions on,
 * so they need to be reproducible, explainable, and auditable. The LLM's
 * job (in aiInsightsService.js) is only to narrate these pre-computed
 * numbers in plain English, never to invent the numbers themselves.
 */

// Rough sector volatility weights (1 = market-average volatility).
// Used as a simple proxy for risk concentration by sector; not a precise
// beta calculation, but a reasonable directional signal for an MVP.
const SECTOR_RISK_WEIGHTS = {
  Tech: 1.3,
  Technology: 1.3,
  Auto: 1.4,
  Automotive: 1.4,
  Crypto: 2.0,
  Energy: 1.2,
  Finance: 1.0,
  Financials: 1.0,
  Healthcare: 0.8,
  "Consumer Staples": 0.6,
  Utilities: 0.5,
  "Real Estate": 0.9,
  Industrials: 0.9,
  Unclassified: 1.1,
};

const getSectorWeight = (sector) => SECTOR_RISK_WEIGHTS[sector] ?? 1.1;

/**
 * Herfindahl-Hirschman Index (HHI) style concentration score, scaled to
 * 0-100. Higher = more concentrated (riskier from a diversification
 * standpoint). Uses each holding's % of portfolio value.
 */
const calculateConcentrationScore = (allocation) => {
  if (allocation.length === 0) return 0;
  const hhi = allocation.reduce((sum, a) => sum + (a.percent / 100) ** 2, 0);
  // HHI ranges 1/n (perfectly diversified) to 1 (single holding).
  // Scale to a 0-100 "concentration risk" score.
  return Math.round(hhi * 100);
};

/**
 * Sector diversification score, 0-100 (higher = more diversified across
 * sectors). Based on how evenly value is spread across distinct sectors.
 */
const calculateSectorDiversificationScore = (sectorAllocation) => {
  if (sectorAllocation.length === 0) return 0;
  if (sectorAllocation.length === 1) return 10; // single sector = poor diversification

  const hhi = sectorAllocation.reduce(
    (sum, s) => sum + (s.percent / 100) ** 2,
    0
  );
  // Convert HHI (lower = better diversified) into a 0-100 "good" score.
  const diversificationScore = Math.round((1 - hhi) * 100);
  return Math.max(0, Math.min(100, diversificationScore));
};

/**
 * Weighted-average sector risk multiplier for the portfolio, then mapped
 * onto a 0-100 risk score alongside concentration risk.
 */
const calculateOverallRiskScore = (allocation, sectorAllocation, concentrationScore) => {
  if (sectorAllocation.length === 0) return 0;

  const weightedSectorRisk = sectorAllocation.reduce((sum, s) => {
    return sum + (s.percent / 100) * getSectorWeight(s.sector);
  }, 0);

  // weightedSectorRisk typically ranges ~0.5 (very defensive) to ~2.0 (very volatile)
  // Normalize to roughly 0-100, then blend with concentration risk.
  const sectorRiskComponent = Math.min(100, Math.max(0, (weightedSectorRisk - 0.5) * 66.7));
  const blended = sectorRiskComponent * 0.6 + concentrationScore * 0.4;

  return Math.round(Math.max(0, Math.min(100, blended)));
};

const riskBand = (score) => {
  if (score < 30) return "low";
  if (score < 60) return "moderate";
  return "high";
};

/**
 * Main entry point: takes the same `{ holdings, summary, allocation,
 * sectorAllocation }` shape produced by portfolioService.buildPortfolioSummary
 * and returns a full risk/diversification analysis.
 */
export const analyzePortfolioRisk = (portfolioData) => {
  const { holdings, allocation, sectorAllocation } = portfolioData;

  if (!holdings || holdings.length === 0) {
    return {
      riskScore: 0,
      riskBand: "n/a",
      concentrationScore: 0,
      sectorDiversificationScore: 0,
      topConcentrations: [],
      sectorBreakdown: [],
      flags: [],
    };
  }

  const concentrationScore = calculateConcentrationScore(allocation);
  const sectorDiversificationScore = calculateSectorDiversificationScore(sectorAllocation);
  const riskScore = calculateOverallRiskScore(allocation, sectorAllocation, concentrationScore);

  const topConcentrations = [...allocation]
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);

  const flags = [];

  const biggestPosition = topConcentrations[0];
  if (biggestPosition && biggestPosition.percent > 40) {
    flags.push({
      type: "concentration",
      severity: "high",
      message: `${biggestPosition.symbol} makes up ${biggestPosition.percent}% of the portfolio — a single-stock drop would have an outsized impact.`,
    });
  } else if (biggestPosition && biggestPosition.percent > 25) {
    flags.push({
      type: "concentration",
      severity: "moderate",
      message: `${biggestPosition.symbol} makes up ${biggestPosition.percent}% of the portfolio, which is a fairly large single-stock weighting.`,
    });
  }

  if (sectorAllocation.length === 1) {
    flags.push({
      type: "sector",
      severity: "high",
      message: `All holdings are in a single sector (${sectorAllocation[0].sector}), with no cross-sector diversification.`,
    });
  } else if (sectorAllocation.length > 0) {
    const topSector = [...sectorAllocation].sort((a, b) => b.percent - a.percent)[0];
    if (topSector.percent > 60) {
      flags.push({
        type: "sector",
        severity: "moderate",
        message: `${topSector.percent}% of the portfolio is concentrated in ${topSector.sector}.`,
      });
    }
  }

  if (holdings.length < 5) {
    flags.push({
      type: "breadth",
      severity: "low",
      message: `Only ${holdings.length} position${holdings.length > 1 ? "s" : ""} held — a small number of positions amplifies the impact of any single stock's move.`,
    });
  }

  return {
    riskScore,
    riskBand: riskBand(riskScore),
    concentrationScore,
    sectorDiversificationScore,
    topConcentrations,
    sectorBreakdown: sectorAllocation,
    flags,
  };
};
