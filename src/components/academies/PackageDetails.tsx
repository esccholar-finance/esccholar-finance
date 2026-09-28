import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  CreditCard,
  Download,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { db } from "../../db/database";
import { Modal } from "../../components/ui/Modal";
import { PaymentForm } from "./PaymentForm";
import {
  addPackageItem,
  deletePackageItem,
  getAcademyPackageItems,
  setAcademyPackageDiscount,
  updatePackageItem,
} from "../../services/packageItemService";
import type { PackageItem } from "../../types/finance";
import PackageItemForm from "./PackageItemForm";
import { downloadTotalPackageReceipt } from "../../services/packageReceiptPdfService";

interface PackageDetailsProps {
  academyId: number;
}

function money(value: number) {
  return `INR ${Math.round(value).toLocaleString("en-IN")}`;
}

function dateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PackageDetails({
  academyId,
}: PackageDetailsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] =
    useState<PackageItem | null>(null);
  const [discount, setDiscount] = useState("");
  const [discountSaving, setDiscountSaving] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentItem, setPaymentItem] =
    useState<PackageItem | null>(null);
  const [paymentPending, setPaymentPending] = useState(0);

  const items =
    useLiveQuery(
      () => getAcademyPackageItems(academyId),
      [academyId],
      [],
    ) ?? [];

  const payments =
    useLiveQuery(
      () =>
        db.payments
          .where("academyId")
          .equals(academyId)
          .toArray(),
      [academyId],
      [],
    ) ?? [];

  const academy = useLiveQuery(
    () => db.academies.get(academyId),
    [academyId],
  );

  const subtotal = items.reduce(
    (total, item) => total + item.amount,
    0,
  );

  const itemDiscount = items.reduce(
    (total, item) => total + (item.discount || 0),
    0,
  );

  const packageDiscount = academy?.packageDiscount ?? 0;

  const finalPackageAmount = Math.max(
    0,
    subtotal - itemDiscount - packageDiscount,
  );

  const totalPaid = payments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );

  const pending = Math.max(
    0,
    finalPackageAmount - totalPaid,
  );

  function getItemPaid(itemId: number) {
    return payments
      .filter((payment) => payment.packageItemId === itemId)
      .reduce((total, payment) => total + payment.amount, 0);
  }

  function getItemFinal(item: PackageItem) {
    return Math.max(0, item.amount - (item.discount || 0));
  }

  function getItemPending(item: PackageItem) {
    return Math.max(
      0,
      getItemFinal(item) - getItemPaid(item.id ?? 0),
    );
  }


  function handleDownloadTotalPackageReceipt() {
    if (!academy) {
      window.alert("Academy details are still loading.");
      return;
    }

    downloadTotalPackageReceipt({
      academy,
      items,
      payments,
      subtotal,
      itemDiscount,
      packageDiscount,
      totalPackage: finalPackageAmount,
      totalPaid,
      pendingAmount: pending,
    });
  }
  function openItemPayment(item: PackageItem) {
    const itemPending = getItemPending(item);

    if (!item.id || itemPending <= 0) {
      return;
    }

    setPaymentItem(item);
    setPaymentPending(itemPending);
    setPaymentOpen(true);
  }

  function openPackagePayment() {
    if (pending <= 0) {
      return;
    }

    setPaymentItem(null);
    setPaymentPending(pending);
    setPaymentOpen(true);
  }

  function closePayment() {
    setPaymentOpen(false);
    setPaymentItem(null);
    setPaymentPending(0);
  }

  async function handleAdd(data: {
    name: string;
    amount: number;
    discount: number;
  }) {
    await addPackageItem(academyId, data);
    setShowForm(false);
  }

  async function handleUpdate(data: {
    name: string;
    amount: number;
    discount: number;
  }) {
    if (!editingItem?.id) return;

    await updatePackageItem(editingItem.id, data);
    setEditingItem(null);
  }

  async function handleDelete(item: PackageItem) {
    if (!item.id) return;

    const confirmed = window.confirm(
      `Delete "${item.name}" from this package?`,
    );

    if (!confirmed) return;

    try {
      await deletePackageItem(item.id);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete package item.",
      );
    }
  }

  async function savePackageDiscount() {
    const numericDiscount = Number(discount);

    if (
      !Number.isFinite(numericDiscount) ||
      numericDiscount < 0
    ) {
      window.alert("Enter a valid package discount.");
      return;
    }

    const maximum = Math.max(
      0,
      subtotal - itemDiscount,
    );

    if (numericDiscount > maximum) {
      window.alert(
        `Package discount cannot exceed ${money(maximum)}.`,
      );
      return;
    }

    try {
      setDiscountSaving(true);
      await setAcademyPackageDiscount(
        academyId,
        numericDiscount,
      );
      setDiscount("");
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to save package discount.",
      );
    } finally {
      setDiscountSaving(false);
    }
  }

  return (
    <>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5">
              <Package size={20} className="text-slate-700" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Package / Services
              </h2>
              <p className="text-sm text-slate-500">
                Services and products included in this academy package.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={17} />
            Add Service / Product
          </button>
        </div>

        <div className="p-5">
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <Package
                size={30}
                className="mx-auto text-slate-400"
              />
              <p className="mt-3 font-medium text-slate-700">
                No services or products added
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add software, hardware, customization or other
                services for this academy.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">
                      Service / Product
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Amount
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Discount
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Final
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Paid
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Pending
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Added / Modified
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const paid = getItemPaid(item.id ?? 0);
                    const finalAmount = getItemFinal(item);
                    const itemPending = Math.max(
                      0,
                      finalAmount - paid,
                    );

                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">
                            {item.name}
                          </div>
                        </td>

                        <td className="px-4 py-4 font-medium text-slate-800">
                          {money(item.amount)}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {money(item.discount || 0)}
                        </td>

                        <td className="px-4 py-4 font-semibold text-slate-900">
                          {money(finalAmount)}
                        </td>

                        <td className="px-4 py-4 font-medium text-emerald-600">
                          {money(paid)}
                        </td>

                        <td className="px-4 py-4 font-semibold text-orange-600">
                          {money(itemPending)}
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-500">
                          {dateTime(item.createdAt)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={itemPending <= 0}
                              onClick={() =>
                                openItemPayment(item)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <CreditCard size={14} />
                              Add Payment
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditingItem(item)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(item)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                              Delete
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

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Subtotal
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {money(subtotal)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Item Discounts
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {money(itemDiscount)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Package Discount
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {money(packageDiscount)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs font-medium uppercase text-slate-300">
                Final Package
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                {money(finalPackageAmount)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-medium uppercase text-emerald-700">
                Total Paid
              </p>
              <p className="mt-1 text-xl font-bold text-emerald-700">
                {money(totalPaid)}
              </p>
            </div>

            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-xs font-medium uppercase text-orange-700">
                Pending
              </p>
              <p className="mt-1 text-xl font-bold text-orange-700">
                {money(pending)}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl border border-slate-200 p-4">
              <button
                type="button"
                disabled={pending <= 0}
                onClick={openPackagePayment}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CreditCard size={17} />
                Pay Total Package
              </button>

              <button
                type="button"
                disabled={items.length === 0}
                onClick={handleDownloadTotalPackageReceipt}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download size={17} />
                Download Total Package Receipt
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Overall Package Discount
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(event) =>
                    setDiscount(event.target.value)
                  }
                  placeholder={String(packageDiscount)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <button
                type="button"
                disabled={discountSaving}
                onClick={savePackageDiscount}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {discountSaving
                  ? "Saving..."
                  : "Save Discount"}
              </button>

              <button
                type="button"
                onClick={() => setDiscount("")}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <PackageItemForm
            onSave={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        )}

        {editingItem && (
          <PackageItemForm
            item={editingItem}
            onSave={handleUpdate}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </section>

      <Modal
        open={paymentOpen}
        onClose={closePayment}
        title={
          paymentItem
            ? `Payment â€” ${paymentItem.name}`
            : "Total Package Payment"
        }
      >
        <PaymentForm
          academyId={academyId}
          packageItemId={paymentItem?.id}
          pendingAmount={paymentPending}
          onCancel={closePayment}
          onSaved={closePayment}
        />
      </Modal>
    </>
  );
}






