import { useEffect, useState } from "react";
import type { Category, TransactionType } from "../../types/finance";
import {
  createCategory,
  updateCategory,
} from "../../services/categoryService";

interface CategoryFormProps {
  category?: Category | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function CategoryForm({
  category,
  onSaved,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType | "both">("expense");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(category?.name ?? "");
    setType(category?.type ?? "expense");
    setDescription(category?.description ?? "");
    setIsActive(category?.isActive ?? true);
    setError("");
  }, [category]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (category?.id !== undefined) {
        await updateCategory(category.id, {
          name: trimmedName,
          type,
          description: description.trim(),
          isActive,
        });
      } else {
        await createCategory({
          name: trimmedName,
          type,
          description: description.trim(),
          isActive,
        });
      }

      onSaved();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save category.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Category Name
        </label>

        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError("");
          }}
          placeholder="e.g. Hosting"
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          autoFocus
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Category Type
        </label>

        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value as TransactionType | "both")
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-400"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Description
        </label>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional description"
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          className="h-4 w-4 rounded"
        />

        <span className="text-sm font-medium text-slate-700">
          Active category
        </span>
      </label>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : category
              ? "Update Category"
              : "Create Category"}
        </button>
      </div>
    </form>
  );
}
