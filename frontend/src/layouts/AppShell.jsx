import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import Button from "../components/ui/Button.jsx";
import { usePriceAlerts } from "../hooks/usePriceAlerts.js";

const NAV_LINKS = [
  { to: "/dashboard", label: "Portfolio" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/transactions", label: "History" },
  { to: "/insights", label: "AI Insights" },
];

export default function AppShell({ children }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  usePriceAlerts();

  return (
    <div className="min-h-svh bg-[var(--color-surface-0)]">
      <header className="border-b border-[var(--color-line-soft)] bg-[var(--color-surface-1)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-accent)] font-mono text-xs font-bold text-[var(--color-surface-0)]">
                Σ
              </div>
              <span className="text-sm font-semibold tracking-tight">
                Sigma<span className="text-[var(--color-accent)]">Folio</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 sm:flex">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--color-surface-3)] text-[var(--color-ink-1)]"
                        : "text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-[var(--color-ink-2)] sm:inline">
              {user?.name}
            </span>
            <Button variant="ghost" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
