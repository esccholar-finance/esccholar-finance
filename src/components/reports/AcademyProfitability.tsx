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

export function AcademyProfitability({
  items,
}: AcademyProfitabilityProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Academy Profitability
        </h2>

        <p className="text-sm text-slate-500">
          Academy-linked income minus academy-linked expenses.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Academy
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                Income
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                Expense
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                Profit
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.map((academy) => (
              <tr key={academy.id} className="hover:bg-slate-50">
                <td className="px-3 py-3 text-sm font-medium text-slate-700">
                  {academy.name}
                </td>

                <td className="px-3 py-3 text-right text-sm text-emerald-600">
                  {formatCurrency(academy.income)}
                </td>

                <td className="px-3 py-3 text-right text-sm text-red-600">
                  {formatCurrency(academy.expense)}
                </td>

                <td className="px-3 py-3 text-right text-sm font-semibold text-slate-800">
                  {formatCurrency(academy.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">
            No academy-linked transactions found for this period.
          </div>
        )}
      </div>
    </section>
  );
}
