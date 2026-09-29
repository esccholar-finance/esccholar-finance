import type { Transaction, PaymentMethod } from "../../types/finance";
import { ArrowDownLeft, ArrowUpRight, CreditCard } from "lucide-react";

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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPaymentMethod(method?: PaymentMethod) {
  const labels: Record<PaymentMethod, string> = {
    cash: "Cash",
    upi: "UPI",
    bank_transfer: "Bank Transfer",
    card: "Card",
    other: "Other",
  };

  return method ? labels[method] : "—";
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
  const isIncome = transaction.type === "income";

  return (
    <tr className="transition-colors hover:bg-slate-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isIncome
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isIncome ? (
              <ArrowDownLeft size={17} />
            ) : (
              <ArrowUpRight size={17} />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {transaction.transactionNumber}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {formatDate(transaction.transactionDate)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-700">
          {categoryName}
        </p>
        <p
          className={`mt-0.5 text-xs font-medium ${
            isIncome ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {isIncome ? "Income" : "Expense"}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="max-w-[220px] truncate text-sm text-slate-700">
          {academyName}
        </p>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CreditCard size={15} className="text-slate-400" />
          {formatPaymentMethod(transaction.paymentMethod)}
        </div>
      </td>

      <td className="px-5 py-4 text-right">
        <p
          className={`text-sm font-bold ${
            isIncome ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </p>
      </td>
    </tr>
  );
}

export function RecentTransactions({
  transactions,
  categoryMap,
  academyMap,
}: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 10);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Transactions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest financial transactions inside the selected date range.
          </p>
        </div>

        <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          Showing {recentTransactions.length} of {transactions.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Transaction
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Academy
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment Method
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {recentTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                categoryName={
                  categoryMap.get(transaction.categoryId) ?? "Unknown Category"
                }
                academyName={
                  transaction.academyId !== undefined
                    ? academyMap.get(transaction.academyId) ?? "Unknown Academy"
                    : "Company Level"
                }
              />
            ))}
          </tbody>
        </table>

        {recentTransactions.length === 0 && (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <CreditCard size={20} className="text-slate-400" />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-700">
              No transactions found
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Try changing the selected date range.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
