import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createCategory,
  updateCategory,
} from "../../services/categoryService";
import type { Category } from "../../types/finance";

interface CategoryFormModalProps {
  open: boolean;
  category?: Category | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function CategoryFormModal({
  open,
  category,
  onClose,
  onSaved,
}: CategoryFormModalProps) {
  const isEdit = Boolean(category?.id);

  const [name, setName] = useState("");
  const [type, setType] = useState<Category["type"]>("income");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(category?.name ?? "");
    setType(category?.type ?? "income");
    setDescription(category?.description ?? "");
    setIsActive(category?.isActive ?? true);
    setError("");
  }, [open, category]);

  if (!open) {
    return null;
  }

  const isSystemCategory = category?.name === "Academy Payment";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    if (isSystemCategory) {
      setError("Academy Payment is a system category.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (isEdit && category?.id !== undefined) {
        await updateCategory(category.id, {
          name: trimmedName,
          type,
          description: description.trim() || undefined,
          isActive,
        });
      } else {
        await createCategory({
          name: trimmedName,
          type,
          description: description.trim() || undefined,
          isActive: true,
        });
      }

      onSaved?.();
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit ? "Edit Category" : "Add Category"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Create a finance category for E-Sccholar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Category Name *
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Server / Hosting"
              disabled={isSystemCategory || saving}
              autoFocus
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Category Type *
            </label>
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as Category["type"])
              }
              disabled={isSystemCategory || saving}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 disabled:bg-slate-100"
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
              disabled={isSystemCategory || saving}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 disabled:bg-slate-100"
            />
          </div>

          {isEdit && !isSystemCategory && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={saving}
              />
              Active category
            </label>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || isSystemCategory}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
