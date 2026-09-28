import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Printer,
  Send,
} from "lucide-react";
import { db } from "../../db/database";
import { ReceiptPdfPreview } from "./ReceiptPdfPreview";
import type { Academy, Payment } from "../../types/finance";
import { useAcademyPayments } from "../../hooks/usePayments";
import {
  createReceiptPdfBlob,
  downloadReceiptPdf,
  type ReceiptPdfData,
} from "../../services/receiptPdfService";
import logo from "../../assets/esccholar-logo.jpeg";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function paymentLabel(method: string) {
  const labels: Record<string, string> = {
    cash: "Cash",
    upi: "UPI",
    bank_transfer: "Bank Transfer",
    card: "Card",
    other: "Other",
  };

  return labels[method] || method;
}


function LoadingReceipt() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        <p className="text-sm font-medium text-slate-500">
          Loading receipt...
        </p>
      </div>
    </div>
  );
}

interface ReceiptContentProps {
  payment: Payment;
  academy: Academy;
}

function ReceiptContent({
  payment,
  academy,
}: ReceiptContentProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const payments = useAcademyPayments(academy.id!);

  const paidTillDate = payments.payments.reduce(
    (total, item) => total + item.amount,
    0,
  );

  const pendingAmount = Math.max(
    academy.packageAmount - paidTillDate,
    0,
  );

  const transactionNumber =
    payment.transactionNumber ||
    `payment-${payment.id}`;

  const paymentMethod = paymentLabel(
    payment.paymentMethod,
  );

  const transactionReference =
    payment.transactionReference?.trim() || "";

  const receiptData: ReceiptPdfData = useMemo(
    () => ({
      companyName:
        "E-SCCHOLAR ACADEMY MANAGEMENT SYSTEM",
      tagline:
        "Smarter Academy Management Starts Here",
      academyName: academy.name,
      ownerName:
        academy.ownerName || "Not available",
      mobile:
        academy.mobile || "Not available",
      receiptNumber: transactionNumber,
      paymentDate: formatDateTime(payment.paymentDate),
      receiptGenerated: formatDateTime(payment.createdAt),
      paymentMethod,
      transactionReference,
      description: payment.description?.trim() || "E-Sccholar Academy Management System",
      amount: payment.amount,
      packageAmount: academy.packageAmount,
      lastPayment: payment.amount,
      paidTillDate,
      pendingAmount,
      website: "esccholar.in",
      instagram: "@esccholar.in",
      email: "esccholar@gmail.com",
      contact: "9604038090 / 8698245050",
    }),
    [
      academy,
      payment,
      transactionNumber,
      paymentMethod,
      transactionReference,
      paidTillDate,
      pendingAmount,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    async function generatePreview() {
      try {
        const blob = await createReceiptPdfBlob(
          receiptData,
          logo,
        );

        if (cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (error) {
        console.error(
          "Receipt preview generation failed:",
          error,
        );
      }
    }

    generatePreview();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [receiptData]);

  async function handleDownload() {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      await downloadReceiptPdf(
        receiptData,
        logo,
        `E-Sccholar_Receipt_${transactionNumber}.pdf`,
      );
    } catch (error) {
      console.error(
        "Receipt PDF generation failed:",
        error,
      );

      alert(
        "PDF could not be generated. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  function handlePrint() {
    if (!previewUrl) {
      return;
    }

    const printWindow = window.open(
      previewUrl,
      "_blank",
      "noopener,noreferrer",
    );

    if (!printWindow) {
      alert("Please allow pop-ups to print the receipt.");
      return;
    }

    window.setTimeout(() => {
      printWindow.print();
    }, 1200);
  }

  function handleWhatsApp() {
    const mobile = academy.mobile?.replace(
      /\D/g,
      "",
    );

    if (!mobile) {
      alert("Academy mobile number is not available.");
      return;
    }

    const whatsappNumber =
      mobile.length === 10 ? `91${mobile}` : mobile;

    const message = [
  "E-SCCHOLAR ACADEMY MANAGEMENT SYSTEM",
  "",
  `Receipt No: ${transactionNumber}`,
  `Academy: ${academy.name}`,
  `Amount Received: INR ${payment.amount.toLocaleString("en-IN")}`,
  `Payment Method: ${paymentMethod}`,
  `Payment Date: ${formatDateTime(payment.paymentDate)}`,
  `Paid Till Date: INR ${paidTillDate.toLocaleString("en-IN")}`,
  `Pending Amount: INR ${pendingAmount.toLocaleString("en-IN")}`,
  "",
  "Website: esccholar.in",
  "Email: esccholar@gmail.com",
  "Contact: 9604038090 / 8698245050",
].join("\n");

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message,
      )}`,
      "_blank",
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/academies/${academy.id!}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Back to Academy
          </Link>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={!previewUrl}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-50"
            >
              <Printer size={17} />
              Print
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <Send size={17} />
              WhatsApp
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
            >
              <Download size={17} />
              {isDownloading
                ? "Generating..."
                : "Download PDF"}
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {previewUrl ? (
            <ReceiptPdfPreview pdfUrl={previewUrl} />
          ) : (
            <div className="flex min-h-[600px] items-center justify-center bg-white">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                <p className="text-sm font-medium text-slate-500">
                  Generating receipt preview...
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="mt-3 text-center text-xs text-slate-500">
          Preview uses the same PDF generator as Download PDF.
        </p>
      </div>
    </div>
  );
}

export function ReceiptPage() {
  const { paymentId } = useParams();

  const payment = useLiveQuery(
    () =>
      paymentId
        ? db.payments.get(Number(paymentId))
        : undefined,
    [paymentId],
  );

  const academy = useLiveQuery(
    () =>
      payment?.academyId
        ? db.academies.get(payment.academyId)
        : undefined,
    [payment?.academyId],
  );

  if (!payment || !academy) {
    return <LoadingReceipt />;
  }

  return (
    <ReceiptContent
      payment={payment}
      academy={academy}
    />
  );
}

