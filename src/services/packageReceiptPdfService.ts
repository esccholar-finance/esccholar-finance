import jsPDF from "jspdf";
import type { Academy, PackageItem, Payment } from "../types/finance";
import logo from "../assets/esccholar-logo.jpeg";

interface PackageReceiptData {
  academy: Academy;
  items: PackageItem[];
  payments: Payment[];
  subtotal: number;
  itemDiscount: number;
  packageDiscount: number;
  totalPackage: number;
  totalPaid: number;
  pendingAmount: number;
}

const NAVY: [number, number, number] = [15, 23, 42];
const BLUE: [number, number, number] = [37, 99, 235];
const GREEN: [number, number, number] = [5, 150, 105];
const AMBER: [number, number, number] = [217, 119, 6];
const BORDER: [number, number, number] = [226, 232, 240];
const MUTED: [number, number, number] = [100, 116, 139];
const WHITE: [number, number, number] = [255, 255, 255];
const SOFT: [number, number, number] = [248, 250, 252];

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

function safe(value?: string) {
  return value?.trim() || "-";
}

function font(
  doc: jsPDF,
  size: number,
  bold = false,
  color: [number, number, number] = NAVY,
) {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

function label(doc: jsPDF, value: string, x: number, y: number) {
  font(doc, 6.5, true, MUTED);
  doc.text(value.toUpperCase(), x, y);
}

function line(doc: jsPDF, y: number, width: number) {
  doc.setDrawColor(...BORDER);
  doc.line(16, y, width - 16, y);
}

function card(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: [number, number, number],
  border: [number, number, number] = BORDER,
) {
  doc.setFillColor(...fill);
  doc.setDrawColor(...border);
  doc.roundedRect(x, y, w, h, 3, 3, "FD");
}

export function downloadTotalPackageReceipt(
  data: PackageReceiptData,
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const fullyPaid = data.pendingAmount <= 0;
  const status = fullyPaid ? "PAID IN FULL" : "PARTIALLY PAID";
  const statusColor = fullyPaid ? GREEN : AMBER;

  const receiptNumber =
    `TPR-${data.academy.id ?? "NA"}-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}`;

  let y = 14;

  // ==========================================================
  // HEADER / BRANDING
  // ==========================================================

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 5, "F");

  doc.addImage(logo, "JPEG", margin, y, 22, 22);

  font(doc, 16, true, NAVY);
  doc.text("E-SCCHOLAR", margin + 27, y + 7);

  font(doc, 7, false, MUTED);
  doc.text(
    "ACADEMY MANAGEMENT SYSTEM",
    margin + 27,
    y + 13,
  );

  font(doc, 6.5, false, MUTED);
  doc.text(
    "Smarter Academy Management Starts Here",
    margin + 27,
    y + 19,
  );

  font(doc, 13, true, NAVY);
  doc.text(
    "TOTAL PACKAGE RECEIPT",
    pageWidth - margin,
    y + 7,
    { align: "right" },
  );

  font(doc, 6.5, false, MUTED);
  doc.text(
    `Receipt No. ${receiptNumber}`,
    pageWidth - margin,
    y + 14,
    { align: "right" },
  );

  card(
    doc,
    pageWidth - margin - 40,
    y + 18,
    40,
    8,
    fullyPaid ? [236, 253, 245] : [255, 247, 237],
    statusColor,
  );

  font(doc, 6, true, statusColor);
  doc.text(
    status,
    pageWidth - margin - 20,
    y + 23.2,
    { align: "center" },
  );

  y += 43;
  line(doc, y, pageWidth);
  y += 10;

  // ==========================================================
  // ACADEMY DETAILS
  // ==========================================================

  label(doc, "Customer / Academy", margin, y);
  y += 8;

  const half = contentWidth / 2;

  label(doc, "Academy Name", margin, y);
  font(doc, 9, true);
  doc.text(safe(data.academy.name), margin, y + 6);

  label(doc, "Owner / Contact Person", margin, y + 15);
  font(doc, 8, false);
  doc.text(safe(data.academy.ownerName), margin, y + 21);

  label(doc, "Mobile Number", margin + half, y);
  font(doc, 8, false);
  doc.text(
    safe(data.academy.mobile),
    margin + half,
    y + 6,
  );

  label(doc, "Receipt Generated", margin + half, y + 15);
  font(doc, 8, false);
  doc.text(
    dateTime(new Date().toISOString()),
    margin + half,
    y + 21,
  );

  y += 33;

  // ==========================================================
  // PACKAGE DETAILS
  // ==========================================================

  label(doc, "Package Details", margin, y);
  y += 7;

  const c1 = margin + 5;
  const c2 = 117;
  const c3 = 151;
  const c4 = pageWidth - margin - 5;

  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(
    margin,
    y,
    contentWidth,
    9,
    2,
    2,
    "FD",
  );

  font(doc, 6.5, true, BLUE);
  doc.text("SERVICE / PRODUCT", c1, y + 6);
  doc.text("AMOUNT", c2, y + 6, { align: "right" });
  doc.text("DISCOUNT", c3, y + 6, { align: "right" });
  doc.text("FINAL", c4, y + 6, { align: "right" });

  y += 14;

  for (const item of data.items) {
    const finalAmount = Math.max(
      0,
      item.amount - (item.discount || 0),
    );

    const nameLines = doc.splitTextToSize(
      safe(item.name),
      67,
    );

    const rowHeight = Math.max(
      14,
      nameLines.length * 4 + 7,
    );

    font(doc, 7.5, true);
    doc.text(nameLines, c1, y + 4);

    font(doc, 7, false);
    doc.text(
      money(item.amount),
      c2,
      y + 4,
      { align: "right" },
    );

    doc.text(
      money(item.discount || 0),
      c3,
      y + 4,
      { align: "right" },
    );

    font(doc, 7.5, true);
    doc.text(
      money(finalAmount),
      c4,
      y + 4,
      { align: "right" },
    );

    font(doc, 5.8, false, MUTED);
    doc.text(
      `Added: ${dateTime(item.createdAt)}`,
      c1,
      y + rowHeight - 2,
    );

    if (item.updatedAt !== item.createdAt) {
      doc.text(
        `Modified: ${dateTime(item.updatedAt)}`,
        c1 + 50,
        y + rowHeight - 2,
      );
    }

    line(doc, y + rowHeight, pageWidth);
    y += rowHeight + 2;
  }

  // ==========================================================
  // PACKAGE SUMMARY
  // ==========================================================

  y += 5;
  label(doc, "Package Summary", margin, y);
  y += 7;

  const gap = 5;
  const boxW = (contentWidth - gap) / 2;
  const boxH = 19;

  const summary = [
    ["SUBTOTAL", data.subtotal, margin],
    ["ITEM DISCOUNTS", data.itemDiscount, margin + boxW + gap],
    ["PACKAGE DISCOUNT", data.packageDiscount, margin],
    ["FINAL PACKAGE", data.totalPackage, margin + boxW + gap],
  ] as const;

  for (let i = 0; i < summary.length; i++) {
    const [title, amount, x] = summary[i];

    card(
      doc,
      x,
      y,
      boxW,
      boxH,
      SOFT,
    );

    label(doc, title, x + 5, y + 6);

    font(
      doc,
      8.5,
      true,
      title === "FINAL PACKAGE" ? NAVY : BLUE,
    );

    doc.text(
      money(amount),
      x + 5,
      y + 14,
    );
  }

  y += boxH + 5;

  // Paid / pending
  card(
    doc,
    margin,
    y,
    boxW,
    boxH,
    [236, 253, 245],
    GREEN,
  );

  label(doc, "Total Paid", margin + 5, y + 6);
  font(doc, 8.5, true, GREEN);
  doc.text(
    money(data.totalPaid),
    margin + 5,
    y + 14,
  );

  card(
    doc,
    margin + boxW + gap,
    y,
    boxW,
    boxH,
    fullyPaid ? [236, 253, 245] : [255, 247, 237],
    statusColor,
  );

  label(
    doc,
    "Pending Amount",
    margin + boxW + gap + 5,
    y + 6,
  );

  font(doc, 8.5, true, statusColor);
  doc.text(
    money(data.pendingAmount),
    margin + boxW + gap + 5,
    y + 14,
  );

  y += boxH + 8;

  // ==========================================================
  // CONFIRMATION
  // ==========================================================

  card(
    doc,
    margin,
    y,
    contentWidth,
    30,
    NAVY,
    NAVY,
  );

  font(doc, 7, true, [147, 197, 253]);
  doc.text(
    "PACKAGE CONFIRMATION",
    margin + 7,
    y + 8,
  );

  font(doc, 6.5, false, [203, 213, 225]);
  doc.text(
    "Final package amount",
    margin + 7,
    y + 16,
  );

  font(doc, 12, true, WHITE);
  doc.text(
    money(data.totalPackage),
    margin + 7,
    y + 24,
  );

  font(doc, 6.5, true, [147, 197, 253]);
  doc.text(
    "PACKAGE STATUS",
    pageWidth - margin - 7,
    y + 8,
    { align: "right" },
  );

  font(doc, 8, true, WHITE);
  doc.text(
    status,
    pageWidth - margin - 7,
    y + 16,
    { align: "right" },
  );

  font(doc, 6.5, false, [203, 213, 225]);
  doc.text(
    fullyPaid ? "Package fully paid" : "Amount pending",
    pageWidth - margin - 7,
    y + 24,
    { align: "right" },
  );

  y += 39;

  // ==========================================================
  // DISCLAIMER
  // ==========================================================

  font(doc, 6.5, false, MUTED);
  doc.text(
    "This receipt summarizes the services/products included in the academy package.",
    margin,
    y,
  );

  doc.text(
    "This document is a package payment summary/receipt and is not an invoice.",
    margin,
    y + 5,
  );

  // ==========================================================
  // FOOTER
  // ==========================================================

  doc.setFillColor(...NAVY);
  doc.rect(
    0,
    pageHeight - 18,
    pageWidth,
    18,
    "F",
  );

  font(doc, 8, true, WHITE);
  doc.text(
    "E-SCCHOLAR ACADEMY MANAGEMENT SYSTEM",
    margin,
    pageHeight - 10,
  );

  font(doc, 5.8, false, [203, 213, 225]);
  doc.text(
    "esccholar.in  |  @esccholar.in",
    margin,
    pageHeight - 5,
  );

  doc.text(
    "esccholar@gmail.com  |  9604038090 / 8698245050",
    pageWidth - margin,
    pageHeight - 7,
    { align: "right" },
  );

  const fileName =
    `${data.academy.name.replace(/[^a-z0-9]+/gi, "-")}` +
    `-Total-Package-Receipt.pdf`;

  doc.save(fileName);
}

