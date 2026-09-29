import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  CalendarClock,
  CheckCircle2,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { db } from "../../db/database";
import { Modal } from "../ui/Modal";
import {
  deleteUpcomingPayment,
  getUpcomingPayments,
  updateUpcomingPayment,
} from "../../services/upcomingPaymentService";
import type { UpcomingPayment } from "../../types/finance";
import { UpcomingPaymentForm } from "./UpcomingPaymentForm";
import {
  daysOverdue,
  dueStatus,
  formatDate,
  money,
} from "./UpcomingPaymentHelpers";

export function UpcomingPayments() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UpcomingPayment | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const payments = useLiveQuery(
    () => getUpcomingPayments(),
    [],
  ) ?? [];

  const academies = useLiveQuery(
    () => db.academies.toArray(),
    [],
  ) ?? [];

  const academyMap = useMemo(
    () =>
      new Map(
        academies.map((academy) => [academy.id, academy]),
      ),
    [academies],
  );

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...payments]
      .filter((payment) => {
        const academy = academyMap.get(payment.academyId);
        const academyName = academy?.name ?? "";

        const matchesSearch =
          !query ||
          academyName.toLowerCase().includes(query);

        const baseStatus = dueStatus(payment);
        const paid = payment.paidAmount ?? 0;

        const status =
          paid > 0 && paid < payment.amount
            ? "Partial"
            : baseStatus;

        const matchesStatus =
          statusFilter === "all" ||
          status === statusFilter;

        const matchesFrom =
          !fromDate || payment.dueDate >= fromDate;

        const matchesTo =
          !toDate || payment.dueDate <= toDate;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesFrom &&
          matchesTo
        );
      })
      .sort((a, b) =>
        a.dueDate.localeCompare(b.dueDate),
      );
  }, [
    payments,
    academyMap,
    search,
    statusFilter,
    fromDate,
    toDate,
  ]);

  const totalExpected = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const totalPaid = filteredPayments.reduce(
    (sum, payment) => sum + (payment.paidAmount ?? 0),
    0,
  );

  const totalPending = Math.max(
    totalExpected - totalPaid,
    0,
  );

  async function markCompleted(payment: UpcomingPayment) {
    if (payment.id === undefined) return;

    await updateUpcomingPayment(payment.id, {
      paidAmount: payment.amount,
    });
  }

  function sendWhatsApp(payment: UpcomingPayment) {
    const academy = academyMap.get(payment.academyId);
    const mobile = academy?.mobile?.replace(/\D/g, "");

    if (!mobile) {
      window.alert("Academy mobile number is not available.");
      return;
    }

    const whatsappNumber =
      mobile.length === 10 ? `91${mobile}` : mobile;

    const paid = payment.paidAmount ?? 0;
    const pending = Math.max(
      payment.amount - paid,
      0,
    );

    const message = [
      "E-SCCHOLAR ACADEMY MANAGEMENT SYSTEM",
      "",
      `Dear ${academy?.ownerName || academy?.name || "Academy"},`,
      "",
      "This is a reminder regarding your upcoming payment.",
      `Amount: ${money(payment.amount)}`,
      `Paid: ${money(paid)}`,
      `Pending: ${money(pending)}`,
      `Due Date: ${formatDate(payment.dueDate)}`,
      "",
      "Please complete the pending payment as per the due date.",
      "",
      "E-Sccholar",
      "esccholar.in",
    ].join("\n");

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function handleDelete(payment: UpcomingPayment) {
    if (payment.id === undefined) return;

    const academy = academyMap.get(payment.academyId);

    if (
      !window.confirm(
        `Delete upcoming payment of ${money(
          payment.amount,
        )} for ${academy?.name ?? "this academy"}?`,
      )
    ) {
      return;
    }

    await deleteUpcomingPayment(payment.id);
  }

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(payment: UpcomingPayment) {
    setEditing(payment);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <CalendarClock size={21} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">
                    Upcoming Payments
                  </h2>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {filteredPayments.length} records
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Track expected, partial, completed and overdue payments.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={17} />
              Add Upcoming Payment
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Search size={16} className="text-slate-500" />
              <p className="text-sm font-semibold text-slate-800">
                Payment Filters
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <FilterInput
                label="Search Academy"
                value={search}
                onChange={setSearch}
                placeholder="Search academy..."
              />

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">All Status</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Due">Due Today</option>
                  <option value="Partial">Partial</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <DateFilter
                label="From Date"
                value={fromDate}
                onChange={setFromDate}
              />

              <DateFilter
                label="To Date"
                value={toDate}
                onChange={setToDate}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Expected"
              value={money(totalExpected)}
              className="border-blue-100 bg-blue-50 text-blue-700"
            />

            <SummaryCard
              label="Paid"
              value={money(totalPaid)}
              className="border-emerald-100 bg-emerald-50 text-emerald-700"
            />

            <SummaryCard
              label="Pending"
              value={money(totalPending)}
              className="border-amber-100 bg-amber-50 text-amber-700"
            />
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <CalendarClock size={25} className="text-slate-500" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-800">
              No upcoming payments found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing the selected filters or add a new payment.
            </p>

            <button
              type="button"
              onClick={openAdd}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={16} />
              Add Upcoming Payment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5">Academy</th>
                  <th className="px-5 py-3.5">Expected</th>
                  <th className="px-5 py-3.5">Paid</th>
                  <th className="px-5 py-3.5">Pending</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment) => {
                  const academy = academyMap.get(payment.academyId);
                  const paid = payment.paidAmount ?? 0;
                  const pending = Math.max(
                    payment.amount - paid,
                    0,
                  );

                  const baseStatus = dueStatus(payment);

                  const status =
                    paid > 0 && paid < payment.amount
                      ? "Partial"
                      : baseStatus;

                  const overdueDays =
                    baseStatus === "Overdue"
                      ? daysOverdue(payment.dueDate)
                      : 0;

                  return (
                    <tr
                      key={payment.id}
                      className={`border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70 ${
                        status === "Completed"
                          ? "bg-emerald-50/30"
                          : status === "Partial"
                            ? "bg-amber-50/30"
                            : status === "Overdue"
                              ? "bg-red-50/40"
                              : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {academy?.name ?? "Unknown Academy"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Added{" "}
                          {new Date(
                            payment.createdAt,
                          ).toLocaleDateString("en-IN")}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {money(payment.amount)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-emerald-600">
                        {money(paid)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-amber-600">
                        {money(pending)}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {formatDate(payment.dueDate)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={status}
                          overdueDays={overdueDays}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          {status !== "Completed" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  sendWhatsApp(payment)
                                }
                                className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                                title="WhatsApp Reminder"
                              >
                                <MessageCircle size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  markCompleted(payment)
                                }
                                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                title="Mark Completed"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => openEdit(payment)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(payment)}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          editing
            ? "Edit Upcoming Payment"
            : "Add Upcoming Payment"
        }
      >
        <UpcomingPaymentForm
          academies={academies}
          payment={editing}
          onCancel={closeModal}
          onSaved={closeModal}
        />
      </Modal>
    </>
  );
}

function StatusBadge({
  status,
  overdueDays,
}: {
  status: string;
  overdueDays: number;
}) {
  const styles: Record<string, string> = {
    Completed: "bg-emerald-100 text-emerald-700",
    Partial: "bg-amber-100 text-amber-700",
    Upcoming: "bg-blue-100 text-blue-700",
    Due: "bg-indigo-100 text-indigo-700",
    Overdue: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
          styles[status] ?? "bg-slate-100 text-slate-600"
        }`}
      >
        {status === "Due" ? "Due Today" : status}
      </span>

      {status === "Overdue" && (
        <p className="mt-1 text-xs font-medium text-red-600">
          {overdueDays}{" "}
          {overdueDays === 1 ? "day" : "days"} overdue
        </p>
      )}
    </div>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

function DateFilter({
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
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}
