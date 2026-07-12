const BAND_CONFIG = {
  low: { label: "Low Risk", color: "var(--color-gain)" },
  moderate: { label: "Moderate Risk", color: "var(--color-accent)" },
  high: { label: "High Risk", color: "var(--color-loss)" },
  "n/a": { label: "No Data", color: "var(--color-ink-3)" },
};

export default function RiskScoreGauge({ riskScore, riskBand }) {
  const config = BAND_CONFIG[riskBand] || BAND_CONFIG["n/a"];
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 120 120" className="-rotate-90">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--color-surface-3)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={config.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono tabular text-2xl font-semibold">
            {riskScore}
          </span>
          <span className="text-xs text-[var(--color-ink-3)]">/ 100</span>
        </div>
      </div>
      <div>
        <span
          className="inline-block rounded-full px-3 py-1 text-sm font-semibold"
          style={{
            color: config.color,
            backgroundColor: "var(--color-surface-3)",
          }}
        >
          {config.label}
        </span>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-[var(--color-ink-3)]">
          Based on position concentration and sector diversification across
          your holdings.
        </p>
      </div>
    </div>
  );
}
