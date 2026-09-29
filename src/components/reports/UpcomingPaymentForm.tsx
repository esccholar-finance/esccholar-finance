import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Search } from "lucide-react";
import {
  createUpcomingPayment,
  updateUpcomingPayment,
} from "../../services/upcomingPaymentService";
import type { UpcomingPayment } from "../../types/finance";
import { todayString } from "./UpcomingPaymentHelpers";

export function UpcomingPaymentForm({
  academies,
  payment,
  onCancel,
  onSaved,
}: {
  academies: Array<{
    id?: number;
    name: string;
  }>;
  payment: UpcomingPayment | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [academyId, setAcademyId] =
    useState<number | undefined>(payment?.academyId);

  const [search, setSearch] = useState("");

  const [amount, setAmount] = useState(
    payment ? String(payment.amount) : "",
  );

  const [paidAmount, setPaidAmount] = useState(
    payment ? String(payment.paidAmount ?? 0) : "0",
  );

  const [dueDate, setDueDate] = useState(
    payment?.dueDate ?? todayString(),
  );

  const [note, setNote] = useState(payment?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredAcademies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return academies.slice(0, 8);
    }

    return academies
      .filter((academy) =>
        academy.name.toLowerCase().includes(query),
      )
      .slice(0, 8);
  }, [academies, search]);

  const selectedAcademy = academies.find(
    (academy) => academy.id === academyId,
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const expected = Number(amount);
    const paid = Number(paidAmount);

    if (
      !academyId ||
      expected <= 0 ||
      paid < 0 ||
      paid > expected ||
      !dueDate
    ) {
      setError(
        "Select an academy and enter a valid amount, paid amount and due date.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const data = {
        academyId,
        amount: expected,
        paidAmount: paid,
        dueDate,
        ...(note.trim() ? { note: note.trim() } : {}),
      };

      if (payment?.id !== undefined) {
        await updateUpcomingPayment(payment.id, data);
      } else {
        await createUpcomingPayment(data);
      }

      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save upcoming payment.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Search Academy
        </label>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search academy..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-slate-100 bg-white">
          {filteredAcademies.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500">
              No academy found.
            </p>
          ) : (
            filteredAcademies.map((academy) => (
              <button
                key={academy.id}
                type="button"
                onClick={() => setAcademyId(academy.id)}
                className={`block w-full border-b border-slate-50 px-3 py-2.5 text-left text-sm transition last:border-0 hover:bg-blue-50 ${
                  academy.id === academyId
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700"
                }`}
              >
                {academy.name}
              </button>
            ))
          )}
        </div>

        {selectedAcademy && (
          <p className="mt-2 text-xs font-medium text-blue-600">
            Selected: {selectedAcademy.name}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Expected Amount"
          type="number"
          value={amount}
          onChange={setAmount}
          placeholder="Enter expected amount"
        />

        <Field
          label="Paid Amount"
          type="number"
          value={paidAmount}
          onChange={setPaidAmount}
          placeholder="Enter paid amount"
        />

        <Field
          label="Payment Due Date"
          type="date"
          value={dueDate}
          onChange={setDueDate}
        />

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Pending Amount
          </p>

          <p className="mt-1.5 text-lg font-bold text-amber-600">
            INR{" "}
            {Math.max(
              Number(amount || 0) - Number(paidAmount || 0),
              0,
            ).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Note
        </label>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Optional payment note..."
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving || !academyId}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : payment
              ? "Update Payment"
              : "Add Payment"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        min={type === "number" ? "0" : undefined}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
