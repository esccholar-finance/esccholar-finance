import {
  ArrowDownRight,
  ArrowUpRight,
  ReceiptText,
  TrendingUp,
} from "lucide-react";

interface ReportSummaryCardsProps {
  income: string;
  expense: string;
  profit: string;
  count: string;
}

export function ReportSummaryCards({
  income,
  expense,
  profit,
  count,
}: ReportSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Total Income"
        value={income}
        icon={<ArrowUpRight size={20} />}
        iconClass="bg-emerald-50 text-emerald-600"
      />

      <SummaryCard
        label="Total Expense"
        value={expense}
        icon={<ArrowDownRight size={20} />}
        iconClass="bg-red-50 text-red-600"
      />

      <SummaryCard
        label="Net Profit"
        value={profit}
        icon={<TrendingUp size={20} />}
        iconClass="bg-blue-50 text-blue-600"
      />

      <SummaryCard
        label="Transactions"
        value={count}
        icon={<ReceiptText size={20} />}
        iconClass="bg-slate-100 text-slate-600"
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
        </div>

        <span className={`rounded-lg p-2 ${iconClass}`}>{icon}</span>
      </div>
    </div>
  );
}
