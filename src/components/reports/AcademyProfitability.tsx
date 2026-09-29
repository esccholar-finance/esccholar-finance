import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Building2, TrendingDown, TrendingUp, Wallet } from "lucide-react";

export interface AcademyReportItem {
  id: number;
  name: string;
  income: number;
  expense: number;
  profit: number;
}

interface AcademyProfitabilityProps {
  items: AcademyReportItem[];
}

function formatCurrency(amount: number) {
  return `INR ${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatShortName(name: string) {
  if (name.length <= 16) return name;
  return `${name.slice(0, 16)}...`;
}

export function AcademyProfitability({
  items,
}: AcademyProfitabilityProps) {
  const totalIncome = items.reduce(
    (sum, academy) => sum + academy.income,
    0,
  );

  const totalExpense = items.reduce(
    (sum, academy) => sum + academy.expense,
    0,
  );

  const totalProfit = totalIncome - totalExpense;

  const profitPercent =
    totalIncome > 0
      ? (totalProfit / totalIncome) * 100
      : 0;

  const averageProfit =
    items.length > 0
      ? totalProfit / items.length
      : 0;

  const chartData = items.map((academy) => ({
    name: formatShortName(academy.name),
    income: academy.income,
    expense: academy.expense,
    profit: academy.profit,
  }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
              <Building2 size={18} className="text-purple-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Academy Profitability
              </h2>

              <p className="text-sm text-slate-500">
                Academy-wise income, expense and profit analysis.
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl px-4 py-2.5 ${
            totalProfit >= 0
              ? "bg-emerald-50"
              : "bg-red-50"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Profit Margin
          </p>

          <p
            className={`mt-0.5 text-lg font-bold ${
              totalProfit >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {profitPercent.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Academy Income"
          value={formatCurrency(totalIncome)}
          icon={<TrendingUp size={18} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <MetricCard
          label="Academy Expense"
          value={formatCurrency(totalExpense)}
          icon={<TrendingDown size={18} />}
          iconClass="bg-red-50 text-red-600"
        />

        <MetricCard
          label="Total Profit"
          value={formatCurrency(totalProfit)}
          icon={<Wallet size={18} />}
          iconClass={
            totalProfit >= 0
              ? "bg-purple-50 text-purple-600"
              : "bg-red-50 text-red-600"
          }
          valueClass={
            totalProfit >= 0
              ? "text-purple-700"
              : "text-red-600"
          }
        />

        <MetricCard
          label="Average Profit / Academy"
          value={formatCurrency(averageProfit)}
          icon={<Building2 size={18} />}
          iconClass="bg-blue-50 text-blue-600"
        />
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex h-64 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
          No academy transactions available for this period.
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Academy Income vs Expense vs Profit
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Comparison based on the selected report period.
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 45,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={65}
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(Number(value ?? 0))
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#16a34a"
                    radius={[5, 5, 0, 0]}
                  />

                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="#ef4444"
                    radius={[5, 5, 0, 0]}
                  />

                  <Bar
                    dataKey="profit"
                    name="Profit"
                    fill="#8b5cf6"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Academy
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Income
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Expense
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Profit
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Profit %
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((academy) => {
                    const academyProfitPercent =
                      academy.income > 0
                        ? (academy.profit / academy.income) * 100
                        : 0;

                    return (
                      <tr
                        key={academy.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                              <Building2
                                size={15}
                                className="text-slate-500"
                              />
                            </div>

                            <span className="max-w-[260px] truncate text-sm font-semibold text-slate-800">
                              {academy.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right text-sm font-medium text-emerald-600">
                          {formatCurrency(academy.income)}
                        </td>

                        <td className="px-4 py-3.5 text-right text-sm font-medium text-red-600">
                          {formatCurrency(academy.expense)}
                        </td>

                        <td
                          className={`px-4 py-3.5 text-right text-sm font-bold ${
                            academy.profit >= 0
                              ? "text-purple-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(academy.profit)}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              academyProfitPercent >= 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {academyProfitPercent.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon,
  iconClass,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <div className={`rounded-lg p-2 ${iconClass}`}>
          {icon}
        </div>
      </div>

      <p className={`mt-3 text-xl font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
