import { useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatPercent, formatNumber } from "../../utils/format.js";
import { usePortfolioStore } from "../../store/portfolioStore.js";
import toast from "react-hot-toast";

export default function HoldingsTable({ holdings, onEdit }) {
  const deleteHolding = usePortfolioStore((s) => s.deleteHolding);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id, symbol) => {
    if (!window.confirm(`Remove ${symbol} from your portfolio?`)) return;
    setDeletingId(id);
    const result = await deleteHolding(id);
    setDeletingId(null);
    if (result.success) {
      toast.success(`${symbol} removed.`);
    } else {
      toast.error(result.message);
    }
  };

  if (holdings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-line)] p-12 text-center">
        <p className="text-sm text-[var(--color-ink-2)]">
          No holdings yet. Add your first position to start tracking your
          portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-line)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-1)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-2)]">
            <th className="px-4 py-3 font-medium">Symbol</th>
            <th className="px-4 py-3 font-medium text-right">Qty</th>
            <th className="px-4 py-3 font-medium text-right">Avg Buy</th>
            <th className="px-4 py-3 font-medium text-right">Current</th>
            <th className="px-4 py-3 font-medium text-right">Value</th>
            <th className="px-4 py-3 font-medium text-right">P&amp;L</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const isGain = h.profitLoss >= 0;
            return (
              <tr
                key={h.id}
                className="border-b border-[var(--color-line-soft)] last:border-0 hover:bg-[var(--color-surface-1)]"
              >
                <td className="px-4 py-3.5">
                  <Link
                    to={`/stock/${h.symbol}`}
                    className="font-semibold tracking-tight hover:text-[var(--color-accent)]"
                  >
                    {h.symbol}
                  </Link>
                  {h.companyName && (
                    <div className="text-xs text-[var(--color-ink-3)]">
                      {h.companyName}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right font-mono tabular text-[var(--color-ink-2)]">
                  {formatNumber(h.quantity)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono tabular text-[var(--color-ink-2)]">
                  {formatCurrency(h.avgBuyPrice)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono tabular">
                  {formatCurrency(h.currentPrice)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono tabular font-medium">
                  {formatCurrency(h.currentValue)}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div
                    className={`font-mono tabular font-medium ${
                      isGain
                        ? "text-[var(--color-gain)]"
                        : "text-[var(--color-loss)]"
                    }`}
                  >
                    {formatCurrency(h.profitLoss)}
                  </div>
                  <div
                    className={`font-mono text-xs ${
                      isGain
                        ? "text-[var(--color-gain)]"
                        : "text-[var(--color-loss)]"
                    }`}
                  >
                    {formatPercent(h.profitLossPercent)}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => onEdit(h)}
                      className="text-xs font-medium text-[var(--color-ink-2)] hover:text-[var(--color-accent)]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(h.id, h.symbol)}
                      disabled={deletingId === h.id}
                      className="text-xs font-medium text-[var(--color-ink-2)] hover:text-[var(--color-loss)] disabled:opacity-50"
                    >
                      {deletingId === h.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
