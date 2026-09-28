import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { db } from "../../db/database";
import {
  createTransaction,
  updateTransaction,
} from "../../services/transactionService";
import type {
  PaymentMethod,
  Transaction,
  TransactionType,
} from "../../types/finance";
import {
  TransactionFormFields,
} from "./TransactionFormFields";
import { TransactionFormFooter } from "./TransactionFormFooter";

interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  editingTransaction?: Transaction | null;
}

const initialForm = {
  type: "expense" as TransactionType,
  categoryId: "",
  academyId: "",
  amount: "",
  paymentMethod: "cash" as PaymentMethod,
  transactionDate: new Date().toISOString().slice(0, 16),
  description: "",
};

function toDateTimeLocal(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 16);
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export function TransactionFormModal({
  open,
  onClose,
  onSaved,
  editingTransaction,
}: TransactionFormModalProps) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = editingTransaction?.id !== undefined;

  const data = useLiveQuery(
    async () => {
      const [categories, academies] = await Promise.all([
        db.categories.toArray(),
        db.academies.toArray(),
      ]);

      return { categories, academies };
    },
    [],
  );

  const categories = data?.categories ?? [];
  const academies = data?.academies ?? [];

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingTransaction) {
      setForm({
        type: editingTransaction.type,
        categoryId: String(editingTransaction.categoryId),
        academyId: editingTransaction.academyId
          ? String(editingTransaction.academyId)
          : "",
        amount: String(editingTransaction.amount),
        paymentMethod: editingTransaction.paymentMethod ?? "cash",
        transactionDate: toDateTimeLocal(
          editingTransaction.transactionDate,
        ),
        description: editingTransaction.description ?? "",
      });
    } else {
      setForm({
        ...initialForm,
        transactionDate: new Date().toISOString().slice(0, 16),
      });
    }

    setError("");
  }, [open, editingTransaction]);

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => {
      if (field === "type") {
        return {
          ...current,
          type: value as TransactionType,
          categoryId: "",
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });

    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const amount = Number(form.amount);

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!form.transactionDate) {
      setError("Please select date and time.");
      return;
    }

    setSaving(true);

    try {
      const changes = {
        type: form.type,
        categoryId: Number(form.categoryId),
        academyId: form.academyId
          ? Number(form.academyId)
          : undefined,
        amount,
        paymentMethod: form.paymentMethod,
        description: form.description.trim() || undefined,
        transactionDate: new Date(
          form.transactionDate,
        ).toISOString(),
      };

      if (isEditing && editingTransaction.id !== undefined) {
        await updateTransaction(editingTransaction.id, changes);
      } else {
        await createTransaction(changes);
      }

      onSaved?.();
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save transaction.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return null;
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing
              ? "Update this E-Sccholar income or expense."
              : "Record an income or expense for E-Sccholar."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <TransactionFormFields
            form={form}
            categories={categories}
            academies={academies}
            inputClass={inputClass}
            updateField={updateField}
          />
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <TransactionFormFooter
            saving={saving}
            isEditing={isEditing}
            onClose={onClose}
          />        </form>
      </div>
    </div>
  );
}


