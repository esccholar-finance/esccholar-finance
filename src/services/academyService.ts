import { db } from "../db/database";
import type { Academy } from "../types/finance";

export async function getAcademies() {
  return db.academies.orderBy("createdAt").reverse().toArray();
}

export async function getAcademyById(id: number) {
  return db.academies.get(id);
}

export async function createAcademy(
  academy: Omit<Academy, "id" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();

  return db.academies.add({
    ...academy,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateAcademy(
  id: number,
  changes: Partial<Omit<Academy, "id" | "createdAt">>,
) {
  return db.academies.update(id, {
    ...changes,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteAcademy(id: number) {
  return db.academies.delete(id);
}
