import type { jsPDF } from "jspdf";

export type RGB = [number, number, number];

export const COLORS: Record<string, RGB> = {
  navy: [15, 23, 42],
  blue: [37, 99, 235],
  blueSoft: [239, 246, 255],
  text: [30, 41, 59],
  muted: [100, 116, 139],
  border: [226, 232, 240],
  surface: [248, 250, 252],
  white: [255, 255, 255],
  green: [22, 163, 74],
  greenSoft: [240, 253, 244],
  amber: [217, 119, 6],
  amberSoft: [255, 251, 235],
  pink: [219, 39, 119],
  red: [220, 38, 38],
};

export function money(value: number) {
  return `INR ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value)}`;
}

export function setText(doc: jsPDF, color: RGB) {
  doc.setTextColor(...color);
}

export function setFill(doc: jsPDF, color: RGB) {
  doc.setFillColor(...color);
}

export function setStroke(doc: jsPDF, color: RGB) {
  doc.setDrawColor(...color);
}

export function text(
  doc: jsPDF,
  value: string,
  x: number,
  y: number,
  size = 9,
  bold = false,
  color: RGB = COLORS.text,
) {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  setText(doc, color);
  doc.text(value, x, y);
}

export function textRight(
  doc: jsPDF,
  value: string,
  x: number,
  y: number,
  size = 9,
  bold = false,
  color: RGB = COLORS.text,
) {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  setText(doc, color);
  doc.text(value, x, y, { align: "right" });
}

export function roundedBox(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: RGB = COLORS.white,
  stroke: RGB = COLORS.border,
  radius = 3,
) {
  setFill(doc, fill);
  setStroke(doc, stroke);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, radius, radius, "FD");
}

export function line(
  doc: jsPDF,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: RGB = COLORS.border,
  width = 0.3,
) {
  setStroke(doc, color);
  doc.setLineWidth(width);
  doc.line(x1, y1, x2, y2);
}

export function sectionTitle(doc: jsPDF, title: string, x: number, y: number) {
  setFill(doc, COLORS.blue);
  doc.roundedRect(x, y - 3.2, 1.5, 7, 0.75, 0.75, "F");
  text(doc, title.toUpperCase(), x + 5, y + 1.5, 8.2, true, COLORS.navy);
}

export function field(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) {
  text(doc, label.toUpperCase(), x, y, 6.5, true, COLORS.muted);

  const lines = doc.splitTextToSize(value || "—", width) as string[];

  text(
    doc,
    lines[0] || "—",
    x,
    y + 5,
    9.2,
    true,
    COLORS.text,
  );
}

export function drawWebsiteIcon(
  doc: jsPDF,
  x: number,
  y: number,
  color = COLORS.blue,
) {
  setStroke(doc, color);
  doc.setLineWidth(0.7);
  doc.circle(x, y, 2.5, "S");
  doc.ellipse(x, y, 1.1, 2.5, "S");
  doc.line(x - 2.5, y, x + 2.5, y);
}

export function drawInstagramIcon(
  doc: jsPDF,
  x: number,
  y: number,
  color = COLORS.pink,
) {
  setStroke(doc, color);
  doc.setLineWidth(0.7);

  doc.roundedRect(
    x - 2.6,
    y - 2.6,
    5.2,
    5.2,
    1.2,
    1.2,
    "S",
  );

  doc.circle(x, y, 1.25, "S");
  doc.circle(x + 1.65, y - 1.65, 0.35, "F");
}

export function drawMailIcon(
  doc: jsPDF,
  x: number,
  y: number,
  color = COLORS.red,
) {
  setStroke(doc, color);
  doc.setLineWidth(0.7);

  doc.rect(x - 3, y - 2.2, 6, 4.4, "S");
  doc.line(x - 3, y - 2.2, x, y + 0.4);
  doc.line(x + 3, y - 2.2, x, y + 0.4);
}

export function drawPhoneIcon(
  doc: jsPDF,
  x: number,
  y: number,
  color = COLORS.green,
) {
  setStroke(doc, color);
  doc.setLineWidth(0.8);

  doc.roundedRect(
    x - 1.8,
    y - 3.2,
    3.6,
    6.4,
    0.9,
    0.9,
    "S",
  );

  doc.circle(x, y + 2.3, 0.3, "F");
}

export async function imageToDataUrl(src: string) {
  const response = await fetch(src);
  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result));
    };

    reader.onerror = () => {
      reject(new Error("Unable to load receipt logo."));
    };

    reader.readAsDataURL(blob);
  });
}
