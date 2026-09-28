import {
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Transaction } from "../../types/finance";

export interface TransactionListItem extends Transaction {
  academyName: string;
  categoryName: string;
}

interface TransactionTableProps {
  transactions: TransactionListItem[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-4">Transaction</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Academy</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => {
              const isPaymentLinked =
                transaction.paymentId !== undefined;

              return (
                <tr
                  key={transaction.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {transaction.transactionNumber}
                    </p>

                    {transaction.description && (
                      <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                        {transaction.description}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        transaction.type === "income"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowDownLeft size={14} />
                      ) : (
                        <ArrowUpRight size={14} />
                      )}

                      {transaction.type}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {transaction.categoryName}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {transaction.academyName}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(transaction.amount)}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {new Date(
                      transaction.transactionDate,
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={isPaymentLinked}
                        onClick={() => onEdit(transaction)}
                        title={
                          isPaymentLinked
                            ? "Edit from Payments"
                            : "Edit transaction"
                        }
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        disabled={isPaymentLinked}
                        onClick={() => onDelete(transaction)}
                        title={
                          isPaymentLinked
                            ? "Delete from Payments"
                            : "Delete transaction"
                        }
                        className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {transactions.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
