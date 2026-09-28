import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { PackageItem } from "../../types/finance";

interface PackageItemFormProps {
  item?: PackageItem | null;
  onSave: (data: { name: string; amount: number; discount: number }) => Promise<void>;
  onCancel: () => void;
}

export default function PackageItemForm({
  item,
  onSave,
  onCancel,
}: PackageItemFormProps) {
  const [name, setName] = useState(item?.name ?? "");
  const [amount, setAmount] = useState(
    item ? String(item.amount) : "",
  );
  const [discount, setDiscount] = useState(
    item ? String(item.discount ?? 0) : "0",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(item?.name ?? "");
    setAmount(item ? String(item.amount) : "");
    setDiscount(item ? String(item.discount ?? 0) : "0");
    setError("");
  }, [item]);

  const gross = Number(amount) || 0;
  const discountValue = Number(discount) || 0;
  const finalAmount = Math.max(0, gross - discountValue);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const numericAmount = Number(amount);
    const numericDiscount = Number(discount);

    if (!cleanName) {
      setError("Service / Product name is required.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (
      !Number.isFinite(numericDiscount) ||
      numericDiscount < 0 ||
      numericDiscount > numericAmount
    ) {
      setError("Discount cannot be greater than the amount.");
      return;
    }

    try {
      setSaving(true);

      await onSave({
        name: cleanName,
        amount: numericAmount,
        discount: numericDiscount,
      });

      onCancel();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save package item.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {item ? "Edit Service / Product" : "Add Service / Product"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Add the service or product included in this academy package.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Service / Product
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Example: E-Sccholar Academy Management System"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="80000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Discount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Final Amount</span>
              <span className="font-semibold text-slate-900">
                ₹{finalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : item ? "Update Service" : "Add Service"}
          </button>
        </div>
      </form>
    </div>
  );
}