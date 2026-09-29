import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowDownRight,
  ArrowUpRight,
  ReceiptText,
} from "lucide-react";
import { db } from "../../db/database";

function money(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function methodLabel(value?: string) {
  const labels: Record<string, string> = {
    cash: "Cash",
    upi: "UPI",
    bank_transfer: "Bank Transfer",
    card: "Card",
    other: "Other",
  };

  return value ? labels[value] ?? value : "—";
}

export function AcademyTransactions({
  academyId,
}: {
  academyId: number;
}) {
  const data =
    useLiveQuery(
      async () => {
        const [transactions, categories] =
          await Promise.all([
            db.transactions
              .where("academyId")
              .equals(academyId)
              .toArray(),
            db.categories.toArray(),
          ]);

        const categoryMap = new Map(
          categories.map((category) => [
            category.id,
            category.name,
          ]),
        );

        return transactions
          .sort(
            (a, b) =>
              new Date(b.transactionDate).getTime() -
              new Date(a.transactionDate).getTime(),
          )
          .map((transaction) => ({
            transaction,
            categoryName:
              categoryMap.get(transaction.categoryId) ??
              "Unknown Category",
          }));
      },
      [academyId],
    ) ?? [];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <ReceiptText size={19} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Academy Transactions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Income and expense transactions linked to this academy.
            </p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="p-10 text-center">
          <ReceiptText
            size={24}
            className="mx-auto text-slate-300"
          />
          <p className="mt-3 text-sm font-medium text-slate-600">
            No academy transactions found
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Linked income and expenses will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Type</th>
                <th className="px-6 py-3.5 font-semibold">Category</th>
                <th className="px-6 py-3.5 font-semibold">Description</th>
                <th className="px-6 py-3.5 font-semibold">Method</th>
                <th className="px-6 py-3.5 font-semibold">Date</th>
                <th className="px-6 py-3.5 text-right font-semibold">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {data.map(({ transaction, categoryName }) => {
                const income = transaction.type === "income";

                return (
                  <tr
                    key={transaction.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          income
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {income ? (
                          <ArrowUpRight size={13} />
                        ) : (
                          <ArrowDownRight size={13} />
                        )}
                        {income ? "Income" : "Expense"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                      {categoryName}
                    </td>

                    <td className="max-w-[220px] truncate px-6 py-4 text-slate-600">
                      {transaction.description || "—"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {methodLabel(transaction.paymentMethod)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {dateTime(transaction.transactionDate)}
                    </td>

                    <td
                      className={`whitespace-nowrap px-6 py-4 text-right font-bold ${
                        income
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {income ? "+" : "-"}
                      {money(transaction.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
