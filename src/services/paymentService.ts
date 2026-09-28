import { db } from "../db/database";
import { generateTransactionNumber } from "./transactionNumberService";
import type { Category, Payment } from "../types/finance";

const PAYMENT_CATEGORY_NAME = "Academy Payment";

async function getOrCreatePaymentCategory() {
  const existing = await db.categories
    .where("name")
    .equals(PAYMENT_CATEGORY_NAME)
    .first();

  if (existing?.id !== undefined) {
    return existing.id;
  }

  const now = new Date().toISOString();

  return db.categories.add({
    name: PAYMENT_CATEGORY_NAME,
    type: "income",
    description: "Income automatically created from academy payment records.",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  } satisfies Omit<Category, "id">);
}

export async function getPayments() {
  return db.payments.orderBy("paymentDate").reverse().toArray();
}

export async function getAcademyPayments(academyId: number) {
  return db.payments
    .where("academyId")
    .equals(academyId)
    .reverse()
    .sortBy("paymentDate");
}

export async function createPayment(
  payment: Omit<Payment, "id" | "transactionNumber" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();

  const transactionNumber = await generateTransactionNumber(
    new Date(payment.paymentDate),
  );

  return db.transaction(
    "rw",
    db.payments,
    db.transactions,
    db.categories,
    async () => {
      const paymentId = await db.payments.add({
        ...payment,
        transactionNumber,
        createdAt: now,
        updatedAt: now,
      });

      const categoryId = await getOrCreatePaymentCategory();

      await db.transactions.add({
        paymentId,
        transactionNumber,
        type: "income",
        categoryId,
        academyId: payment.academyId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        description: payment.description,
        transactionDate: payment.paymentDate,
        createdAt: now,
        updatedAt: now,
      });

      return paymentId;
    },
  );
}

export async function updatePayment(
  id: number,
  changes: Partial<Omit<Payment, "id" | "createdAt">>,
) {
  const now = new Date().toISOString();

  return db.transaction(
    "rw",
    db.payments,
    db.transactions,
    async () => {
      const result = await db.payments.update(id, {
        ...changes,
        updatedAt: now,
      });

      const linkedTransaction = await db.transactions
        .where("paymentId")
        .equals(id)
        .first();

      if (linkedTransaction?.id !== undefined) {
        await db.transactions.update(linkedTransaction.id, {
          ...(changes.amount !== undefined
            ? { amount: changes.amount }
            : {}),
          ...(changes.academyId !== undefined
            ? { academyId: changes.academyId }
            : {}),
          ...(changes.paymentMethod !== undefined
            ? { paymentMethod: changes.paymentMethod }
            : {}),
          ...(changes.description !== undefined
            ? { description: changes.description }
            : {}),
          ...(changes.paymentDate !== undefined
            ? { transactionDate: changes.paymentDate }
            : {}),
          updatedAt: now,
        });
      }

      return result;
    },
  );
}

export async function deletePayment(id: number) {
  return db.transaction(
    "rw",
    db.payments,
    db.transactions,
    async () => {
      await db.transactions
        .where("paymentId")
        .equals(id)
        .delete();

      return db.payments.delete(id);
    },
  );
}
