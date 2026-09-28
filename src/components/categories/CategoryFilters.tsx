import { Search } from "lucide-react";
import type { TransactionType } from "../../types/finance";

export type CategoryFilterType = "all" | TransactionType | "both";

interface CategoryFiltersProps {
  search: string;
  typeFilter: CategoryFilterType;
  showInactive: boolean;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: CategoryFilterType) => void;
  onShowInactiveChange: (value: boolean) => void;
}

export function CategoryFilters({
  search,
  typeFilter,
  showInactive,
  onSearchChange,
  onTypeChange,
  onShowInactiveChange,
}: CategoryFiltersProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) =>
            onTypeChange(event.target.value as CategoryFilterType)
          }
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="both">Both</option>
        </select>

        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(event) => onShowInactiveChange(event.target.checked)}
          />
          Show inactive
        </label>
      </div>
    </div>
  );
}
