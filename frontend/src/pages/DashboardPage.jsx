import { useEffect, useState, useMemo } from "react";
import AppShell from "../layouts/AppShell.jsx";
import PortfolioSummaryCards from "../components/portfolio/PortfolioSummaryCards.jsx";
import HoldingsTable from "../components/portfolio/HoldingsTable.jsx";
import HoldingFormModal from "../components/portfolio/HoldingFormModal.jsx";
import PerformanceChart from "../components/portfolio/PerformanceChart.jsx";
import Button from "../components/ui/Button.jsx";
import { usePortfolioStore } from "../store/portfolioStore.js";
import { useLivePrices } from "../hooks/useLivePrices.js";
import { portfolioApi } from "../api/portfolio.js";

export default function DashboardPage() {
  const { holdings, summary, isLoading, fetchPortfolio, applyLivePrice } =
    usePortfolioStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [lastTick, setLastTick] = useState(null);
  const [performanceHistory, setPerformanceHistory] = useState([]);

  useEffect(() => {
    fetchPortfolio();
    portfolioApi
      .getPerformance(90)
      .then((data) => setPerformanceHistory(data.history))
      .catch(() => {
        // Performance chart is supplementary — fail silently rather than
        // blocking or cluttering the dashboard with an error for it.
      });
  }, [fetchPortfolio]);

  const symbols = useMemo(() => holdings.map((h) => h.symbol), [holdings]);

  useLivePrices(symbols, (symbol, quote) => {
    applyLivePrice(symbol, quote);
    setLastTick(new Date());
  });

  const openAddModal = () => {
    setEditingHolding(null);
    setModalOpen(true);
  };

  const openEditModal = (holding) => {
    setEditingHolding(holding);
    setModalOpen(true);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Portfolio</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-[var(--color-ink-2)]">
            <span>
              {summary?.holdingsCount
                ? `${summary.holdingsCount} position${summary.holdingsCount > 1 ? "s" : ""}`
                : "No positions yet"}
            </span>
            {symbols.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    lastTick ? "bg-[var(--color-gain)]" : "bg-[var(--color-ink-3)]"
                  }`}
                />
                {lastTick ? "Live" : "Connecting…"}
              </span>
            )}
          </p>
        </div>
        <Button variant="accent" onClick={openAddModal}>
          + Add holding
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-ink-3)] border-t-[var(--color-accent)]" />
          </div>
        ) : (
          <PortfolioSummaryCards summary={summary} />
        )}
      </div>

      {!isLoading && summary?.holdingsCount > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-2)]">
            Performance
          </h2>
          <PerformanceChart history={performanceHistory} />
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-2)]">
          Holdings
        </h2>
        {!isLoading && (
          <HoldingsTable holdings={holdings} onEdit={openEditModal} />
        )}
      </div>

      <HoldingFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingHolding={editingHolding}
      />
    </AppShell>
  );
}
