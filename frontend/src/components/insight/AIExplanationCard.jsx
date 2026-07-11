export default function AiExplanationCard({ explanation, isAiConfigured }) {
  if (!explanation) return null;

  return (
    <div className="rounded-lg border border-[var(--color-accent)]/25 bg-[var(--color-accent-soft)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
          <span className="font-mono">✦</span> AI Portfolio Summary
        </h3>
        {!explanation.isAiGenerated && (
          <span
            className="text-xs text-[var(--color-ink-3)]"
            title={
              isAiConfigured
                ? "AI explanation temporarily unavailable, showing a generated summary instead"
                : "Configure ANTHROPIC_API_KEY to enable natural-language summaries"
            }
          >
            {isAiConfigured ? "Fallback summary" : "Demo summary"}
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-[var(--color-ink-1)]">
        {explanation.text}
      </p>
    </div>
  );
}
