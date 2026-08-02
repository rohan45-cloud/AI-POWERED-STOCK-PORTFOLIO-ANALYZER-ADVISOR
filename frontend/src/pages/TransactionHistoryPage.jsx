import { useEffect, useState } from "react";
import AppShell from "../layouts/AppShell.jsx";
import { portfolioApi } from "../api/portfolio.js";
import { formatCurrency, formatNumber } from "../utils/format.js";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    portfolioApi
      .getTransactions()
      .then((data) => setTransactions(data.transactions))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AppShell>
      <h1 className="text-xl font-semibold tracking-tight">Transaction History</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-2)]">
        Every buy and sell recorded against your portfolio.
      </p>

      <div className="mt-6">
        {isLoading && (
          <div className="flex h-32 items-center justify-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-ink-3)] border-t-[var(--color-accent)]" />
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-lg border border-[var(--color-loss)]/30 bg-[var(--color-loss-soft)] p-6 text-sm text-[var(--color-loss)]">
            Couldn't load transaction history: {error}
          </div>
        )}

        {!isLoading && !error && transactions.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--color-line)] p-12 text-center">
            <p className="text-sm text-[var(--color-ink-2)]">
              No transactions yet. Buying or selling holdings will show up
              here.
            </p>
          </div>
        )}

        {!isLoading && !error && transactions.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-[var(--color-line)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-1)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-2)]">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Symbol</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Qty</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx._id}
                    className="border-b border-[var(--color-line-soft)] last:border-0 hover:bg-[var(--color-surface-1)]"
                  >
                    <td className="px-4 py-3.5 text-[var(--color-ink-2)]">
                      {formatDate(tx.executedAt)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold tracking-tight">
                      {tx.symbol}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          tx.type === "BUY"
                            ? "bg-[var(--color-gain-soft)] text-[var(--color-gain)]"
                            : "bg-[var(--color-loss-soft)] text-[var(--color-loss)]"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular text-[var(--color-ink-2)]">
                      {formatNumber(tx.quantity)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular text-[var(--color-ink-2)]">
                      {formatCurrency(tx.price)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular font-medium">
                      {formatCurrency(tx.totalValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
