import { useMemo } from "react";
import { CheckCircle2, Clock3, IndianRupee, School } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/database";

interface AcademyCollectionAnalyticsProps {
  fromDate: string;
  toDate: string;
}

function formatCurrency(amount: number) {
  return `INR ${Math.round(amount).toLocaleString("en-IN")}`;
}

function isInRange(value: string, from: string, to: string) {
  const date = value.slice(0, 10);
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function AcademyCollectionAnalytics({
  fromDate,
  toDate,
}: AcademyCollectionAnalyticsProps) {
  const academies = useLiveQuery(() => db.academies.toArray(), []);
  const payments = useLiveQuery(() => db.payments.toArray(), []);

  const analytics = useMemo(() => {
    const periodPayments = (payments ?? []).filter((payment) =>
      isInRange(payment.paymentDate, fromDate, toDate),
    );

    const academyIds = new Set(
      periodPayments.map((payment) => payment.academyId),
    );

    const periodAcademies = (academies ?? []).filter(
      (academy) =>
        academy.id !== undefined && academyIds.has(academy.id),
    );

    const totalPackage = periodAcademies.reduce(
      (sum, academy) => sum + (academy.packageAmount || 0),
      0,
    );

    const totalCollected = periodPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    const totalPending = Math.max(totalPackage - totalCollected, 0);

    const collectionPercent =
      totalPackage > 0
        ? Math.min((totalCollected / totalPackage) * 100, 100)
        : 0;

    const pendingPercent =
      totalPackage > 0
        ? Math.min((totalPending / totalPackage) * 100, 100)
        : 0;

    return {
      totalPackage,
      totalCollected,
      totalPending,
      collectionPercent,
      pendingPercent,
      academyCount: periodAcademies.length,
    };
  }, [academies, payments, fromDate, toDate]);

  const chartData = [
    {
      name: "Collected",
      value: analytics.totalCollected,
      color: "#10b981",
    },
    {
      name: "Pending",
      value: analytics.totalPending,
      color: "#f59e0b",
    },
  ].filter((item) => item.value > 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
                <IndianRupee size={18} />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                Academy Payment Collection
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Collection performance for the selected report period.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live payment data
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Package Value"
          value={formatCurrency(analytics.totalPackage)}
          icon={<IndianRupee size={18} />}
          className="bg-indigo-100 text-indigo-700"
        />

        <MetricCard
          label="Collected"
          value={formatCurrency(analytics.totalCollected)}
          icon={<CheckCircle2 size={18} />}
          className="bg-emerald-100 text-emerald-700"
        />

        <MetricCard
          label="Pending"
          value={formatCurrency(analytics.totalPending)}
          icon={<Clock3 size={18} />}
          className="bg-amber-100 text-amber-700"
        />

        <MetricCard
          label="Academies"
          value={analytics.academyCount.toLocaleString("en-IN")}
          icon={<School size={18} />}
          className="bg-blue-100 text-blue-700"
        />
      </div>

      <div className="grid gap-6 border-t border-slate-100 p-5 lg:grid-cols-[300px_1fr] lg:items-center">
        <div className="relative h-64">
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={96}
                    paddingAngle={3}
                    strokeWidth={2}
                  >
                    {chartData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(Number(value ?? 0))
                    }
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">
                  {analytics.collectionPercent.toFixed(1)}%
                </span>

                <span className="text-xs font-medium text-slate-500">
                  Collected
                </span>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
              No collection data in this period.
            </div>
          )}
        </div>

        <div className="space-y-5">
          <ProgressRow
            label="Collection"
            amount={analytics.totalCollected}
            percentage={analytics.collectionPercent}
            className="bg-emerald-500"
          />

          <ProgressRow
            label="Pending"
            amount={analytics.totalPending}
            percentage={analytics.pendingPercent}
            className="bg-amber-500"
          />

          <div className="grid gap-3 pt-1 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Collection Rate
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-800">
                {analytics.collectionPercent.toFixed(1)}%
              </p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                Pending Rate
              </p>

              <p className="mt-1 text-xl font-bold text-amber-800">
                {analytics.pendingPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <div className={`rounded-lg p-2 ${className}`}>
          {icon}
        </div>
      </div>

      <p className="mt-3 truncate text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ProgressRow({
  label,
  amount,
  percentage,
  className,
}: {
  label: string;
  amount: number;
  percentage: number;
  className: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">
          {label}
        </span>

        <div className="text-right">
          <span className="text-sm font-bold text-slate-900">
            {formatCurrency(amount)}
          </span>

          <span className="ml-2 text-xs font-medium text-slate-500">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${className}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
