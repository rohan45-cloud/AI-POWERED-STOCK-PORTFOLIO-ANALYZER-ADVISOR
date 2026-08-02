import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppShell from "../layouts/AppShell.jsx";
import StockPriceHeader from "../components/stock/StockPriceHeader.jsx";
import PriceChart from "../components/stock/PriceChart.jsx";
import IndicatorsPanel from "../components/stock/IndicatorsPanel.jsx";
import NewsFeed from "../components/stock/NewsFeed.jsx";
import { stocksApi } from "../api/stocks.js";

const RANGE_OPTIONS = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

export default function StockDetailPage() {
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(90);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    stocksApi
      .getDetail(symbol, days)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, days]);

  return (
    <AppShell>
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-ink-2)] hover:text-[var(--color-accent)]"
      >
        ← Back to portfolio
      </Link>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-ink-3)] border-t-[var(--color-accent)]" />
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-lg border border-[var(--color-loss)]/30 bg-[var(--color-loss-soft)] p-6 text-sm text-[var(--color-loss)]">
          Couldn't load data for {symbol}: {error}
        </div>
      )}

      {data && !isLoading && (
        <div className="flex flex-col gap-6">
          <StockPriceHeader
            symbol={data.symbol}
            profile={data.profile}
            quote={data.quote}
            isLiveData={data.isLiveData}
          />

          <div className="flex items-center gap-2">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                onClick={() => setDays(opt.days)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === opt.days
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-ink-2)] hover:bg-[var(--color-surface-2)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <PriceChart
            timestamps={data.candles.t}
            closes={data.candles.c}
            sma20={data.indicators.sma20}
            sma50={data.indicators.sma50}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <IndicatorsPanel snapshot={data.indicators.snapshot} />
            </div>
            <div className="lg:col-span-2">
              <NewsFeed news={data.news} />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
