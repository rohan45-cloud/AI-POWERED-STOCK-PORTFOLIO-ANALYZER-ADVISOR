const SECTOR_COLORS = [
  "var(--color-accent)",
  "var(--color-gain)",
  "var(--color-loss)",
  "#7C9EF2",
  "#C77DE0",
  "#5EC4C7",
];

export default function DiversificationBreakdown({ sectorBreakdown }) {
  if (!sectorBreakdown || sectorBreakdown.length === 0) return null;

  const sorted = [...sectorBreakdown].sort((a, b) => b.percent - a.percent);

  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-1)] p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-2)]">
        Sector Breakdown
      </h3>

      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-3)]">
        {sorted.map((s, i) => (
          <div
            key={s.sector}
            style={{
              width: `${s.percent}%`,
              backgroundColor: SECTOR_COLORS[i % SECTOR_COLORS.length],
            }}
            title={`${s.sector}: ${s.percent}%`}
          />
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {sorted.map((s, i) => (
          <li key={s.sector} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: SECTOR_COLORS[i % SECTOR_COLORS.length] }}
              />
              <span className="text-[var(--color-ink-2)]">{s.sector}</span>
            </div>
            <span className="font-mono tabular text-[var(--color-ink-1)]">
              {s.percent}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
