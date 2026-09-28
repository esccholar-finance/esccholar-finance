import { useLiveQuery } from "dexie-react-hooks";
import { Plus, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { db } from "../../db/database";
import { CategoryFormModal } from "../../components/categories/CategoryFormModal";
import {
  activateCategory,
  deactivateCategory,
  deleteCategory,
} from "../../services/categoryService";
import type { Category } from "../../types/finance";
import {
  CategoryFilters,
  type CategoryFilterType,
} from "../../components/categories/CategoryFilters";
import { CategorySummaryCards } from "../../components/categories/CategorySummaryCards";
import { CategoryTable } from "../../components/categories/CategoryTable";

export function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CategoryFilterType>("all");
  const [showInactive, setShowInactive] = useState(false);
  const [message, setMessage] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const categories = useLiveQuery(
    () => db.categories.orderBy("createdAt").reverse().toArray(),
    [],
  );

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (categories ?? []).filter((category) => {
      const matchesSearch =
        !query ||
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "all" || category.type === typeFilter;

      const matchesStatus = showInactive || category.isActive;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [categories, search, typeFilter, showInactive]);

  const stats = useMemo(() => {
    const list = categories ?? [];

    return {
      total: list.length,
      active: list.filter((item) => item.isActive).length,
      income: list.filter(
        (item) => item.type === "income" || item.type === "both",
      ).length,
      expense: list.filter(
        (item) => item.type === "expense" || item.type === "both",
      ).length,
    };
  }, [categories]);

  async function handleStatus(category: Category) {
    if (category.id === undefined) return;

    try {
      setMessage("");

      if (category.isActive) {
        await deactivateCategory(category.id);
      } else {
        await activateCategory(category.id);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update category.",
      );
    }
  }

  async function handleDelete(category: Category) {
    if (category.id === undefined) return;

    if (!window.confirm(`Delete "${category.name}"?`)) return;

    try {
      setMessage("");
      await deleteCategory(category.id);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete category.",
      );
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null);
    setMessage("");
    setCategoryModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setMessage("");
    setCategoryModalOpen(true);
  };

  const closeModal = () => {
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage income and expense categories for E-Sccholar finance.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {message && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage("")}>
            <XCircle size={18} />
          </button>
        </div>
      )}

      <CategorySummaryCards
        total={stats.total}
        active={stats.active}
        income={stats.income}
        expense={stats.expense}
      />

      <CategoryFilters
        search={search}
        typeFilter={typeFilter}
        showInactive={showInactive}
        onSearchChange={setSearch}
        onTypeChange={setTypeFilter}
        onShowInactiveChange={setShowInactive}
      />

      <CategoryTable
        categories={filteredCategories}
        onEdit={openEditModal}
        onStatus={handleStatus}
        onDelete={handleDelete}
      />

      <CategoryFormModal
        open={categoryModalOpen}
        category={editingCategory}
        onClose={closeModal}
      />
    </div>
  );
}

