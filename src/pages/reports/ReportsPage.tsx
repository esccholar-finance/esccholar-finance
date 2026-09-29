import { lazy, Suspense, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  BarChart3,
  CalendarDays,
  Filter,
  RefreshCw,
} from "lucide-react";
import { db } from "../../db/database";
import { ExpenseAnalytics } from "../../components/reports/ExpenseAnalytics";
import { AcademyCollectionAnalytics } from "../../components/reports/AcademyCollectionAnalytics";
import {
  AcademyProfitability,
  type AcademyReportItem,
} from "../../components/reports/AcademyProfitability";
import {
  CategorySummary,
  type CategoryReportItem,
} from "../../components/reports/CategorySummary";
import { RecentTransactions } from "../../components/reports/RecentTransactions";
import { ReportSummaryCards } from "../../components/reports/ReportSummaryCards";
import { UpcomingPayments } from "../../components/reports/UpcomingPayments";

const IncomeExpenseChart = lazy(() =>
  import("../../components/reports/IncomeExpenseChart").then((module) => ({
    default: module.IncomeExpenseChart,
  })),
);

type DatePreset =
  | "today"
  | "week"
  | "month"
  | "3months"
  | "6months"
  | "year"
  | "1year"
  | "custom";

function formatCurrency(amount: number) {
  return `INR ${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getToday() {
  return formatDate(new Date());
}

function getMonthStart() {
  const date = new Date();
  date.setDate(1);
  return formatDate(date);
}

function getStartDate(monthsBack = 0) {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsBack);
  return formatDate(date);
}

function getWeekStart() {
  const date = new Date();
  const day = date.getDay();
  const difference = day === 0 ? 6 : day - 1;

  date.setDate(date.getDate() - difference);
  return formatDate(date);
}

function getYearStart() {
  const date = new Date();
  date.setMonth(0);
  date.setDate(1);
  return formatDate(date);
}

function isInRange(transactionDate: string, from: string, to: string) {
  const date = transactionDate.slice(0, 10);

  if (from && date < from) return false;
  if (to && date > to) return false;

  return true;
}

const presets: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "3months", label: "Last 3 Months" },
  { id: "6months", label: "Last 6 Months" },
  { id: "year", label: "This Year" },
  { id: "1year", label: "Last 1 Year" },
  { id: "custom", label: "Custom Range" },
];

export function ReportsPage() {
  const [fromDate, setFromDate] = useState(getStartDate(12));
  const [toDate, setToDate] = useState(getToday());
  const [activePreset, setActivePreset] = useState<DatePreset>("1year");

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

  const applyPreset = (preset: DatePreset) => {
    const today = getToday();

    setActivePreset(preset);

    switch (preset) {
      case "today":
        setFromDate(today);
        setToDate(today);
        break;

      case "week":
        setFromDate(getWeekStart());
        setToDate(today);
        break;

      case "month":
        setFromDate(getMonthStart());
        setToDate(today);
        break;

      case "3months":
        setFromDate(getStartDate(3));
        setToDate(today);
        break;

      case "6months":
        setFromDate(getStartDate(6));
        setToDate(today);
        break;

      case "year":
        setFromDate(getYearStart());
        setToDate(today);
        break;

      case "1year":
        setFromDate(getStartDate(12));
        setToDate(today);
        break;

      case "custom":
        break;
    }
  };

  const resetPeriod = () => {
    const today = getToday();
    setFromDate(getStartDate(12));
    setToDate(today);
    setActivePreset("1year");
  };

  const dateRangeLabel = `${fromDate || "Start"} → ${toDate || "Today"}`;
  const invalidRange = Boolean(fromDate && toDate && fromDate > toDate);

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <BarChart3 size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  E-Sccholar Finance
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Reports & Analytics
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                  Track income, expenses, academy collections and profitability
                  from one place.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Report Period
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {dateRangeLabel}
              </p>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live financial data
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Filter size={17} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Report Period
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Choose a preset or select a custom date range.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetPeriod}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <RefreshCw size={14} />
            Reset
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {presets.map((preset) => {
            const active = activePreset === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {activePreset === "custom" && (
          <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2">
            <DateField
              label="From Date"
              value={fromDate}
              onChange={(value) => {
                setFromDate(value);
                setActivePreset("custom");
              }}
            />

            <DateField
              label="To Date"
              value={toDate}
              onChange={(value) => {
                setToDate(value);
                setActivePreset("custom");
              }}
            />
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays size={16} className="text-slate-400" />

            <span>
              Showing{" "}
              <span className="font-bold text-slate-900">
                {summary.count.toLocaleString("en-IN")}
              </span>{" "}
              transactions
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Auto-updating
          </div>
        </div>

        {invalidRange && (
          <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            From Date cannot be later than To Date.
          </p>
        )}
      </section>

      <AcademyCollectionAnalytics fromDate={fromDate} toDate={toDate} />

      <ExpenseAnalytics fromDate={fromDate} toDate={toDate} />

      <ReportSummaryCards
        income={formatCurrency(summary.income)}
        expense={formatCurrency(summary.expense)}
        profit={formatCurrency(summary.profit)}
        count={summary.count.toLocaleString("en-IN")}
      />

      <Suspense
        fallback={
          <div className="flex h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">
            Loading analytics chart...
          </div>
        }
      >
        <IncomeExpenseChart transactions={filteredTransactions} />
      </Suspense>

      <div className="grid gap-6 xl:grid-cols-2">
        <CategorySummary items={categorySummary} />
        <AcademyProfitability items={academySummary} />
      </div>

      <UpcomingPayments />

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
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <CalendarDays
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pl-10 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>
  );
}
