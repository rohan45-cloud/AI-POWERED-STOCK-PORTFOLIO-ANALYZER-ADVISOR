import { useEffect } from "react";

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-1)] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-[var(--color-ink-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-ink-1)]"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
