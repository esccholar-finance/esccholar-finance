import { Clock3 } from "lucide-react";
import { UpcomingPayments } from "../../components/reports/UpcomingPayments";

export function UpcomingPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Clock3 size={22} className="text-slate-700" />

          <h1 className="text-2xl font-bold text-slate-900">
            Upcoming Payments
          </h1>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Manage expected academy payments, due dates and overdue payments.
        </p>
      </div>

      <UpcomingPayments />
    </div>
  );
}
