import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { db } from "../../db/database";

interface ExpenseAnalyticsProps {
  fromDate: string;
  toDate: string;
}

function formatCurrency(amount: number) {
  return `INR ${Math.round(amount).toLocaleString("en-IN")}`;
}

function isInRange(dateValue: string, fromDate: string, toDate: string) {
  const date = dateValue.slice(0, 10);

  if (fromDate && date < fromDate) return false;
  if (toDate && date > toDate) return false;

  return true;
}

export function ExpenseAnalytics({
  fromDate,
  toDate,
}: ExpenseAnalyticsProps) {
  const transactions = useLiveQuery(
    () => db.transactions.toArray(),
    [],
  );

  const categories = useLiveQuery(
    () => db.categories.toArray(),
    [],
  );

  const categoryMap = useMemo(
    () =>
      new Map(
        (categories ?? []).map((category) => [
          category.id,
          category.name,
        ]),
      ),
    [categories],
  );

  const expenseData = useMemo(() => {
    const map = new Map<number, number>();

    for (const transaction of transactions ?? []) {
      if (transaction.type !== "expense") continue;

      if (
        !isInRange(
          transaction.transactionDate,
          fromDate,
          toDate,
        )
      ) {
        continue;
      }

      const current = map.get(transaction.categoryId) ?? 0;
      map.set(transaction.categoryId, current + transaction.amount);
    }

    const total = [...map.values()].reduce(
      (sum, amount) => sum + amount,
      0,
    );

    return [...map.entries()]
      .map(([categoryId, amount]) => ({
        categoryId,
        name: categoryMap.get(categoryId) ?? "Unknown Category",
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .map((item, index) => ({
        ...item,
        color: [
          "#ef4444",
          "#f97316",
          "#eab308",
          "#84cc16",
          "#14b8a6",
          "#06b6d4",
          "#3b82f6",
          "#8b5cf6",
          "#ec4899",
        ][index % 9],
      }));
  }, [
    transactions,
    categoryMap,
    fromDate,
    toDate,
  ]);

  const totalExpense = expenseData.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Expense Analytics
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Expense distribution for the selected report period.
        </p>
      </div>

      <div className="mb-6 rounded-xl bg-red-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
          Total Expense
        </p>

        <p className="mt-1 text-2xl font-bold text-red-600">
          {formatCurrency(totalExpense)}
        </p>
      </div>

      {expenseData.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
          No expense transactions in the selected period.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-center">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                  strokeWidth={2}
                >
                  {expenseData.map((item) => (
                    <Cell
                      key={item.categoryId}
                      fill={item.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(Number(value ?? 0))
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {expenseData.map((item) => (
              <div
                key={item.categoryId}
                className="rounded-xl border border-slate-100 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    <span className="text-sm font-medium text-slate-700">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(item.percentage, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-end">
                  <span className="text-xs font-medium text-slate-500">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
