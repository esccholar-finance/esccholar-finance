import {
  Edit3,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import type { Category } from "../../types/finance";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onStatus: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryTable({
  categories,
  onEdit,
  onStatus,
  onDelete,
}: CategoryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Category
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Type
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Status
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">
                      {category.name}
                    </span>

                    {category.name === "Academy Payment" && (
                      <ShieldCheck
                        size={15}
                        className="text-blue-600"
                      />
                    )}
                  </div>

                  {category.description && (
                    <p className="mt-1 text-xs text-slate-400">
                      {category.description}
                    </p>
                  )}
                </td>

                <td className="px-5 py-4">
                  <TypeBadge type={category.type} />
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      category.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    {category.name !== "Academy Payment" && (
                      <>
                        <button
                          type="button"
                          title="Edit category"
                          onClick={() => onEdit(category)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Edit3 size={17} />
                        </button>

                        <button
                          type="button"
                          title={
                            category.isActive ? "Deactivate" : "Activate"
                          }
                          onClick={() => onStatus(category)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <XCircle size={17} />
                        </button>

                        <button
                          type="button"
                          title="Delete category"
                          onClick={() => onDelete(category)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: Category["type"] }) {
  const label =
    type === "income"
      ? "Income"
      : type === "expense"
        ? "Expense"
        : "Both";

  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      {label}
    </span>
  );
}
