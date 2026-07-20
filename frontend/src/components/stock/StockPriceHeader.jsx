import { formatCurrency, formatPercent } from "../../utils/format.js";

export default function StockPriceHeader({ symbol, profile, quote, isLiveData }) {
  const isPositive = quote.change >= 0;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{symbol}</h1>
          {!isLiveData && (
            <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
              Demo data
            </span>
          )}
        </div>
        {profile?.name && (
          <p className="mt-0.5 text-sm text-[var(--color-ink-2)]">
            {profile.name}
            {profile.industry ? ` · ${profile.industry}` : ""}
          </p>
        )}
      </div>

      <div className="text-right">
        <p className="font-mono tabular text-3xl font-semibold">
          {formatCurrency(quote.current)}
        </p>
        <p
          className={`font-mono text-sm ${
            isPositive ? "text-[var(--color-gain)]" : "text-[var(--color-loss)]"
          }`}
        >
          {isPositive ? "↑" : "↓"} {formatCurrency(Math.abs(quote.change))} (
          {formatPercent(quote.changePercent)})
        </p>
      </div>
    </div>
  );
}
