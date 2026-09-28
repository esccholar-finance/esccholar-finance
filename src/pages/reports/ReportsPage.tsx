import { lazy, Suspense, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { BarChart3, CalendarDays } from "lucide-react";
import { db } from "../../db/database";
import { AcademyProfitability, type AcademyReportItem } from "../../components/reports/AcademyProfitability";
import { CategorySummary, type CategoryReportItem } from "../../components/reports/CategorySummary";
const IncomeExpenseChart = lazy(() =>
  import("../../components/reports/IncomeExpenseChart").then((module) => ({
    default: module.IncomeExpenseChart,
  })),
);
import { RecentTransactions } from "../../components/reports/RecentTransactions";
import { ReportSummaryCards } from "../../components/reports/ReportSummaryCards";

function formatCurrency(amount: number) {
  return `INR ${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function getMonthStart() {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function isInRange(transactionDate: string, from: string, to: string) {
  const date = transactionDate.slice(0, 10);

  if (from && date < from) return false;
  if (to && date > to) return false;

  return true;
}

export function ReportsPage() {
  const [fromDate, setFromDate] = useState(getMonthStart());
  const [toDate, setToDate] = useState(getToday());

  const transactions = useLiveQuery(
    () => db.transactions.orderBy("transactionDate").reverse().toArray(),
    [],
  );

  const academies = useLiveQuery(() => db.academies.toArray(), []);
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  const academyMap = useMemo(
    () =>
      new Map(
        (academies ?? []).map((academy) => [academy.id, academy.name]),
      ),
    [academies],
  );

  const categoryMap = useMemo(
    () =>
      new Map(
        (categories ?? []).map((category) => [category.id, category.name]),
      ),
    [categories],
  );

  const filteredTransactions = useMemo(() => {
    return (transactions ?? []).filter((transaction) =>
      isInRange(transaction.transactionDate, fromDate, toDate),
    );
  }, [transactions, fromDate, toDate]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;

    for (const transaction of filteredTransactions) {
      if (transaction.type === "income") {
        income += transaction.amount;
      } else {
        expense += transaction.amount;
      }
    }

    return {
      income,
      expense,
      profit: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const categorySummary = useMemo<CategoryReportItem[]>(() => {
    const map = new Map<number, CategoryReportItem>();

    for (const transaction of filteredTransactions) {
      const existing = map.get(transaction.categoryId) ?? {
        name: categoryMap.get(transaction.categoryId) ?? "Unknown Category",
        income: 0,
        expense: 0,
      };

      if (transaction.type === "income") {
        existing.income += transaction.amount;
      } else {
        existing.expense += transaction.amount;
      }

      map.set(transaction.categoryId, existing);
    }

    return [...map.values()].sort(
      (a, b) => b.income + b.expense - (a.income + a.expense),
    );
  }, [filteredTransactions, categoryMap]);

  const academySummary = useMemo<AcademyReportItem[]>(() => {
    const map = new Map<number, AcademyReportItem>();

    for (const transaction of filteredTransactions) {
      if (transaction.academyId === undefined) continue;

      const existing = map.get(transaction.academyId) ?? {
        id: transaction.academyId,
        name: academyMap.get(transaction.academyId) ?? "Unknown Academy",
        income: 0,
        expense: 0,
        profit: 0,
      };

      if (transaction.type === "income") {
        existing.income += transaction.amount;
      } else {
        existing.expense += transaction.amount;
      }

      existing.profit = existing.income - existing.expense;
      map.set(transaction.academyId, existing);
    }

    return [...map.values()].sort((a, b) => b.profit - a.profit);
  }, [filteredTransactions, academyMap]);

  const resetToCurrentMonth = () => {
    setFromDate(getMonthStart());
    setToDate(getToday());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={22} className="text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">
              Reports & Analytics
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Track E-Sccholar income, expenses and academy profitability.
          </p>
        </div>

        <button
          type="button"
          onClick={resetToCurrentMonth}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <CalendarDays size={17} />
          Current Month
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DateField
            label="From Date"
            value={fromDate}
            onChange={setFromDate}
          />

          <DateField
            label="To Date"
            value={toDate}
            onChange={setToDate}
          />

          <div className="flex items-end">
            <div className="w-full rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold">{summary.count}</span>{" "}
              transactions
            </div>
          </div>
        </div>

        {fromDate && toDate && fromDate > toDate && (
          <p className="mt-3 text-sm text-red-600">
            From Date cannot be later than To Date.
          </p>
        )}
      </div>

      <ReportSummaryCards
        income={formatCurrency(summary.income)}
        expense={formatCurrency(summary.expense)}
        profit={formatCurrency(summary.profit)}
        count={summary.count.toLocaleString("en-IN")}
      />

      <Suspense
  fallback={
    <div className="flex h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
      Loading chart...
    </div>
  }
>
  <IncomeExpenseChart transactions={filteredTransactions} />
</Suspense>

      <div className="grid gap-6 xl:grid-cols-2">
        <CategorySummary items={categorySummary} />
        <AcademyProfitability items={academySummary} />
      </div>

      <RecentTransactions
        transactions={filteredTransactions}
        categoryMap={categoryMap}
        academyMap={academyMap}
      />
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
      />
    </div>
  );
}
