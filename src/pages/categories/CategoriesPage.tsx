import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FolderKanban,
  Plus,
  Tags,
  XCircle,
} from "lucide-react";
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
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-7 text-white sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <Tags size={23} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Categories
                  </h1>

                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                    {stats.total}{" "}
                    {stats.total === 1 ? "category" : "categories"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  Organize E-Sccholar income and expense transactions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>
        </div>

        <div className="grid gap-4 border-b border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <QuickStat
            label="Total Categories"
            value={String(stats.total)}
            icon={FolderKanban}
            iconClass="bg-slate-100 text-slate-700"
          />

          <QuickStat
            label="Active"
            value={String(stats.active)}
            icon={Tags}
            iconClass="bg-emerald-100 text-emerald-700"
            valueClass="text-emerald-700"
          />

          <QuickStat
            label="Income Categories"
            value={String(stats.income)}
            icon={ArrowUpRight}
            iconClass="bg-blue-100 text-blue-700"
            valueClass="text-blue-700"
          />

          <QuickStat
            label="Expense Categories"
            value={String(stats.expense)}
            icon={ArrowDownLeft}
            iconClass="bg-red-100 text-red-700"
            valueClass="text-red-700"
          />
        </div>
      </section>

      {message && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <XCircle size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>

          <button
            type="button"
            onClick={() => setMessage("")}
            className="shrink-0 rounded-md p-1 transition hover:bg-red-100"
            title="Dismiss"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      <CategorySummaryCards
        total={stats.total}
        active={stats.active}
        income={stats.income}
        expense={stats.expense}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Tags size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Category Filters
            </h2>
            <p className="text-xs text-slate-500">
              Search, filter by type and manage inactive categories.
            </p>
          </div>
        </div>

        <CategoryFilters
          search={search}
          typeFilter={typeFilter}
          showInactive={showInactive}
          onSearchChange={setSearch}
          onTypeChange={setTypeFilter}
          onShowInactiveChange={setShowInactive}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Category Directory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredCategories.length} matching{" "}
              {filteredCategories.length === 1 ? "category" : "categories"}
            </p>
          </div>

          <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            {showInactive ? "Including inactive" : "Active only"}
          </span>
        </div>

        <CategoryTable
          categories={filteredCategories}
          onEdit={openEditModal}
          onStatus={handleStatus}
          onDelete={handleDelete}
        />
      </section>

      <CategoryFormModal
        open={categoryModalOpen}
        category={editingCategory}
        onClose={closeModal}
      />
    </div>
  );
}

function QuickStat({
  label,
  value,
  icon: Icon,
  iconClass,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string;
  icon: typeof Tags;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className={`mt-2 text-xl font-bold ${valueClass}`}>
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}
