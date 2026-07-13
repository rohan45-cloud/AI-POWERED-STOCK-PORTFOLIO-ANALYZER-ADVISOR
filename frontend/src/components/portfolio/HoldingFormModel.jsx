import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import { usePortfolioStore } from "../../store/portfolioStore.js";

const EMPTY_FORM = {
  symbol: "",
  companyName: "",
  quantity: "",
  avgBuyPrice: "",
  currentPrice: "",
  sector: "",
};

export default function HoldingFormModal({ open, onClose, editingHolding }) {
  const addHolding = usePortfolioStore((s) => s.addHolding);
  const updateHolding = usePortfolioStore((s) => s.updateHolding);
  const isMutating = usePortfolioStore((s) => s.isMutating);

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  const isEditing = Boolean(editingHolding);

  useEffect(() => {
    if (editingHolding) {
      setForm({
        symbol: editingHolding.symbol,
        companyName: editingHolding.companyName || "",
        quantity: editingHolding.quantity,
        avgBuyPrice: editingHolding.avgBuyPrice,
        currentPrice: editingHolding.currentPrice ?? "",
        sector: editingHolding.sector || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setFieldErrors({});
  }, [editingHolding, open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

  const validate = () => {
    const errors = {};
    if (!isEditing && !form.symbol.trim())
      errors.symbol = "Symbol is required";
    if (!form.quantity || Number(form.quantity) <= 0)
      errors.quantity = "Enter a quantity greater than 0";
    if (form.avgBuyPrice === "" || Number(form.avgBuyPrice) < 0)
      errors.avgBuyPrice = "Enter a valid buy price";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      symbol: form.symbol.trim().toUpperCase(),
      companyName: form.companyName.trim() || undefined,
      quantity: Number(form.quantity),
      avgBuyPrice: Number(form.avgBuyPrice),
      currentPrice: form.currentPrice === "" ? undefined : Number(form.currentPrice),
      sector: form.sector.trim() || undefined,
    };

    const result = isEditing
      ? await updateHolding(editingHolding.id, payload)
      : await addHolding(payload);

    if (result.success) {
      toast.success(isEditing ? "Holding updated." : "Holding added.");
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Edit ${editingHolding?.symbol}` : "Add holding"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isEditing && (
          <Input
            id="symbol"
            name="symbol"
            label="Symbol"
            placeholder="AAPL"
            value={form.symbol}
            onChange={handleChange}
            error={fieldErrors.symbol}
            autoFocus
          />
        )}
        <Input
          id="companyName"
          name="companyName"
          label="Company name (optional)"
          placeholder="Apple Inc."
          value={form.companyName}
          onChange={handleChange}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="any"
            label="Quantity"
            placeholder="10"
            value={form.quantity}
            onChange={handleChange}
            error={fieldErrors.quantity}
          />
          <Input
            id="avgBuyPrice"
            name="avgBuyPrice"
            type="number"
            step="any"
            label="Avg buy price"
            placeholder="150.00"
            value={form.avgBuyPrice}
            onChange={handleChange}
            error={fieldErrors.avgBuyPrice}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="currentPrice"
            name="currentPrice"
            type="number"
            step="any"
            label="Current price (optional)"
            placeholder="180.00"
            value={form.currentPrice}
            onChange={handleChange}
          />
          <Input
            id="sector"
            name="sector"
            label="Sector (optional)"
            placeholder="Tech"
            value={form.sector}
            onChange={handleChange}
          />
        </div>

        <Button
          type="submit"
          variant="accent"
          loading={isMutating}
          className="mt-2 w-full"
        >
          {isEditing ? "Save changes" : "Add holding"}
        </Button>
      </form>
    </Modal>
  );
}
