const SEVERITY_STYLES = {
  high: { dot: "bg-[var(--color-loss)]", text: "text-[var(--color-loss)]" },
  moderate: { dot: "bg-[var(--color-accent)]", text: "text-[var(--color-accent)]" },
  low: { dot: "bg-[var(--color-ink-3)]", text: "text-[var(--color-ink-2)]" },
};

export default function RiskFlagsList({ flags }) {
  if (!flags || flags.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-1)] p-5">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-2)]">
          Risk Flags
        </h3>
        <p className="text-sm text-[var(--color-ink-2)]">
          No notable concentration or diversification concerns detected.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-1)] p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-2)]">
        Risk Flags
      </h3>
      <ul className="flex flex-col gap-3">
        {flags.map((flag, i) => {
          const style = SEVERITY_STYLES[flag.severity] || SEVERITY_STYLES.low;
          return (
            <li key={i} className="flex items-start gap-2.5">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
              <p className="text-sm leading-relaxed text-[var(--color-ink-1)]">
                {flag.message}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
