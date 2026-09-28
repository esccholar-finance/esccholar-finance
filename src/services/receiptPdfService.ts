import { jsPDF } from "jspdf";

import {
  COLORS,
  drawInstagramIcon,
  drawMailIcon,
  drawPhoneIcon,
  drawWebsiteIcon,
  field,
  imageToDataUrl,
  money,
  roundedBox,
  sectionTitle,
  setFill,
  text,
  textRight,
} from "./receiptPdfHelpers";

export interface ReceiptPdfData {
  companyName: string;
  tagline: string;
  academyName: string;
  ownerName: string;
  mobile: string;
  receiptNumber: string;
  paymentDate: string;
  receiptGenerated: string;
  paymentMethod: string;
  transactionReference: string;
  description: string;
  amount: number;
  packageAmount: number;
  lastPayment: number;
  paidTillDate: number;
  pendingAmount: number;
  website: string;
  instagram: string;
  email: string;
  contact: string;
}

const W = 210;
const M = 15;
const CW = W - M * 2;

function status(data: ReceiptPdfData) {
  return data.pendingAmount > 0
    ? {
        label: "PARTIALLY PAID",
        fill: COLORS.blueSoft,
        color: COLORS.blue,
      }
    : {
        label: "PAID",
        fill: [239, 246, 255],
        color: COLORS.blue,
      };
}

function header(
  doc: jsPDF,
  data: ReceiptPdfData,
  logo: string,
) {
  const s = status(data);

  roundedBox(doc, M, 12, CW, 42, COLORS.white, COLORS.border, 4);

  doc.setFillColor(...COLORS.blue);
  doc.roundedRect(M, 12, 3, 42, 1.5, 1.5, "F");

  try {
    doc.addImage(logo, "JPEG", 21, 18.5, 24, 24, undefined, "FAST");
  } catch {
    doc.setFillColor(...COLORS.blueSoft);
    doc.circle(33, 30.5, 11, "F");
    text(doc, "E", 29.5, 34.5, 12, true, COLORS.blue);
  }

  text(doc, "E-SCCHOLAR", 49, 27, 19, true, COLORS.navy);
  text(
    doc,
    "ACADEMY MANAGEMENT SYSTEM",
    49,
    34,
    8,
    true,
    COLORS.blue,
  );
  text(doc, data.tagline, 49, 40, 7.5, false, COLORS.muted);

  textRight(
    doc,
    "PAYMENT RECEIPT",
    193,
    23,
    10.5,
    true,
    COLORS.navy,
  );

  textRight(
    doc,
    `Receipt No. ${data.receiptNumber}`,
    193,
    30,
    7.5,
    false,
    COLORS.muted,
  );

  doc.setFillColor(s.fill[0], s.fill[1], s.fill[2]);
  doc.roundedRect(151, 35, 42, 10, 3, 3, "F");

  textRight(
    doc,
    s.label,
    188.5,
    41.5,
    7.2,
    true,
    s.color,
  );
}

function customer(doc: jsPDF, data: ReceiptPdfData) {
  sectionTitle(doc, "Customer / Academy", M, 62);

  roundedBox(
    doc,
    M,
    68,
    CW,
    32,
    COLORS.surface,
    COLORS.border,
    3,
  );

  field(doc, "Academy Name", data.academyName, 21, 77, 75);
  field(doc, "Owner / Contact Person", data.ownerName, 21, 89, 75);
  field(doc, "Mobile Number", data.mobile, 118, 77, 72);
  field(doc, "Receipt Generated", data.receiptGenerated, 118, 89, 72);
}

function payment(doc: jsPDF, data: ReceiptPdfData) {
  sectionTitle(doc, "Payment Details", M, 105);

  roundedBox(
    doc,
    M,
    111,
    CW,
    39,
    COLORS.white,
    COLORS.border,
    3,
  );

  field(doc, "Payment Date & Time", data.paymentDate, 21, 120, 75);
  field(doc, "Payment Method", data.paymentMethod, 118, 120, 72);
  field(doc, "Receipt Number", data.receiptNumber, 21, 133, 75);

  const ref = data.transactionReference?.trim();

  field(
    doc,
    ref ? "Transaction ID / UTR" : "Payment Purpose",
    ref || data.description || "Academy Package Payment",
    118,
    133,
    72,
  );
}

function amount(doc: jsPDF, data: ReceiptPdfData) {
  const y = 156;
  const h = 34;

  setFill(doc, COLORS.navy);
  doc.roundedRect(M, y, CW, h, 4, 4, "F");

  text(
    doc,
    "AMOUNT RECEIVED",
    M + 7,
    y + 9,
    7.2,
    true,
    [147, 197, 253],
  );

  text(
    doc,
    money(data.amount),
    M + 7,
    y + 21,
    17,
    true,
    COLORS.white,
  );

  text(
    doc,
    "Payment successfully recorded",
    M + 7,
    y + 28,
    6.8,
    false,
    [203, 213, 225],
  );

  textRight(
    doc,
    "PAYMENT STATUS",
    W - M - 7,
    y + 9,
    7.2,
    true,
    [147, 197, 253],
  );

  const statusLabel =
    data.pendingAmount > 0 ? "PARTIALLY PAID" : "PAID";

  textRight(
    doc,
    statusLabel,
    W - M - 7,
    y + 18,
    9,
    true,
    COLORS.white,
  );

  textRight(
    doc,
    "E-SCCHOLAR FINANCE MANAGEMENT",
    W - M - 7,
    y + 27,
    6.3,
    false,
    [203, 213, 225],
  );
}

