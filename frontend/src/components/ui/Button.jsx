const variants = {
  primary:
    "bg-[var(--color-ink-1)] text-[var(--color-surface-0)] hover:bg-white",
  accent:
    "bg-[var(--color-accent)] text-[var(--color-surface-0)] hover:brightness-110",
  ghost:
    "bg-transparent text-[var(--color-ink-1)] border border-[var(--color-line)] hover:bg-[var(--color-surface-2)]",
};

export default function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold tracking-tight transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
