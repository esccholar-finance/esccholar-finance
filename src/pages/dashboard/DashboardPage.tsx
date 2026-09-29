import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CreditCard,
  ReceiptText,
  TrendingUp,
  WalletCards,
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
    () =>
      db.transactions
        .orderBy("transactionDate")
        .reverse()
        .toArray(),
    [],
  );

  const academies = useLiveQuery(
    () => db.academies.toArray(),
    [],
  );

  const payments = useLiveQuery(
    () =>
      db.payments
        .orderBy("paymentDate")
        .reverse()
        .toArray(),
    [],
  );

  const income = (transactions ?? [])
    .filter((transaction) => transaction.type === "income")
    .reduce(
      (total, transaction) => total + transaction.amount,
      0,
    );

  const expense = (transactions ?? [])
    .filter((transaction) => transaction.type === "expense")
    .reduce(
      (total, transaction) => total + transaction.amount,
      0,
    );

  const profit = income - expense;

  const profitMargin =
    income > 0 ? (profit / income) * 100 : 0;

  const recentTransactions = (transactions ?? []).slice(0, 6);
  const recentPayments = (payments ?? []).slice(0, 5);

  const academyMap = new Map(
    (academies ?? []).map((academy) => [
      academy.id,
      academy.name,
    ]),
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-7 text-white sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <WalletCards size={23} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Finance Dashboard
                  </h1>

                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                    Live financial data
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  E-Sccholar financial overview and recent activity.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Profit Margin
              </p>

              <p
                className={`mt-1 text-xl font-bold ${
                  profit >= 0
                    ? "text-emerald-300"
                    : "text-red-300"
                }`}
              >
                {profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-b border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Income"
            value={formatCurrency(income)}
            icon={<ArrowUpRight size={19} />}
            iconClass="bg-emerald-100 text-emerald-700"
            valueClass="text-emerald-700"
          />

          <SummaryCard
            title="Total Expense"
            value={formatCurrency(expense)}
            icon={<ArrowDownRight size={19} />}
            iconClass="bg-red-100 text-red-700"
            valueClass="text-red-700"
          />

          <SummaryCard
            title="Net Profit"
            value={formatCurrency(profit)}
            icon={<TrendingUp size={19} />}
            iconClass={
              profit >= 0
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700"
            }
            valueClass={
              profit >= 0
                ? "text-blue-700"
                : "text-amber-700"
            }
          />

          <SummaryCard
            title="Total Academies"
            value={(academies ?? []).length.toLocaleString(
              "en-IN",
            )}
            icon={<Building2 size={19} />}
            iconClass="bg-purple-100 text-purple-700"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <ActivitySection
          title="Recent Transactions"
          description="Latest income and expense records."
          icon={<ReceiptText size={19} />}
          emptyText="No transactions recorded yet."
        >
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-4 p-4 transition hover:bg-slate-50/70"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    transaction.type === "income"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <ArrowUpRight size={17} />
                  ) : (
                    <ArrowDownRight size={17} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {transaction.description ||
                      (transaction.type === "income"
                        ? "Income Transaction"
                        : "Expense Transaction")}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {transaction.transactionNumber}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p
                  className={`text-sm font-bold ${
                    transaction.type === "income"
                      ? "text-emerald-600"
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
          ))}
        </ActivitySection>

        <ActivitySection
          title="Recent Academy Payments"
          description="Latest payments received from academies."
          icon={<CreditCard size={19} />}
          emptyText="No academy payments recorded yet."
        >
          {recentPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between gap-4 p-4 transition hover:bg-slate-50/70"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CreditCard size={17} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {academyMap.get(payment.academyId) ||
                      "Unknown Academy"}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs capitalize text-slate-500">
                    {payment.paymentMethod.replace(
                      "_",
                      " ",
                    )}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-emerald-600">
                  +{formatCurrency(payment.amount)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(payment.paymentDate)}
                </p>
              </div>
            </div>
          ))}
        </ActivitySection>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  iconClass,
  valueClass = "text-slate-900",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p
            className={`mt-2 text-xl font-bold ${valueClass}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActivitySection({
  title,
  description,
  icon,
  emptyText,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  emptyText: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {hasChildren ? (
        <div className="divide-y divide-slate-100">
          {children}
        </div>
      ) : (
        <EmptyState text={emptyText} />
      )}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <ReceiptText size={19} />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {text}
      </p>
    </div>
  );
}
