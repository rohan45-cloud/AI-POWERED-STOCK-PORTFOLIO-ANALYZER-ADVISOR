function timeAgo(unixSeconds) {
  const diffMs = Date.now() - unixSeconds * 1000;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NewsFeed({ news }) {
  if (!news || news.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-line)] p-8 text-center text-sm text-[var(--color-ink-2)]">
        No recent news found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-1)]">
      <h3 className="border-b border-[var(--color-line-soft)] px-5 py-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-2)]">
        Recent News
      </h3>
      <ul>
        {news.map((item) => (
          <li
            key={item.id}
            className="border-b border-[var(--color-line-soft)] px-5 py-4 last:border-0"
          >
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium leading-snug text-[var(--color-ink-1)] hover:text-[var(--color-accent)]"
              >
                {item.headline}
              </a>
            ) : (
              <p className="text-sm font-medium leading-snug text-[var(--color-ink-1)]">
                {item.headline}
              </p>
            )}
            {item.summary && (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--color-ink-2)]">
                {item.summary}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-ink-3)]">
              <span>{item.source}</span>
              <span>·</span>
              <span>{timeAgo(item.datetime)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
