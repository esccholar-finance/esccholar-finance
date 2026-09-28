import { db } from "../db/database";
import { generateTransactionNumber } from "./transactionNumberService";
import type { Transaction, TransactionType } from "../types/finance";

export type CreateTransactionInput = Omit<
  Transaction,
  "id" | "transactionNumber" | "createdAt" | "updatedAt"
>;

export async function getTransactions() {
  return db.transactions
    .orderBy("transactionDate")
    .reverse()
    .toArray();
}

export async function getAcademyTransactions(academyId: number) {
  return db.transactions
    .where("academyId")
    .equals(academyId)
    .reverse()
    .sortBy("transactionDate");
}

export async function createTransaction(
  transaction: CreateTransactionInput,
) {
  if (transaction.amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  const category = await db.categories.get(transaction.categoryId);

  if (!category) {
    throw new Error("Selected category was not found.");
  }

  if (!category.isActive) {
    throw new Error("Selected category is inactive.");
  }

  if (
    category.type !== "both" &&
    category.type !== transaction.type
  ) {
    throw new Error(
      `This category cannot be used for ${transaction.type}.`,
    );
  }

  const now = new Date().toISOString();

  const transactionNumber = await generateTransactionNumber(
    new Date(transaction.transactionDate),
  );

  return db.transactions.add({
    ...transaction,
    transactionNumber,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateTransaction(
  id: number,
  changes: Partial<
    Omit<Transaction, "id" | "transactionNumber" | "createdAt">
  >,
) {
  const existing = await db.transactions.get(id);

  if (!existing) {
    throw new Error("Transaction not found.");
  }

  if (changes.amount !== undefined && changes.amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  if (changes.categoryId !== undefined) {
    const category = await db.categories.get(changes.categoryId);

    if (!category) {
      throw new Error("Selected category was not found.");
    }

    if (!category.isActive) {
      throw new Error("Selected category is inactive.");
    }

    const transactionType = changes.type ?? existing.type;

    if (
      category.type !== "both" &&
      category.type !== transactionType
    ) {
      throw new Error(
        `This category cannot be used for ${transactionType}.`,
      );
    }
  }

  const now = new Date().toISOString();

  return db.transactions.update(id, {
    ...changes,
    updatedAt: now,
  });
}

export async function deleteTransaction(id: number) {
  const transaction = await db.transactions.get(id);

  if (!transaction) {
    throw new Error("Transaction not found.");
  }

  if (transaction.paymentId !== undefined) {
    throw new Error(
      "Academy payment transactions must be deleted from the Payments section.",
    );
  }

  return db.transactions.delete(id);
}

export async function getTransactionsByType(
  type: TransactionType,
) {
  return db.transactions
    .where("type")
    .equals(type)
    .reverse()
    .sortBy("transactionDate");
}
