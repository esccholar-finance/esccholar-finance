interface CategorySummaryCardsProps {
  total: number;
  active: number;
  income: number;
  expense: number;
}

export function CategorySummaryCards({
  total,
  active,
  income,
  expense,
}: CategorySummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Categories" value={total} />
      <StatCard label="Active" value={active} />
      <StatCard label="Income" value={income} />
      <StatCard label="Expense" value={expense} />
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
