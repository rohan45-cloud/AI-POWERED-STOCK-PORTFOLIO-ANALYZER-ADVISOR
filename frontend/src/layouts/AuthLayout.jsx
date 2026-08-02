import TickerStrip from "../components/ui/TickerStrip.jsx";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-svh bg-[var(--color-surface-0)]">
      {/* Left: branding panel — hidden on small screens */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden border-r border-[var(--color-line-soft)] bg-[var(--color-surface-1)] p-10 lg:flex">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-accent)] font-mono text-sm font-bold text-[var(--color-surface-0)]">
              Σ
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Sigma<span className="text-[var(--color-accent)]">Folio</span>
            </span>
          </div>
        </div>

        <div className="max-w-sm">
          <p className="text-3xl font-semibold leading-tight tracking-tight text-[var(--color-ink-1)]">
            Your portfolio,{" "}
            <span className="text-[var(--color-accent)]">read by AI</span>,
            explained in plain English.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-2)]">
            Track holdings, watch live prices, and get risk-aware insights
            generated from real market signals — not guesswork.
          </p>
        </div>

        <TickerStrip className="opacity-60" />
      </div>

      {/* Right: form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[58%]">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-accent)] font-mono text-xs font-bold text-[var(--color-surface-0)]">
              Σ
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Sigma<span className="text-[var(--color-accent)]">Folio</span>
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink-1)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-[var(--color-ink-2)]">
              {subtitle}
            </p>
          )}

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
