import Dexie, { type Table } from "dexie";
import type {
  Academy,
  ActivityLog,
  Category,
  Payment,
  Transaction,
  PackageItem,
} from "../types/finance";

export class FinanceDatabase extends Dexie {
  academies!: Table<Academy, number>;
  categories!: Table<Category, number>;
  payments!: Table<Payment, number>;
  transactions!: Table<Transaction, number>;
  activityLogs!: Table<ActivityLog, number>;
  packageItems!: Table<PackageItem, number>;

  constructor() {
    super("ESccholarFinanceDB");

    this.version(5).stores({
      academies: "++id, name, status, expiryDate, createdAt",
      categories: "++id, name, type, isActive, createdAt",
      payments:
        "++id, academyId, paymentMethod, paymentDate, invoiceNumber, receiptNumber, createdAt",
      transactions:
        "++id, type, categoryId, academyId, amount, transactionDate, createdAt",
      activityLogs:
        "++id, action, entityType, entityId, academyId, createdAt",
    });
    this.version(6).stores({
      academies: "++id, name, status, expiryDate, createdAt",
      categories: "++id, name, type, isActive, createdAt",
      payments:
        "++id, academyId, paymentMethod, paymentDate, invoiceNumber, receiptNumber, createdAt",
      transactions:
        "++id, paymentId, type, categoryId, academyId, amount, transactionDate, createdAt",
      activityLogs:
        "++id, action, entityType, entityId, academyId, createdAt",
    }).upgrade(async (tx) => {
      const categories = tx.table("categories");
      const payments = tx.table("payments");
      const transactions = tx.table("transactions");

      let category = await categories
        .where("name")
        .equals("Academy Payment")
        .first();

      let categoryId: number;

      if (category?.id !== undefined) {
        categoryId = category.id;
      } else {
        const now = new Date().toISOString();

        categoryId = await categories.add({
          name: "Academy Payment",
          type: "income",
          description:
            "Income automatically created from academy payment records.",
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      }

      const allPayments = await payments.toArray();

      for (const payment of allPayments) {
        if (payment.id === undefined) {
          continue;
        }

        const existingTransaction = await transactions
          .where("paymentId")
          .equals(payment.id)
          .first();

        if (existingTransaction) {
          continue;
        }

        await transactions.add({
          paymentId: payment.id,
          transactionNumber: payment.transactionNumber,
          type: "income",
          categoryId,
          academyId: payment.academyId,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          description: payment.description,
          transactionDate: payment.paymentDate,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        });
      }
    });

    this.version(7).stores({
      academies: "++id, name, status, expiryDate, createdAt",
      categories: "++id, name, type, isActive, createdAt",
      payments:
        "++id, academyId, paymentMethod, paymentDate, invoiceNumber, receiptNumber, createdAt",
      transactions:
        "++id, paymentId, type, categoryId, academyId, amount, transactionDate, createdAt",
      activityLogs:
        "++id, action, entityType, entityId, academyId, createdAt",
      packageItems:
        "++id, academyId, name, amount, createdAt",
    });

    this.version(8).stores({
      academies: "++id, name, status, expiryDate, createdAt",
      categories: "++id, name, type, isActive, createdAt",
      payments:
        "++id, academyId, packageItemId, paymentMethod, paymentDate, invoiceNumber, receiptNumber, createdAt",
      transactions:
        "++id, paymentId, type, categoryId, academyId, amount, transactionDate, createdAt",
      activityLogs:
        "++id, action, entityType, entityId, academyId, createdAt",
      packageItems:
        "++id, academyId, name, amount, createdAt",
    }).upgrade(async (tx) => {
      const packageItems = tx.table("packageItems");
      const items = await packageItems.toArray();

      for (const item of items) {
        if (item.discount === undefined) {
          await packageItems.update(item.id, {
            discount: 0,
          });
        }
      }
    });
  }
}

export const db = new FinanceDatabase();


