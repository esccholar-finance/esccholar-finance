import { Search } from "lucide-react";
import type { TransactionType } from "../../types/finance";

export type TransactionFilter = "all" | TransactionType;

interface TransactionFiltersProps {
  search: string;
  filter: TransactionFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: TransactionFilter) => void;
}

export function TransactionFilters({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: TransactionFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search transaction, academy or category..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
          />
        </div>

        <select
          value={filter}
          onChange={(event) =>
            onFilterChange(event.target.value as TransactionFilter)
          }
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
        >
          <option value="all">All Transactions</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
    </div>
  );
}
