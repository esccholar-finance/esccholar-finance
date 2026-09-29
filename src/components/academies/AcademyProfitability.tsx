import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowDownRight,
  ArrowUpRight,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { db } from "../../db/database";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function AcademyProfitability({
  academyId,
  packageAmount,
  collectedAmount,
}: {
  academyId: number;
  packageAmount: number;
  collectedAmount: number;
}) {
  const transactions =
    useLiveQuery(
      () =>
        db.transactions
          .where("academyId")
          .equals(academyId)
          .toArray(),
      [academyId],
    ) ?? [];

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const profit = collectedAmount - expenses;
  const margin =
    collectedAmount > 0
      ? (profit / collectedAmount) * 100
      : 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <TrendingUp size={19} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Academy Profitability
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Financial performance based on collected payments and academy-linked expenses.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 bg-slate-50/70 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <ProfitCard
          label="Total Package Value"
          value={money(packageAmount)}
          icon={<IndianRupee size={18} />}
          iconClass="bg-slate-100 text-slate-700"
        />

        <ProfitCard
          label="Total Collected"
          value={money(collectedAmount)}
          icon={<ArrowUpRight size={18} />}
          iconClass="bg-emerald-100 text-emerald-700"
          valueClass="text-emerald-700"
        />

        <ProfitCard
          label="Academy Expenses"
          value={money(expenses)}
          icon={<ArrowDownRight size={18} />}
          iconClass="bg-red-100 text-red-700"
          valueClass="text-red-700"
        />

        <ProfitCard
          label="Net Profit"
          value={money(profit)}
          icon={<TrendingUp size={18} />}
          iconClass={
            profit >= 0
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700"
          }
          valueClass={
            profit >= 0
              ? "text-blue-700"
              : "text-amber-700"
          }
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-slate-500">
          Profit Margin
        </span>
        <span
          className={`text-sm font-bold ${
            profit >= 0
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {margin.toFixed(1)}%
        </span>
      </div>
    </section>
  );
}

function ProfitCard({
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className={`mt-2 text-lg font-bold ${valueClass}`}>
            {value}
          </p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
