import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/database";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface AcademyFinancialOverviewProps {
  academyId: number;
}

export function AcademyFinancialOverview({
  academyId,
}: AcademyFinancialOverviewProps) {
  const data = useLiveQuery(
    async () => {
      const transactions = await db.transactions
        .where("academyId")
        .equals(academyId)
        .toArray();

      const categories = await db.categories.toArray();

      const categoryMap = new Map(
        categories
          .filter((category) => category.id !== undefined)
          .map((category) => [category.id!, category]),
      );

      return transactions.map((transaction) => ({
        ...transaction,
        categoryName:
          categoryMap.get(transaction.categoryId)?.name ||
          "Uncategorized",
      }));
    },
    [academyId],
  );

  const transactions = data ?? [];

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const netProfit = totalIncome - totalExpense;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Financial Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Income, expenses and profitability for this academy.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-700">Total Income</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-800">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm text-red-700">Total Expenses</p>
          <p className="mt-2 text-2xl font-semibold text-red-800">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            netProfit >= 0
              ? "border-blue-100 bg-blue-50"
              : "border-amber-100 bg-amber-50"
          }`}
        >
          <p
            className={`text-sm ${
              netProfit >= 0 ? "text-blue-700" : "text-amber-700"
            }`}
          >
            Net Profit
          </p>
          <p
            className={`mt-2 text-2xl font-semibold ${
              netProfit >= 0 ? "text-blue-800" : "text-amber-800"
            }`}
          >
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-900">
            Financial Transactions
          </h3>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              No financial transactions yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Academy payments and academy-linked expenses will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions
              .sort(
                (a, b) =>
                  new Date(b.transactionDate).getTime() -
                  new Date(a.transactionDate).getTime(),
              )
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {transaction.categoryName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.transactionNumber || "—"}
                    </p>
                  </div>

                  <p
                    className={`whitespace-nowrap text-sm font-semibold ${
                      transaction.type === "income"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
