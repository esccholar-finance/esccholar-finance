import { IndianRupee } from "lucide-react";

export interface CategoryReportItem {
  name: string;
  income: number;
  expense: number;
}

interface CategorySummaryProps {
  items: CategoryReportItem[];
}

function formatCurrency(amount: number) {
  return `INR ${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export function CategorySummary({ items }: CategorySummaryProps) {
  const maxValue = Math.max(
    1,
    ...items.map((item) => item.income + item.expense),
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Category Summary
          </h2>
          <p className="text-sm text-slate-500">
            Income and expenses by category.
          </p>
        </div>

        <IndianRupee size={20} className="text-slate-400" />
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const total = item.income + item.expense;
          const width = `${Math.max(
            6,
            Math.round((total / maxValue) * 100),
          )}%`;

          return (
            <div key={item.name}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium text-slate-700">
                  {item.name}
                </span>

                <span className="text-sm font-semibold text-slate-800">
                  {formatCurrency(total)}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-800"
                  style={{ width }}
                />
              </div>

              <div className="mt-1 flex gap-4 text-xs text-slate-500">
                <span>Income: {formatCurrency(item.income)}</span>
                <span>Expense: {formatCurrency(item.expense)}</span>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <EmptyState text="No category transactions found for this period." />
        )}
      </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-10 text-center text-sm text-slate-500">{text}</div>
  );
}
