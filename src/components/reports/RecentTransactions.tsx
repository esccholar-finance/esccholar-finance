import type { Transaction } from "../../types/finance";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categoryMap: Map<number | undefined, string>;
  academyMap: Map<number | undefined, string>;
}

function formatCurrency(amount: number) {
  return `INR ${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export function RecentTransactions({
  transactions,
  categoryMap,
  academyMap,
}: RecentTransactionsProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Transactions
        </h2>

        <p className="text-sm text-slate-500">
          Latest transactions inside the selected date range.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Transaction
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Category
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Academy
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                Amount
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.slice(0, 10).map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                categoryName={
                  categoryMap.get(transaction.categoryId) ?? "Unknown"
                }
                academyName={
                  transaction.academyId !== undefined
                    ? academyMap.get(transaction.academyId) ?? "Unknown"
                    : "Company Level"
                }
              />
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">
            No transactions found for the selected period.
          </div>
        )}
      </div>
    </section>
  );
}

function TransactionRow({
  transaction,
  categoryName,
  academyName,
}: {
  transaction: Transaction;
  categoryName: string;
  academyName: string;
}) {
  const date = new Date(transaction.transactionDate).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-800">
          {transaction.transactionNumber}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">{date}</p>
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">{categoryName}</td>

      <td className="px-5 py-4 text-sm text-slate-600">{academyName}</td>

      <td
        className={`px-5 py-4 text-right text-sm font-semibold ${
          transaction.type === "income"
            ? "text-emerald-600"
            : "text-red-600"
        }`}
      >
        {transaction.type === "income" ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </td>
    </tr>
  );
}
