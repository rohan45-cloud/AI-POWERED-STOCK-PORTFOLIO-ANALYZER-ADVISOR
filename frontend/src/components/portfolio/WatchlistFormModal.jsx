import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import { useWatchlistStore } from "../../store/watchlistStore.js";

const EMPTY_FORM = {
  symbol: "",
  companyName: "",
  note: "",
  targetPrice: "",
  alertDirection: "above",
};

export default function WatchlistFormModal({ open, onClose }) {
  const addToWatchlist = useWatchlistStore((s) => s.addToWatchlist);
  const isMutating = useWatchlistStore((s) => s.isMutating);

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

  const validate = () => {
    const errors = {};
    if (!form.symbol.trim()) errors.symbol = "Symbol is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      symbol: form.symbol.trim().toUpperCase(),
      companyName: form.companyName.trim() || undefined,
      note: form.note.trim() || undefined,
      targetPrice: form.targetPrice === "" ? undefined : Number(form.targetPrice),
      alertDirection: form.alertDirection,
    };

    const result = await addToWatchlist(payload);
    if (result.success) {
      toast.success(`${payload.symbol} added to watchlist.`);
      setForm(EMPTY_FORM);
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add to watchlist">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="wl-symbol"
          name="symbol"
          label="Symbol"
          placeholder="NVDA"
          value={form.symbol}
          onChange={handleChange}
          error={fieldErrors.symbol}
          autoFocus
        />
        <Input
          id="wl-companyName"
          name="companyName"
          label="Company name (optional)"
          placeholder="NVIDIA Corporation"
          value={form.companyName}
          onChange={handleChange}
        />
        <Input
          id="wl-targetPrice"
          name="targetPrice"
          type="number"
          step="any"
          label="Target price (optional)"
          placeholder="e.g. alert price you're watching for"
          value={form.targetPrice}
          onChange={handleChange}
        />

        {form.targetPrice !== "" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-2)]">
              Alert me when price goes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "above", label: "↑ Above target" },
                { value: "below", label: "↓ Below target" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, alertDirection: opt.value })}
                  className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                    form.alertDirection === opt.value
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                      : "border-[var(--color-line)] text-[var(--color-ink-2)] hover:bg-[var(--color-surface-2)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <Input
          id="wl-note"
          name="note"
          label="Note (optional)"
          placeholder="Why you're watching this"
          value={form.note}
          onChange={handleChange}
        />

        <Button type="submit" variant="accent" loading={isMutating} className="mt-2 w-full">
          Add to watchlist
        </Button>
      </form>
    </Modal>
  );
}
