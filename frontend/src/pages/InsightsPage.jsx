import { useEffect, useState } from "react";
import AppShell from "../layouts/AppShell.jsx";
import RiskScoreGauge from "../components/insights/RiskScoreGauge.jsx";
import DiversificationBreakdown from "../components/insights/DiversificationBreakdown.jsx";
import RiskFlagsList from "../components/insights/RiskFlagsList.jsx";
import AiExplanationCard from "../components/insights/AiExplanationCard.jsx";
import { insightsApi } from "../api/insights.js";

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    insightsApi
      .getInsights()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AppShell>
      <h1 className="text-xl font-semibold tracking-tight">AI Insights</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-2)]">
        Risk and diversification analysis generated from your current
        holdings.
      </p>

      {isLoading && (
        <div className="mt-10 flex h-48 items-center justify-center">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-ink-3)] border-t-[var(--color-accent)]" />
        </div>
      )}

      {error && !isLoading && (
        <div className="mt-6 rounded-lg border border-[var(--color-loss)]/30 bg-[var(--color-loss-soft)] p-6 text-sm text-[var(--color-loss)]">
          Couldn't load insights: {error}
        </div>
      )}

      {data && !isLoading && (
        <div className="mt-6 flex flex-col gap-6">
          {data.risk.riskBand === "n/a" ? (
            <div className="rounded-lg border border-dashed border-[var(--color-line)] p-12 text-center">
              <p className="text-sm text-[var(--color-ink-2)]">
                Add holdings to your portfolio to see risk and
                diversification insights.
              </p>
            </div>
          ) : (
            <>
              <AiExplanationCard
                explanation={data.explanation}
                isAiConfigured={data.isAiConfigured}
              />

              <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-1)] p-6">
                <RiskScoreGauge
                  riskScore={data.risk.riskScore}
                  riskBand={data.risk.riskBand}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DiversificationBreakdown
                  sectorBreakdown={data.risk.sectorBreakdown}
                />
                <RiskFlagsList flags={data.risk.flags} />
              </div>
            </>
          )}
        </div>
      )}
    </AppShell>
  );
}
