const TREND_STYLES = {
  bullish: { label: "Bullish", color: "text-[var(--color-gain)]" },
  bearish: { label: "Bearish", color: "text-[var(--color-loss)]" },
  neutral: { label: "Neutral", color: "text-[var(--color-ink-2)]" },
};

const RSI_STYLES = {
  overbought: { label: "Overbought", color: "text-[var(--color-loss)]" },
  oversold: { label: "Oversold", color: "text-[var(--color-gain)]" },
  neutral: { label: "Neutral", color: "text-[var(--color-ink-2)]" },
};

function IndicatorRow({ label, value, badge }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-line-soft)] py-3 last:border-0">
      <span className="text-sm text-[var(--color-ink-2)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono tabular text-sm font-medium">
          {value}
        </span>
        {badge}
      </div>
    </div>
  );
}

function Badge({ text, colorClass }) {
  return (
    <span
      className={`rounded-full bg-[var(--color-surface-3)] px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {text}
    </span>
  );
}

export default function IndicatorsPanel({ snapshot }) {
  if (!snapshot) return null;

  const trend = TREND_STYLES[snapshot.trend] || TREND_STYLES.neutral;
  const rsiStyle = RSI_STYLES[snapshot.rsiSignal] || RSI_STYLES.neutral;

  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-1)] p-5">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-2)]">
        Technical Indicators
      </h3>

      <IndicatorRow
        label="20-day SMA"
        value={snapshot.sma20 !== null ? `$${snapshot.sma20.toFixed(2)}` : "—"}
      />
      <IndicatorRow
        label="50-day SMA"
        value={snapshot.sma50 !== null ? `$${snapshot.sma50.toFixed(2)}` : "—"}
      />
      <IndicatorRow
        label="Trend (20 vs 50 SMA)"
        value=""
        badge={<Badge text={trend.label} colorClass={trend.color} />}
      />
      <IndicatorRow
        label="RSI (14)"
        value={snapshot.rsi14 !== null ? snapshot.rsi14.toFixed(1) : "—"}
        badge={
          snapshot.rsiSignal !== "neutral" ? (
            <Badge text={rsiStyle.label} colorClass={rsiStyle.color} />
          ) : null
        }
      />

      <p className="mt-4 text-xs leading-relaxed text-[var(--color-ink-3)]">
        SMA crossovers and RSI are momentum signals based on historical
        price action — not predictions. RSI above 70 suggests the stock may
        be overbought; below 30 suggests oversold.
      </p>
    </div>
  );
}
