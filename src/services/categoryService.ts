import { db } from "../db/database";
import type { Category, TransactionType } from "../types/finance";

export async function getCategories() {
  return db.categories.orderBy("createdAt").reverse().toArray();
}

export async function getActiveCategories(type?: TransactionType) {
  const categories = await db.categories
    .where("isActive")
    .equals(1)
    .toArray();

  if (!type) {
    return categories;
  }

  return categories.filter(
    (category) => category.type === type || category.type === "both",
  );
}

export async function createCategory(
  category: Omit<Category, "id" | "createdAt" | "updatedAt">,
) {
  const name = category.name.trim();

  if (!name) {
    throw new Error("Category name is required.");
  }

  const existing = await db.categories
    .where("name")
    .equals(name)
    .first();

  if (existing) {
    throw new Error("A category with this name already exists.");
  }

  const now = new Date().toISOString();

  return db.categories.add({
    ...category,
    name,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateCategory(
  id: number,
  changes: Partial<Omit<Category, "id" | "createdAt">>,
) {
  const category = await db.categories.get(id);

  if (!category) {
    throw new Error("Category not found.");
  }

  if (category.name === "Academy Payment") {
    throw new Error("Academy Payment is a system category.");
  }

  if (changes.name !== undefined) {
    const name = changes.name.trim();

    if (!name) {
      throw new Error("Category name is required.");
    }

    const existing = await db.categories
      .where("name")
      .equals(name)
      .first();

    if (existing && existing.id !== id) {
      throw new Error("A category with this name already exists.");
    }

    changes = {
      ...changes,
      name,
    };
  }

  return db.categories.update(id, {
    ...changes,
    updatedAt: new Date().toISOString(),
  });
}

export async function deactivateCategory(id: number) {
  const category = await db.categories.get(id);

  if (!category) {
    throw new Error("Category not found.");
  }

  if (category.name === "Academy Payment") {
    throw new Error("Academy Payment cannot be deactivated.");
  }

  return db.categories.update(id, {
    isActive: false,
    updatedAt: new Date().toISOString(),
  });
}

export async function activateCategory(id: number) {
  return db.categories.update(id, {
    isActive: true,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCategory(id: number) {
  const category = await db.categories.get(id);

  if (!category) {
    throw new Error("Category not found.");
  }

  if (category.name === "Academy Payment") {
    throw new Error("Academy Payment cannot be deleted.");
  }

  const transactionCount = await db.transactions
    .where("categoryId")
    .equals(id)
    .count();

  if (transactionCount > 0) {
    throw new Error(
      "This category is already used by transactions. Deactivate it instead.",
    );
  }

  return db.categories.delete(id);
}
