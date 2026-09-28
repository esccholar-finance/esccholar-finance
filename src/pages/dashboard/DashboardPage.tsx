import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { db } from "../../db/database";

function formatCurrency(amount: number) {
  return `INR ${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function DashboardPage() {
  const transactions = useLiveQuery(
    () => db.transactions.orderBy("transactionDate").reverse().toArray(),
    [],
  );

  const academies = useLiveQuery(() => db.academies.toArray(), []);
  const payments = useLiveQuery(
    () => db.payments.orderBy("paymentDate").reverse().toArray(),
    [],
  );

  const income = (transactions ?? [])
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expense = (transactions ?? [])
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const profit = income - expense;

  const recentTransactions = (transactions ?? []).slice(0, 6);
  const recentPayments = (payments ?? []).slice(0, 5);

  const academyMap = new Map(
    (academies ?? []).map((academy) => [academy.id, academy.name]),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Finance Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          E-Sccholar financial overview and recent activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Income"
          value={formatCurrency(income)}
          icon={<ArrowUpRight size={19} />}
          iconClass="bg-green-50 text-green-600"
        />

        <SummaryCard
          title="Total Expense"
          value={formatCurrency(expense)}
          icon={<ArrowDownRight size={19} />}
          iconClass="bg-red-50 text-red-600"
        />

        <SummaryCard
          title="Net Profit"
          value={formatCurrency(profit)}
          icon={<TrendingUp size={19} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Total Academies"
          value={(academies ?? []).length.toLocaleString("en-IN")}
          icon={<Building2 size={19} />}
          iconClass="bg-slate-100 text-slate-700"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-semibold text-slate-900">
              Recent Transactions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest income and expense records.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.length === 0 ? (
              <EmptyState text="No transactions recorded yet." />
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {transaction.description ||
                        (transaction.type === "income"
                          ? "Income Transaction"
                          : "Expense Transaction")}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.transactionNumber}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-semibold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(transaction.transactionDate)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-semibold text-slate-900">
              Recent Academy Payments
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest payments received from academies.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPayments.length === 0 ? (
              <EmptyState text="No academy payments recorded yet." />
            ) : (
              recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {academyMap.get(payment.academyId) ||
                        "Unknown Academy"}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <CreditCard size={13} />
                      {payment.paymentMethod.replace("_", " ")}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-green-600">
                      +{formatCurrency(payment.amount)}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(payment.paymentDate)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-lg p-2.5 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
