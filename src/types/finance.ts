export type TransactionType = "income" | "expense";

export type PaymentMethod =
  | "cash"
  | "upi"
  | "bank_transfer"
  | "card"
  | "other";

export type AcademyStatus = "active" | "expired" | "suspended";

export type PaymentPlan =
  | "one_time"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "custom";

export type ActivityAction =
  | "academy_created"
  | "academy_updated"
  | "academy_deleted"
  | "payment_added"
  | "payment_updated"
  | "payment_deleted"
  | "transaction_created"
  | "transaction_updated"
  | "transaction_deleted"
  | "category_created"
  | "category_updated"
  | "category_deleted";

export type ActivityEntity =
  | "academy"
  | "payment"
  | "transaction"
  | "category";

export interface Academy {
  id?: number;
  name: string;
  ownerName?: string;
  mobile?: string;

  paymentPlan: PaymentPlan;
  customPlan?: string;
  packageAmount: number;
  packageDiscount?: number;

  startDate: string;
  expiryDate: string;

  status: AcademyStatus;


  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id?: number;
  transactionNumber: string;
  academyId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  invoiceNumber?: string;
  receiptNumber?: string;
  transactionReference?: string;
  paymentDate: string;
  description?: string;
  packageItemId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackageItem {
  id?: number;
  academyId: number;
  name: string;
  amount: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id?: number;
  name: string;
  type: TransactionType | "both";
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id?: number;
  paymentId?: number;
  transactionNumber: string;
  type: TransactionType;
  categoryId: number;
  academyId?: number;
  amount: number;
  paymentMethod?: PaymentMethod;
  description?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}
export interface ActivityLog {
  id?: number;
  action: ActivityAction;
  entityType: ActivityEntity;
  entityId?: number;
  academyId?: number;

  title: string;
  description: string;

  metadata?: Record<string, unknown>;

  createdAt: string;
}


