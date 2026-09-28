import { jsPDF } from "jspdf";

import {
  COLORS,
  drawInstagramIcon,
  drawMailIcon,
  drawPhoneIcon,
  drawWebsiteIcon,
  field,
  money,
  roundedBox,
  sectionTitle,
  setFill,
  text,
  textRight,
} from "./receiptPdfHelpers";

import type { ReceiptPdfData } from "./receiptPdfTypes";

const W = 210;
const M = 15;
const CW = W - M * 2;

function status(data: ReceiptPdfData): {
  label: string;
  fill: [number, number, number];
  color: [number, number, number];
} {
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

export function drawHeader(
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
  text(doc, data.companyName, 49, 34, 8.5, false, COLORS.slate);

  roundedBox(doc, 150, 20, 40, 24, s.fill, s.fill, 4);

  text(doc, s.label, 154, 30, 8, true, s.color);
  text(doc, data.receiptNumber, 154, 37, 7.5, true, COLORS.navy);
}

export function drawCustomer(
  doc: jsPDF,
  data: ReceiptPdfData,
) {
  sectionTitle(doc, "ACADEMY DETAILS", M, 68);

  field(doc, "Academy Name", data.academyName, M, 79, 85);
  field(doc, "Owner Name", data.ownerName, 110, 79, 85);
  field(doc, "Mobile", data.mobile, M, 99, 85);
  field(doc, "Payment Date", data.paymentDate, 110, 99, 85);
}

export function drawPayment(
  doc: jsPDF,
  data: ReceiptPdfData,
) {
  sectionTitle(doc, "PAYMENT DETAILS", M, 125);

  field(doc, "Payment Method", data.paymentMethod, M, 136, 85);

  field(
    doc,
    "Transaction Reference",
    data.transactionReference || "N/A",
    110,
    136,
    85,
  );

  field(doc, "Receipt Generated", data.receiptGenerated, M, 156, 85);
  field(doc, "Transaction Number", data.receiptNumber, 110, 156, 85);
}

export function drawAmount(
  doc: jsPDF,
  data: ReceiptPdfData,
) {
  roundedBox(
    doc,
    M,
    181,
    CW,
    48,
    COLORS.blueSoft,
    COLORS.blueSoft,
    5,
  );

  text(doc, "PAYMENT RECEIVED", 22, 194, 8, true, COLORS.slate);

  textRight(
    doc,
    money(data.amount),
    188,
    204,
    22,
    true,
    COLORS.blue,
  );

  text(doc, "Package Amount", 22, 217, 8, false, COLORS.slate);

  textRight(
    doc,
    money(data.packageAmount),
    188,
    217,
    9,
    true,
    COLORS.navy,
  );
}

export function drawSummary(
  doc: jsPDF,
  data: ReceiptPdfData,
) {
  sectionTitle(doc, "PAYMENT SUMMARY", M, 247);

  const rows = [
    ["Package Amount", money(data.packageAmount)],
    ["Last Payment", money(data.lastPayment)],
    ["Paid Till Date", money(data.paidTillDate)],
    ["Pending Amount", money(data.pendingAmount)],
  ];

  let y = 259;

  rows.forEach(([label, value]) => {
    text(doc, label, M + 6, y, 9, false, COLORS.slate);
    textRight(doc, value, M + CW - 6, y, 9, true, COLORS.navy);
    y += 12;
  });
}

export function drawConfirmation(doc: jsPDF) {
  roundedBox(
    doc,
    M,
    315,
    CW,
    55,
    COLORS.white,
    COLORS.border,
    5,
  );

  setFill(doc, COLORS.blueSoft);
  doc.circle(29, 332, 9, "F");

  text(doc, "?", 25.5, 336, 12, true, COLORS.blue);

  text(doc, "Payment Confirmation", 45, 329, 11, true, COLORS.navy);

  text(
    doc,
    "This receipt confirms that the payment mentioned above",
    45,
    341,
    8,
    false,
    COLORS.slate,
  );

  text(
    doc,
    "has been received by E-Sccholar.",
    45,
    352,
    8,
    false,
    COLORS.slate,
  );
}

export function drawFooter(
  doc: jsPDF,
  data: ReceiptPdfData,
) {
  const y = 382;

  roundedBox(
    doc,
    M,
    y,
    CW,
    38,
    COLORS.navy,
    COLORS.navy,
    5,
  );

  text(doc, data.tagline, 22, y + 11, 8.5, true, COLORS.white);

  drawWebsiteIcon(doc, 22, y + 21, COLORS.white);
  text(doc, data.website, 29, y + 22, 7.5, false, COLORS.white);

  drawInstagramIcon(doc, 83, y + 21, COLORS.white);
  text(doc, data.instagram, 90, y + 22, 7.5, false, COLORS.white);

  drawMailIcon(doc, 134, y + 21, COLORS.white);
  text(doc, data.email, 141, y + 22, 7.5, false, COLORS.white);

  drawPhoneIcon(doc, 22, y + 30, COLORS.white);
  text(doc, data.contact, 29, y + 31, 7.5, false, COLORS.white);
}
