import { ArrowLeft, PenLine, Plus, ReceiptText, Trash2 } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { db } from "../../db/database";
import { useAcademyPayments } from "../../hooks/usePayments";
import { AcademyStatusBadge } from "../../components/academies/AcademyStatusBadge";
import { Modal } from "../../components/ui/Modal";
import { PaymentForm } from "../../components/academies/PaymentForm";
import PackageDetails from "../../components/academies/PackageDetails";
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

  const pendingAmount = Math.max(
    0,
    (academy?.packageAmount ?? 0) - collectedAmount,
  );

  async function handleDeletePayment(payment: Payment) {
    if (payment.id === undefined) return;

    const confirmed = window.confirm(
      `Delete payment of INR ${payment.amount.toLocaleString("en-IN")}? This will also remove its linked income transaction.`,
    );

    if (!confirmed) return;

    try {
      await deletePayment(payment.id);
    } catch (error) {
      console.error(error);
      window.alert("Unable to delete the payment. Please try again.");
    }
  }
  if (!academy) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Academy not found
          </h2>

          <button
            type="button"
            onClick={() => navigate("/academies")}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Back to Academies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate("/academies")}
            className="mt-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">
                {academy.name}
              </h1>

              <AcademyStatusBadge status={academy.status} />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {academy.ownerName || "No owner"}
              {academy.mobile ? ` | ${academy.mobile}` : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingPayment(null);
            setPaymentModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={17} />
          Record Payment
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Package Amount</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(academy.packageAmount)}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-700">Collected</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-800">
            {formatCurrency(collectedAmount)}
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm text-amber-700">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-amber-800">
            {formatCurrency(pendingAmount)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Academy Information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-slate-400">Owner</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {academy.ownerName || "No owner"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Mobile</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {academy.mobile || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Payment Plan</p>
            <p className="mt-1 text-sm font-medium capitalize text-slate-700">
              {academy.paymentPlan.replace("_", " ")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Start Date</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {formatDate(academy.startDate)}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Expiry Date</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {formatDate(academy.expiryDate)}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Registration Date</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {formatDateTime(academy.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <PackageDetails academyId={academyId} />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Payment History
          </h2>
        </div>

        {paymentsLoading ? (
          <div className="p-6 text-sm text-slate-500">
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No payments recorded
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Record the first payment for this academy.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
    <tr>
      <th className="px-6 py-3 font-medium">Amount</th>
      <th className="px-6 py-3 font-medium">Method</th>
      <th className="px-6 py-3 font-medium">Payment Date</th>
      <th className="px-6 py-3 font-medium">Transaction No.</th>
      <th className="px-6 py-3 font-medium">Actions</th>
    </tr>
  </thead>

  <tbody className="divide-y divide-slate-100">
    {payments.map((payment) => (
      <tr key={payment.id}>
        <td className="px-6 py-4 font-medium text-slate-900">
          {formatCurrency(payment.amount)}
        </td>

        <td className="px-6 py-4 text-slate-600">
          {formatPaymentMethod(payment.paymentMethod)}
        </td>

        <td className="px-6 py-4 text-slate-600">
          {formatDateTime(payment.paymentDate)}
        </td>

        <td className="px-6 py-4 font-medium text-slate-700">
          {payment.transactionNumber || "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â"}
        </td>

        <td className="px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/receipts/${payment.id}`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <ReceiptText size={14} />
              View Receipt
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingPayment(payment);
                setPaymentModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
            >
              <PenLine size={14} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => handleDeletePayment(payment)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
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
      </div>

      <Modal
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setEditingPayment(null);
        }}
        title={editingPayment ? "Edit Payment" : "Record Payment"}
      >
        <PaymentForm
          academyId={academyId}
          editingPayment={editingPayment}
          onCancel={() => {
            setPaymentModalOpen(false);
            setEditingPayment(null);
          }}
          onSaved={() => {
            setPaymentModalOpen(false);
            setEditingPayment(null);
          }}
        />
      </Modal>
    </div>
  );
}




