import { db } from "../db/database";
import type { UpcomingPayment } from "../types/finance";

export async function getUpcomingPayments() {
  return db.upcomingPayments
    .orderBy("dueDate")
    .toArray();
}

export async function getAcademyUpcomingPayments(academyId: number) {
  return db.upcomingPayments
    .where("academyId")
    .equals(academyId)
    .sortBy("dueDate");
}

export async function createUpcomingPayment(
  payment: Omit<UpcomingPayment, "id" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();

  return db.upcomingPayments.add({
    ...payment,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateUpcomingPayment(
  id: number,
  changes: Partial<Omit<UpcomingPayment, "id" | "createdAt">>,
) {
  return db.upcomingPayments.update(id, {
    ...changes,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteUpcomingPayment(id: number) {
  return db.upcomingPayments.delete(id);
}
