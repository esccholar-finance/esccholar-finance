import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export interface CategoryReportItem {
  name: string;
  income: number;
  expense: number;
}

interface CategorySummaryProps {
  items: CategoryReportItem[];
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

function formatCurrency(amount: number) {
  return `INR ${Math.round(amount).toLocaleString("en-IN")}`;
}

export function CategorySummary({
  items,
}: CategorySummaryProps) {
  const expenseItems = items
    .filter((item) => item.expense > 0)
    .sort((a, b) => b.expense - a.expense);

  const totalExpense = expenseItems.reduce(
    (sum, item) => sum + item.expense,
    0,
  );

  const highestCategory = expenseItems[0];

  const chartData = expenseItems.map((item, index) => ({
    ...item,
    percentage:
      totalExpense > 0
        ? (item.expense / totalExpense) * 100
        : 0,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Category-wise Expense
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Expense distribution by category for the selected period.
          </p>
        </div>

        <div className="rounded-xl bg-red-50 px-4 py-3 text-right">
          <p className="text-xs font-medium text-red-500">
            Total Expense
          </p>

          <p className="mt-1 text-lg font-bold text-red-700">
            {formatCurrency(totalExpense)}
          </p>
        </div>
      </div>

      {expenseItems.length > 0 ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="expense"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={105}
                      paddingAngle={2}
                    >
                      {chartData.map((item) => (
                        <Cell
                          key={item.name}
                          fill={item.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(Number(value))
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              {chartData.map((item) => (
                <div key={item.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />

                      <span className="truncate text-sm font-semibold text-slate-700">
                        {item.name}
                      </span>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(item.expense)}
                      </span>

                      <span className="ml-2 text-xs font-semibold text-slate-500">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(
                          3,
                          item.percentage,
                        )}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Expense Categories
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {expenseItems.length}
              </p>
            </div>

            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-medium text-red-500">
                Highest Expense Category
              </p>

              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-red-700">
                  {highestCategory?.name ?? "—"}
                </p>

                <p className="shrink-0 text-sm font-bold text-red-700">
                  {formatCurrency(highestCategory?.expense ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
          <p className="text-sm font-medium text-slate-600">
            No expense data found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No expenses are available for the selected date range.
          </p>
        </div>
      )}
    </section>
  );
}
