import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Transaction } from "../../types/finance";

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

function formatAmount(value: number) {
  return `INR ${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export function IncomeExpenseChart({
  transactions,
}: IncomeExpenseChartProps) {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const data = [
    { name: "Income", amount: income, fill: "#16a34a" },
    { name: "Expense", amount: expense, fill: "#dc2626" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Income vs Expense
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Financial comparison for the selected date range
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
            Income
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
            Expense
          </span>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 35, right: 20, left: 15, bottom: 5 }}
            barCategoryGap="35%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                `₹${Number(value).toLocaleString("en-IN")}`
              }
            />

            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              formatter={(value) => formatAmount(Number(value))}
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
              }}
            />

            <Bar
              dataKey="amount"
              radius={[10, 10, 0, 0]}
              maxBarSize={100}
            >
              <LabelList
                dataKey="amount"
                position="top"
                formatter={(value) => formatAmount(Number(value))}
                className="fill-slate-700 text-xs font-semibold"
              />

              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
