import { getPortfolioForUser } from "../services/portfolioService.js";
import { analyzePortfolioRisk } from "../services/riskScoringService.js";
import { generatePortfolioExplanation, isAiConfigured } from "../services/aiInsightsService.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * @route   GET /api/v1/insights
 * @desc    Computes risk/diversification scores deterministically, then
 *          asks the LLM to narrate them in plain English. Numbers always
 *          come from riskScoringService; the LLM only explains them.
 * @access  Private
 */
export const getInsights = catchAsync(async (req, res) => {
  const portfolioData = await getPortfolioForUser(req.user._id);
  const riskAnalysis = analyzePortfolioRisk(portfolioData);

  const explanation = await generatePortfolioExplanation({
    riskAnalysis,
    summary: portfolioData.summary,
    topConcentrations: riskAnalysis.topConcentrations,
    userRiskTolerance: req.user.riskTolerance,
  });

  res.status(200).json({
    success: true,
    risk: riskAnalysis,
    explanation,
    isAiConfigured: isAiConfigured(),
  });
});
