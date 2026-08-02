import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../layouts/AppShell.jsx";
import Button from "../components/ui/Button.jsx";
import WatchlistFormModal from "../components/portfolio/WatchlistFormModal.jsx";
import { useWatchlistStore } from "../store/watchlistStore.js";
import { formatCurrency, formatPercent } from "../utils/format.js";

export default function WatchlistPage() {
  const { items, isLoading, fetchWatchlist, removeFromWatchlist } = useWatchlistStore();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleRemove = async (id, symbol) => {
    const result = await removeFromWatchlist(id);
    if (result.success) {
      toast.success(`${symbol} removed from watchlist.`);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Watchlist</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-2)]">
            Stocks you're tracking without holding.
          </p>
        </div>
        <Button variant="accent" onClick={() => setModalOpen(true)}>
          + Add to watchlist
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-ink-3)] border-t-[var(--color-accent)]" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-line)] p-12 text-center">
            <p className="text-sm text-[var(--color-ink-2)]">
              Your watchlist is empty. Add a stock to keep an eye on it.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--color-line)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-1)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-2)]">
                  <th className="px-4 py-3 font-medium">Symbol</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium text-right">Change</th>
                  <th className="px-4 py-3 font-medium text-right">Target</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const quote = item.quote;
                  const isPositive = quote && quote.change >= 0;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--color-line-soft)] last:border-0 hover:bg-[var(--color-surface-1)]"
                    >
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/stock/${item.symbol}`}
                          className="font-semibold tracking-tight hover:text-[var(--color-accent)]"
                        >
                          {item.symbol}
                        </Link>
                        {item.companyName && (
                          <div className="text-xs text-[var(--color-ink-3)]">
                            {item.companyName}
                          </div>
                        )}
                        {item.note && (
                          <div className="mt-0.5 text-xs text-[var(--color-ink-3)]">
                            {item.note}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono tabular">
                        {quote ? formatCurrency(quote.current) : "—"}
                      </td>
                      <td
                        className={`px-4 py-3.5 text-right font-mono tabular text-sm ${
                          quote
                            ? isPositive
                              ? "text-[var(--color-gain)]"
                              : "text-[var(--color-loss)]"
                            : "text-[var(--color-ink-3)]"
                        }`}
                      >
                        {quote ? formatPercent(quote.changePercent) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono tabular text-[var(--color-ink-2)]">
                        {item.targetPrice ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span>
                              {item.alertDirection === "below" ? "↓" : "↑"}{" "}
                              {formatCurrency(item.targetPrice)}
                            </span>
                            {item.alertTriggeredAt && (
                              <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10px] font-sans font-medium normal-case text-[var(--color-accent)]">
                                Triggered
                              </span>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleRemove(item.id, item.symbol)}
                          className="text-xs font-medium text-[var(--color-ink-2)] hover:text-[var(--color-loss)]"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WatchlistFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AppShell>
  );
}
