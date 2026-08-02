import Anthropic from "@anthropic-ai/sdk";
import cache from "../utils/cache.js";

const hasApiKey = () =>
  Boolean(
    process.env.ANTHROPIC_API_KEY &&
      process.env.ANTHROPIC_API_KEY !== "your_anthropic_api_key_here"
  );

let client = null;
const getClient = () => {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
};

const MODEL = "claude-sonnet-4-6";
const EXPLANATION_TTL = 60 * 30; // 30 min — risk data doesn't change every second

/**
 * Builds a deterministic fallback explanation from the pre-computed numbers
 * alone, used when no API key is configured or the API call fails. This
 * keeps the feature fully functional without a key, and resilient to API
 * outages — it just won't have the more natural narrative voice.
 */
const buildFallbackExplanation = (riskAnalysis, summary, userRiskTolerance) => {
  const lines = [];

  if (summary.holdingsCount === 0) {
    return "Your portfolio is empty. Add a few holdings to get a personalized risk and diversification analysis.";
  }

  lines.push(
    `Your portfolio carries a ${riskAnalysis.riskBand} risk profile (score: ${riskAnalysis.riskScore}/100), based on ${summary.holdingsCount} position${summary.holdingsCount > 1 ? "s" : ""}.`
  );

  if (riskAnalysis.flags.length > 0) {
    lines.push(
      "Key things to be aware of: " +
        riskAnalysis.flags.map((f) => f.message).join(" ")
    );
  } else {
    lines.push(
      "No major concentration or diversification concerns were detected at this time."
    );
  }

  if (userRiskTolerance) {
    const mismatch =
      (userRiskTolerance === "conservative" && riskAnalysis.riskBand === "high") ||
      (userRiskTolerance === "aggressive" && riskAnalysis.riskBand === "low");
    if (mismatch) {
      lines.push(
        `This portfolio's risk level doesn't closely match your stated "${userRiskTolerance}" risk tolerance — worth a second look.`
      );
    }
  }

  return lines.join(" ");
};

/**
 * Generates a plain-English narrative explanation of an already-computed
 * risk analysis. The model is given the numbers as facts and instructed
 * only to explain them — it does not calculate risk scores itself, which
 * keeps the actual financial math deterministic and auditable.
 */
export const generatePortfolioExplanation = async ({
  riskAnalysis,
  summary,
  topConcentrations,
  userRiskTolerance,
}) => {
  const cacheKey = `ai-explanation:${JSON.stringify({
    riskScore: riskAnalysis.riskScore,
    holdingsCount: summary.holdingsCount,
    flags: riskAnalysis.flags.map((f) => f.type),
    pl: summary.totalProfitLossPercent,
  })}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (summary.holdingsCount === 0) {
    const empty = {
      text: buildFallbackExplanation(riskAnalysis, summary, userRiskTolerance),
      isAiGenerated: false,
    };
    return empty;
  }

  if (!hasApiKey()) {
    const fallback = {
      text: buildFallbackExplanation(riskAnalysis, summary, userRiskTolerance),
      isAiGenerated: false,
    };
    cache.set(cacheKey, fallback, EXPLANATION_TTL);
    return fallback;
  }

  const prompt = buildPrompt({ riskAnalysis, summary, topConcentrations, userRiskTolerance });

  try {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    const result = { text, isAiGenerated: true };
    cache.set(cacheKey, result, EXPLANATION_TTL);
    return result;
  } catch (err) {
    console.warn("Anthropic API call failed, using fallback explanation:", err.message);
    const fallback = {
      text: buildFallbackExplanation(riskAnalysis, summary, userRiskTolerance),
      isAiGenerated: false,
    };
    cache.set(cacheKey, fallback, EXPLANATION_TTL);
    return fallback;
  }
};

function buildPrompt({ riskAnalysis, summary, topConcentrations, userRiskTolerance }) {
  return `You are a portfolio analysis assistant. You will be given pre-computed, deterministic risk metrics for a stock portfolio. Your job is ONLY to explain these numbers in plain, friendly English for a retail investor — you must NOT invent new numbers, recalculate anything, or give specific buy/sell instructions for individual securities.

Portfolio facts (already computed, treat as ground truth):
- Number of holdings: ${summary.holdingsCount}
- Total portfolio value: $${summary.totalCurrentValue}
- Overall gain/loss: ${summary.totalProfitLossPercent}%
- Risk score: ${riskAnalysis.riskScore}/100 (band: ${riskAnalysis.riskBand})
- Concentration score: ${riskAnalysis.concentrationScore}/100
- Sector diversification score: ${riskAnalysis.sectorDiversificationScore}/100
- Top holdings by allocation: ${topConcentrations.map((c) => `${c.symbol} (${c.percent}%)`).join(", ")}
- Sector breakdown: ${riskAnalysis.sectorBreakdown.map((s) => `${s.sector} (${s.percent}%)`).join(", ")}
- Detected flags: ${riskAnalysis.flags.length > 0 ? riskAnalysis.flags.map((f) => f.message).join(" | ") : "none"}
- User's stated risk tolerance: ${userRiskTolerance || "not specified"}

Write a short (3-5 sentence) plain-English summary covering: (1) the overall risk picture, (2) the most important diversification observation, and (3) whether this seems to align with the user's stated risk tolerance, if specified. Be specific using the numbers given, but do not state any number that wasn't provided above. Do not give individual buy/sell/hold advice on any specific ticker. End with a brief reminder that this is informational, not financial advice.`;
}

export const isAiConfigured = () => hasApiKey();
