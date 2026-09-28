import type {
  Academy,
  Category,
  PaymentMethod,
  TransactionType,
} from "../../types/finance";

export interface TransactionFormValues {
  type: TransactionType;
  categoryId: string;
  academyId: string;
  amount: string;
  paymentMethod: PaymentMethod;
  transactionDate: string;
  description: string;
}

interface TransactionFormFieldsProps {
  form: TransactionFormValues;
  categories: Category[];
  academies: Academy[];
  inputClass: string;
  updateField: (
    field: keyof TransactionFormValues,
    value: string,
  ) => void;
}

export function TransactionFormFields({
  form,
  categories,
  academies,
  inputClass,
  updateField,
}: TransactionFormFieldsProps) {
  const availableCategories = categories.filter(
    (category) =>
      category.isActive &&
      (category.type === "both" || category.type === form.type),
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Transaction Type *
        </label>
        <select
          className={inputClass}
          value={form.type}
          onChange={(event) => updateField("type", event.target.value)}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Category *
        </label>
        <select
          className={inputClass}
          value={form.categoryId}
          onChange={(event) => updateField("categoryId", event.target.value)}
          required
        >
          <option value="">Select category</option>
          {availableCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Related Academy
        </label>
        <select
          className={inputClass}
          value={form.academyId}
          onChange={(event) => updateField("academyId", event.target.value)}
        >
          <option value="">Company / No Academy</option>
          {academies.map((academy) => (
            <option key={academy.id} value={academy.id}>
              {academy.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-400">
          Select an academy to include this transaction in its profitability.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Amount *
        </label>
        <input
          type="number"
          min="1"
          step="0.01"
          className={inputClass}
          value={form.amount}
          onChange={(event) => updateField("amount", event.target.value)}
          placeholder="Enter amount"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Payment Method
        </label>
        <select
          className={inputClass}
          value={form.paymentMethod}
          onChange={(event) =>
            updateField("paymentMethod", event.target.value)
          }
        >
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="card">Card</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Date & Time *
        </label>
        <input
          type="datetime-local"
          className={inputClass}
          value={form.transactionDate}
          onChange={(event) =>
            updateField("transactionDate", event.target.value)
          }
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Add transaction notes..."
        />
      </div>
    </div>
  );
}
