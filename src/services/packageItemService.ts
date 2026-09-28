import { db } from "../db/database";
import type { PackageItem } from "../types/finance";

export interface PackageItemInput {
  name: string;
  amount: number;
  discount?: number;
}

export interface AcademyPackageSummary {
  items: PackageItem[];
  subtotal: number;
  itemDiscount: number;
  packageDiscount: number;
  totalPackage: number;
  totalPaid: number;
  pendingAmount: number;
}


export async function getAcademyPackageItems(academyId: number) {
  return db.packageItems
    .where("academyId")
    .equals(academyId)
    .sortBy("createdAt");
}

export async function getAcademyPackageSummary(
  academyId: number,
): Promise<AcademyPackageSummary> {
  const [items, academy, payments] = await Promise.all([
    getAcademyPackageItems(academyId),
    db.academies.get(academyId),
    db.payments.where("academyId").equals(academyId).toArray(),
  ]);

  const subtotal = items.reduce((total, item) => total + item.amount, 0);

  const itemDiscount = items.reduce(
    (total, item) => total + (item.discount || 0),
    0,
  );

  const packageDiscount = Math.max(
    0,
    (academy as { packageDiscount?: number } | undefined)?.packageDiscount || 0,
  );

  const totalPackage = Math.max(
    0,
    subtotal - itemDiscount - packageDiscount,
  );

  const totalPaid = payments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );

  return {
    items,
    subtotal,
    itemDiscount,
    packageDiscount,
    totalPackage,
    totalPaid,
    pendingAmount: Math.max(0, totalPackage - totalPaid),
  };
}

export async function addPackageItem(
  academyId: number,
  input: PackageItemInput,
) {
  const name = input.name.trim();
  const amount = Number(input.amount);
  const discount = Number(input.discount || 0);

  if (!name) {
    throw new Error("Package item name is required.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Package item amount must be greater than zero.");
  }

  if (!Number.isFinite(discount) || discount < 0 || discount > amount) {
    throw new Error("Discount must be between zero and item amount.");
  }

  const academy = await db.academies.get(academyId);

  if (!academy) {
    throw new Error("Academy not found.");
  }

  const now = new Date().toISOString();

  return db.transaction(
    "rw",
    db.packageItems,
    db.academies,
    async () => {
      const itemId = await db.packageItems.add({
        academyId,
        name,
        amount,
        discount,
        createdAt: now,
        updatedAt: now,
      });

      await syncAcademyPackageAmount(academyId);

      return itemId;
    },
  );
}

export async function updatePackageItem(
  id: number,
  input: PackageItemInput,
) {
  const item = await db.packageItems.get(id);

  if (!item) {
    throw new Error("Package item not found.");
  }

  const name = input.name.trim();
  const amount = Number(input.amount);
  const discount = Number(input.discount || 0);

  if (!name) {
    throw new Error("Package item name is required.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Package item amount must be greater than zero.");
  }

  if (!Number.isFinite(discount) || discount < 0 || discount > amount) {
    throw new Error("Discount must be between zero and item amount.");
  }

  const now = new Date().toISOString();

  return db.transaction(
    "rw",
    db.packageItems,
    db.academies,
    async () => {
      await db.packageItems.update(id, {
        name,
        amount,
        discount,
        updatedAt: now,
      });

      await syncAcademyPackageAmount(item.academyId);
    },
  );
}

export async function deletePackageItem(id: number) {
  const item = await db.packageItems.get(id);

  if (!item) {
    throw new Error("Package item not found.");
  }

  const packagePayments = await db.payments
    .where("packageItemId")
    .equals(id)
    .toArray();

  if (packagePayments.length > 0) {
    throw new Error(
      "This service has payment records. Delete or reassign those payments first.",
    );
  }

  return db.transaction(
    "rw",
    db.packageItems,
    db.academies,
    async () => {
      await db.packageItems.delete(id);
      await syncAcademyPackageAmount(item.academyId);
    },
  );
}

export async function setAcademyPackageDiscount(
  academyId: number,
  discount: number,
) {
  const numericDiscount = Number(discount || 0);

  if (!Number.isFinite(numericDiscount) || numericDiscount < 0) {
    throw new Error("Package discount cannot be negative.");
  }

  const summary = await getAcademyPackageSummary(academyId);

  const maximum = Math.max(0, summary.subtotal - summary.itemDiscount);

  if (numericDiscount > maximum) {
    throw new Error("Package discount cannot exceed the package value.");
  }

  await db.academies.update(academyId, {
    packageDiscount: numericDiscount,
    packageAmount: Math.max(0, maximum - numericDiscount),
    updatedAt: new Date().toISOString(),
  });
}

async function syncAcademyPackageAmount(academyId: number) {
  const summary = await getAcademyPackageSummaryWithoutAcademyDiscount(
    academyId,
  );

  await db.academies.update(academyId, {
    packageAmount: summary.totalPackage,
    updatedAt: new Date().toISOString(),
  });
}

async function getAcademyPackageSummaryWithoutAcademyDiscount(
  academyId: number,
) {
  const [items, academy] = await Promise.all([
    getAcademyPackageItems(academyId),
    db.academies.get(academyId),
  ]);

  const subtotal = items.reduce((total, item) => total + item.amount, 0);

  const itemDiscount = items.reduce(
    (total, item) => total + (item.discount || 0),
    0,
  );

  const packageDiscount =
    (academy as { packageDiscount?: number } | undefined)?.packageDiscount ||
    0;

  return {
    totalPackage: Math.max(
      0,
      subtotal - itemDiscount - packageDiscount,
    ),
  };
}
