const TICKER_DATA = [
  { symbol: "AAPL", change: 1.24 },
  { symbol: "NVDA", change: 2.87 },
  { symbol: "MSFT", change: -0.42 },
  { symbol: "TSLA", change: -1.95 },
  { symbol: "GOOGL", change: 0.68 },
  { symbol: "AMZN", change: 1.03 },
  { symbol: "META", change: -0.31 },
  { symbol: "JPM", change: 0.55 },
  { symbol: "V", change: 0.19 },
  { symbol: "DIS", change: -0.87 },
];

/**
 * A slow, ambient strip of ticker symbols that scrolls in the background.
 * Purely decorative — reinforces the "live market" feeling without
 * pretending to be real data. Respects prefers-reduced-motion globally
 * via the CSS rule in index.css.
 */
export default function TickerStrip({ className = "" }) {
  const row = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div
      className={`overflow-hidden whitespace-nowrap select-none ${className}`}
      aria-hidden="true"
    >
      <div className="inline-flex animate-[ticker_40s_linear_infinite] gap-8">
        {row.map((item, i) => (
          <span
            key={i}
            className="font-mono text-sm tracking-tight text-[var(--color-ink-3)]"
          >
            {item.symbol}{" "}
            <span
              className={
                item.change >= 0
                  ? "text-[var(--color-gain)]"
                  : "text-[var(--color-loss)]"
              }
            >
              {item.change >= 0 ? "+" : ""}
              {item.change.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
