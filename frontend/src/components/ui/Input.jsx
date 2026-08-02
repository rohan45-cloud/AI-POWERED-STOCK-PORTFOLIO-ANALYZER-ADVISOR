export default function Input({
  label,
  id,
  type = "text",
  error,
  className = "",
  ...rest
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-2)]"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`rounded-md border bg-[var(--color-surface-3)] px-3.5 py-2.5 text-sm text-[var(--color-ink-1)] placeholder:text-[var(--color-ink-3)] outline-none transition-colors focus:border-[var(--color-accent)] ${
          error ? "border-[var(--color-loss)]" : "border-[var(--color-line)]"
        } ${className}`}
        {...rest}
      />
      {error && (
        <span className="text-xs text-[var(--color-loss)]">{error}</span>
      )}
    </div>
  );
}
