import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface TransactionSummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
}

export function TransactionSummaryCards({
  totalIncome,
  totalExpense,
}: TransactionSummaryCardsProps) {
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard
        title="Total Income"
        value={formatCurrency(totalIncome)}
        valueClass="text-emerald-600"
        icon={<ArrowUpRight size={18} />}
        iconClass="bg-emerald-50 text-emerald-600"
      />

      <SummaryCard
        title="Total Expense"
        value={formatCurrency(totalExpense)}
        valueClass="text-red-600"
        icon={<ArrowDownRight size={18} />}
        iconClass="bg-red-50 text-red-600"
      />

      <SummaryCard
        title="Net Balance"
        value={formatCurrency(netBalance)}
        valueClass="text-slate-900"
        icon={<TrendingUp size={18} />}
        iconClass="bg-slate-100 text-slate-700"
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  valueClass,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  valueClass: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className={`mt-2 text-2xl font-bold ${valueClass}`}>
            {value}
          </p>
        </div>

        <div className={`rounded-lg p-2 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
