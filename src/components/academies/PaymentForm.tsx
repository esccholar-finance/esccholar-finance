import { useEffect, useState } from "react";
import { createPayment, updatePayment } from "../../services/paymentService";
import type { Payment, PaymentMethod } from "../../types/finance";

interface PaymentFormProps {
  academyId: number;
  onSaved: () => void;
  onCancel: () => void;
  pendingAmount?: number;
  editingPayment?: Payment | null;
  packageItemId?: number;
}

const paymentMethods: {
  value: PaymentMethod;
  label: string;
}[] = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

function requiresReference(method: PaymentMethod) {
  return (
    method === "upi" ||
    method === "bank_transfer" ||
    method === "card"
  );
}

function referenceLabel(method: PaymentMethod) {
  if (method === "card") {
    return "Transaction / Reference Number *";
  }

  return "Transaction ID / UTR *";
}

function referencePlaceholder(method: PaymentMethod) {
  if (method === "upi") {
    return "Enter UPI Transaction ID / UTR";
  }

  if (method === "bank_transfer") {
    return "Enter Bank UTR / Transaction ID";
  }

  return "Enter Card Reference Number";
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 16);
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export function PaymentForm({
  academyId,
  onSaved,
  onCancel,
  pendingAmount,
  editingPayment,
  packageItemId,
}: PaymentFormProps) {
  const isEditing = Boolean(editingPayment?.id);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("upi");
  const [transactionReference, setTransactionReference] =
    useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingPayment) {
      setAmount("");
      setPaymentMethod("upi");
      setTransactionReference("");
      setPaymentDate(new Date().toISOString().slice(0, 16));
      setDescription("");
      setError("");
      return;
    }

    setAmount(String(editingPayment.amount));
    setPaymentMethod(editingPayment.paymentMethod);
    setTransactionReference(editingPayment.transactionReference ?? "");
    setPaymentDate(toDateTimeLocal(editingPayment.paymentDate));
    setDescription(editingPayment.description ?? "");
    setError("");
  }, [editingPayment]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const numericAmount = Number(amount);
    const reference = transactionReference.trim();

    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (
      !isEditing &&
      pendingAmount !== undefined &&
      numericAmount > pendingAmount
    ) {
      setError(
        `Payment cannot exceed the pending amount of INR ${pendingAmount.toLocaleString("en-IN")}.`,
      );
      return;
    }

    if (!paymentDate) {
      setError("Please select payment date and time.");
      return;
    }

    if (requiresReference(paymentMethod) && !reference) {
      setError(
        `${referenceLabel(paymentMethod).replace(" *", "")} is required.`,
      );
      return;
    }

    if (isEditing && !editingPayment?.id) {
      setError("Payment record was not found.");
      return;
    }

    setSaving(true);

    try {
      const paymentData = {
        academyId,
        amount: numericAmount,
        paymentMethod,
        transactionReference: reference || undefined,
        paymentDate: new Date(paymentDate).toISOString(),
        description: description.trim() || undefined,
        packageItemId,
      };

      if (isEditing && editingPayment?.id) {
        await updatePayment(editingPayment.id, paymentData);
      } else {
        await createPayment(paymentData);
      }

      onSaved();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save payment.",
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isEditing && pendingAmount !== undefined && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-700">
            Pending Amount
          </p>
          <p className="mt-1 text-lg font-semibold text-amber-900">
            INR {pendingAmount.toLocaleString("en-IN")}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Amount *
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            required
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setError("");
            }}
            className={inputClass}
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Payment Method *
          </label>
          <select
            value={paymentMethod}
            onChange={(event) => {
              setPaymentMethod(
                event.target.value as PaymentMethod,
              );
              setTransactionReference("");
              setError("");
            }}
            className={inputClass}
          >
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        {requiresReference(paymentMethod) && (
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {referenceLabel(paymentMethod)}
            </label>
            <input
              value={transactionReference}
              onChange={(event) => {
                setTransactionReference(
                  event.target.value.trimStart(),
                );
                setError("");
              }}
              required
              className={inputClass}
              placeholder={referencePlaceholder(paymentMethod)}
            />
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Payment Date & Time *
          </label>
          <input
            type="datetime-local"
            required
            value={paymentDate}
            onChange={(event) => {
              setPaymentDate(event.target.value);
              setError("");
            }}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            className={`${inputClass} min-h-24 resize-y`}
            placeholder="Optional payment note..."
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : isEditing
              ? "Update Payment"
              : "Record Payment"}
        </button>
      </div>
    </form>
  );
}