function summary(doc: jsPDF, data: ReceiptPdfData) {
  sectionTitle(doc, "Payment Summary", M, 197);

  const gap = 5;
  const cardW = (CW - gap) / 2;
  const cardH = 23;

  const items = [
    {
      label: "PACKAGE AMOUNT",
      value: money(data.packageAmount),
      color: COLORS.navy,
      border: COLORS.border,
      fill: COLORS.white,
      x: M,
      y: 202,
    },
    {
      label: "LAST PAYMENT",
      value: money(data.lastPayment),
      color: COLORS.blue,
      border: [191, 219, 254],
      fill: [248, 250, 255],
      x: M + cardW + gap,
      y: 202,
    },
    {
      label: "PAID TILL DATE",
      value: money(data.paidTillDate),
      color: COLORS.blue,
      border: [191, 219, 254],
      fill: [248, 250, 255],
      x: M,
      y: 230,
    },
    {
      label: "PENDING AMOUNT",
      value: money(data.pendingAmount),
      color: COLORS.red,
      border: [252, 165, 165],
      fill: [255, 247, 247],
      x: M + cardW + gap,
      y: 230,
    },
  ] as const;

  items.forEach((item) => {
    const isPending = item.label === "PENDING AMOUNT";

    roundedBox(
      doc,
      item.x,
      item.y,
      cardW,
      cardH,
      [...item.fill] as [number, number, number],
      [...item.border] as [number, number, number],
      4,
    );

    text(
      doc,
      item.label,
      item.x + 8,
      item.y + 8,
      6.8,
      true,
      COLORS.muted,
    );

    text(
      doc,
      item.value,
      item.x + 8,
      item.y + 18,
      12.5,
      true,
      item.color,
    );

    if (isPending) {
      doc.setFillColor(
        COLORS.red[0],
        COLORS.red[1],
        COLORS.red[2],
      );

      doc.roundedRect(
        item.x + cardW - 29,
        item.y + 5.5,
        21,
        6,
        3,
        3,
        "F",
      );

      text(
        doc,
        "DUE",
        item.x + cardW - 23.5,
        item.y + 9.7,
        5.3,
        true,
        COLORS.white,
      );
    }
  });
}

function confirmation(doc: jsPDF) {
  roundedBox(
    doc,
    M,
    255,
    CW,
    16,
    COLORS.white,
    [191, 219, 254],
    4,
  );

  setFill(doc, COLORS.blue);

  doc.roundedRect(
    M,
    255,
    2.5,
    16,
    1.2,
    1.2,
    "F",
  );

  text(
    doc,
    "PAYMENT CONFIRMATION",
    22,
    261.5,
    6.6,
    true,
    COLORS.blue,
  );

  text(
    doc,
    "Payment recorded successfully in the E-Sccholar Finance Management System.",
    22,
    267,
    6.3,
    false,
    COLORS.text,
  );

  text(
    doc,
    "Thank you for choosing E-Sccholar.",
    22,
    270.5,
    5.8,
    false,
    COLORS.muted,
  );
}

function footer(doc: jsPDF, data: ReceiptPdfData) {
  const y = 273;
  const h = 20;

  setFill(doc, COLORS.navy);

  doc.roundedRect(
    M,
    y,
    CW,
    h,
    4,
    4,
    "F",
  );

  // Brand
  text(
    doc,
    "E-SCCHOLAR",
    21,
    y + 7,
    7.4,
    true,
    COLORS.white,
  );

  text(
    doc,
    "Smarter Academy Management Starts Here",
    21,
    y + 12.5,
    5.5,
    false,
    [203, 213, 225],
  );

  // Website
  drawWebsiteIcon(
    doc,
    80,
    y + 5.2,
    [147, 197, 253],
  );

  text(
    doc,
    data.website,
    86,
    y + 7,
    5.8,
    false,
    COLORS.white,
  );

  doc.link(
    84,
    y + 2,
    32,
    7,
    {
      url: "https://esccholar.in",
    },
  );

  // Instagram
  drawInstagramIcon(
    doc,
    127,
    y + 5.2,
    [244, 114, 182],
  );

  text(
    doc,
    data.instagram,
    133,
    y + 7,
    5.8,
    false,
    COLORS.white,
  );

  doc.link(
    131,
    y + 2,
    38,
    7,
    {
      url: "https://instagram.com/esccholar.in",
    },
  );

  // Email
  drawMailIcon(
    doc,
    80,
    y + 14.5,
    [248, 113, 113],
  );

  text(
    doc,
    data.email,
    86,
    y + 16.3,
    5.4,
    false,
    COLORS.white,
  );

  doc.link(
    84,
    y + 11,
    42,
    7,
    {
      url: `mailto:${data.email}`,
    },
  );

  // Mobile
  drawPhoneIcon(
    doc,
    127,
    y + 14.5,
    [134, 239, 172],
  );

  text(
    doc,
    data.contact,
    133,
    y + 16.3,
    4.9,
    false,
    COLORS.white,
  );

  doc.link(
    131,
    y + 11,
    58,
    7,
    {
      url: "tel:+919604038090",
    },
  );
}

export async function createReceiptPdfBlob(
  data: ReceiptPdfData,
  logoSrc: string,
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const logo = await imageToDataUrl(logoSrc);

  header(doc, data, logo);
  customer(doc, data);
  payment(doc, data);
  amount(doc, data);
  summary(doc, data);
  confirmation(doc);
  footer(doc, data);

  return doc.output("blob");
}
export async function downloadReceiptPdf(
  data: ReceiptPdfData,
  logoSrc: string,
  fileName: string,
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const logo = await imageToDataUrl(logoSrc);

  header(doc, data, logo);
  customer(doc, data);
  payment(doc, data);
  amount(doc, data);
  summary(doc, data);
  confirmation(doc);
  footer(doc, data);

  doc.save(fileName);
}

