import { ArrowLeft, CalendarDays, CheckCircle2, CreditCard, IndianRupee, PenLine, Plus, ReceiptText, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { db } from "../../db/database";
import { useAcademyPayments } from "../../hooks/usePayments";
import { AcademyStatusBadge } from "../../components/academies/AcademyStatusBadge";
import { Modal } from "../../components/ui/Modal";
import { PaymentForm } from "../../components/academies/PaymentForm";
import PackageDetails from "../../components/academies/PackageDetails";
import { AcademyProfitability } from "../../components/academies/AcademyProfitability";
import { AcademyTransactions } from "../../components/academies/AcademyTransactions";
import { deletePayment } from "../../services/paymentService";
import type { Payment } from "../../types/finance";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPaymentMethod(value: Payment["paymentMethod"]) {
  const labels: Record<Payment["paymentMethod"], string> = {
    cash: "Cash",
    upi: "UPI",
    bank_transfer: "Bank Transfer",
    card: "Card",
    other: "Other",
  };
  return labels[value];
}

export function AcademyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const academyId = Number(id);

  const academy = useLiveQuery(
    () => (academyId ? db.academies.get(academyId) : undefined),
    [academyId],
  );

  const { payments, loading: paymentsLoading } =
    useAcademyPayments(academyId);

  const collectedAmount = payments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );

  const packageAmount = academy?.packageAmount ?? 0;
  const pendingAmount = Math.max(
    packageAmount - collectedAmount,
    0,
  );

  const collectionPercent =
    packageAmount > 0
      ? Math.min((collectedAmount / packageAmount) * 100, 100)
      : 0;

  const paymentCount = payments.length;

  const latestPayment = useMemo(
    () =>
      [...payments].sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() -
          new Date(a.paymentDate).getTime(),
      )[0],
    [payments],
  );

  async function handleDeletePayment(payment: Payment) {
    if (payment.id === undefined) return;

    if (
      !window.confirm(
        `Delete payment of INR ${payment.amount.toLocaleString(
          "en-IN",
        )}? This will also remove its linked income transaction.`,
      )
    ) {
      return;
    }

    try {
      await deletePayment(payment.id);
    } catch (error) {
      console.error(error);
      window.alert("Unable to delete the payment. Please try again.");
    }
  }

  function openAddPayment() {
    setEditingPayment(null);
    setPaymentModalOpen(true);
  }

  function openEditPayment(payment: Payment) {
    setEditingPayment(payment);
    setPaymentModalOpen(true);
  }

  function closePaymentModal() {
    setPaymentModalOpen(false);
    setEditingPayment(null);
  }

  if (!academy) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <ShieldCheck className="text-slate-500" size={26} />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Academy not found
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            The academy may have been removed or the link is invalid.
          </p>
          <button
            type="button"
            onClick={() => navigate("/academies")}
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Back to Academies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-7 text-white sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => navigate("/academies")}
                className="mt-1 rounded-xl border border-white/15 bg-white/10 p-2.5 text-white transition hover:bg-white/15"
                title="Back to Academies"
              >
                <ArrowLeft size={19} />
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {academy.name}
                  </h1>
                  <AcademyStatusBadge status={academy.status} />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound size={14} />
                    {academy.ownerName || "No owner"}
                  </span>
                  {academy.mobile && <span>{academy.mobile}</span>}
                  <span>
                    Registered {formatDate(academy.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddPayment}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              <Plus size={17} />
              Record Payment
            </button>
          </div>
        </div>

        <div className="grid gap-4 border-b border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Package Value"
            value={formatCurrency(packageAmount)}
            icon={IndianRupee}
            iconClass="bg-slate-100 text-slate-700"
          />
          <MetricCard
            label="Collected"
            value={formatCurrency(collectedAmount)}
            icon={CheckCircle2}
            iconClass="bg-emerald-100 text-emerald-700"
            valueClass="text-emerald-700"
          />
          <MetricCard
            label="Pending"
            value={formatCurrency(pendingAmount)}
            icon={CalendarDays}
            iconClass="bg-amber-100 text-amber-700"
            valueClass="text-amber-700"
          />
          <MetricCard
            label="Payments"
            value={String(paymentCount)}
            icon={CreditCard}
            iconClass="bg-purple-100 text-purple-700"
          />
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Collection Progress
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatCurrency(collectedAmount)} collected from{" "}
                {formatCurrency(packageAmount)}
              </p>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {collectionPercent.toFixed(0)}%
            </span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${collectionPercent}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-emerald-600">
              Collected {formatCurrency(collectedAmount)}
            </span>
            <span className="text-amber-600">
              Pending {formatCurrency(pendingAmount)}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Academy Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Basic academy and subscription details.
            </p>
          </div>

          <div className="hidden rounded-xl bg-slate-50 px-3 py-2 text-right sm:block">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Latest Payment
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-700">
              {latestPayment
                ? formatDate(latestPayment.paymentDate)
                : "No payment yet"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Owner" value={academy.ownerName || "No owner"} />
          <InfoItem label="Mobile" value={academy.mobile || "Not available"} />
          <InfoItem
            label="Payment Plan"
            value={academy.paymentPlan.replace("_", " ")}
            capitalize
          />
          <InfoItem label="Start Date" value={formatDate(academy.startDate)} />
          <InfoItem label="Expiry Date" value={formatDate(academy.expiryDate)} />
          <InfoItem
            label="Registration Date"
            value={formatDateTime(academy.createdAt)}
          />
        </div>
      </section>

      <PackageDetails academyId={academyId} />

      <AcademyProfitability
        academyId={academyId}
        packageAmount={packageAmount}
        collectedAmount={collectedAmount}
      />

      <AcademyTransactions academyId={academyId} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Payment History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              All recorded payments and their linked transactions.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            {paymentCount} {paymentCount === 1 ? "payment" : "payments"}
          </div>
        </div>

        {paymentsLoading ? (
          <div className="flex items-center justify-center p-10">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <CreditCard size={24} className="text-slate-500" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-800">
              No payments recorded
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Record the first payment for this academy.
            </p>
            <button
              type="button"
              onClick={openAddPayment}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={16} />
              Record Payment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Amount</th>
                  <th className="px-6 py-3.5 font-semibold">Method</th>
                  <th className="px-6 py-3.5 font-semibold">Payment Date</th>
                  <th className="px-6 py-3.5 font-semibold">Transaction No.</th>
                  <th className="px-6 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {formatPaymentMethod(payment.paymentMethod)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {formatDateTime(payment.paymentDate)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                      {payment.transactionNumber || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/receipts/${payment.id}`)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <ReceiptText size={14} />
                          View Receipt
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditPayment(payment)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                        >
                          <PenLine size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePayment(payment)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={paymentModalOpen}
        onClose={closePaymentModal}
        title={editingPayment ? "Edit Payment" : "Record Payment"}
      >
        <PaymentForm
          academyId={academyId}
          editingPayment={editingPayment}
          onCancel={closePaymentModal}
          onSaved={closePaymentModal}
        />
      </Modal>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  iconClass,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string;
  icon: typeof IndianRupee;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className={`mt-2 text-xl font-bold ${valueClass}`}>
            {value}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1.5 text-sm font-semibold text-slate-800 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
