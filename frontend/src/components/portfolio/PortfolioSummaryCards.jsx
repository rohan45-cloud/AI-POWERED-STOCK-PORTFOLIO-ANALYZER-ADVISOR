import { formatCurrency, formatPercent } from "../../utils/format.js";

function StatCard({ label, value, delta, deltaPercent, mono = true }) {
  const isPositive = delta !== undefined && delta >= 0;
  const hasDelta = delta !== undefined && delta !== null;

  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-1)] p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-2)]">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-semibold tracking-tight ${
          mono ? "font-mono tabular" : ""
        }`}
      >
        {value}
      </p>
      {hasDelta && (
        <p
          className={`mt-1 font-mono text-sm ${
            isPositive ? "text-[var(--color-gain)]" : "text-[var(--color-loss)]"
          }`}
        >
          {isPositive ? "↑" : "↓"} {formatCurrency(Math.abs(delta))}
          {deltaPercent !== undefined && (
            <span className="ml-1 text-[var(--color-ink-3)]">
              ({formatPercent(deltaPercent)})
            </span>
          )}
        </p>
      )}
    </div>
  );
}

export default function PortfolioSummaryCards({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Current value"
        value={formatCurrency(summary.totalCurrentValue)}
      />
      <StatCard
        label="Total invested"
        value={formatCurrency(summary.totalInvested)}
      />
      <StatCard
        label="Total gain / loss"
        value={formatCurrency(summary.totalProfitLoss)}
        delta={summary.totalProfitLoss}
        deltaPercent={summary.totalProfitLossPercent}
        mono
      />
    </div>
  );
}
