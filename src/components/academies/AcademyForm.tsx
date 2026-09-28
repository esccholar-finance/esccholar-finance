import { useEffect, useState } from "react";
import { createAcademy, updateAcademy } from "../../services/academyService";
import type { Academy, PaymentPlan } from "../../types/finance";

interface AcademyFormProps {
  academy?: Academy | null;
  onSaved: () => void;
  onCancel: () => void;
}

const initialForm = {
  name: "",
  ownerName: "",
  mobile: "",
  paymentPlan: "one_time" as PaymentPlan,
  customPlan: "",
  packageAmount: "0",
  startDate: new Date().toISOString().slice(0, 10),
  expiryDate: "",
  status: "active" as Academy["status"],
};

export function AcademyForm({
  academy,
  onSaved,
  onCancel,
}: AcademyFormProps) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!academy) {
      setForm(initialForm);
      return;
    }

    setForm({
      name: academy.name,
      ownerName: academy.ownerName ?? "",
      mobile: academy.mobile ?? "",
      paymentPlan: academy.paymentPlan,
      customPlan: academy.customPlan ?? "",
      packageAmount: String(academy.packageAmount),
      startDate: academy.startDate,
      expiryDate: academy.expiryDate,
      status: academy.status,
    });
  }, [academy]);

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.name.trim()) return;

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      ownerName: form.ownerName.trim() || undefined,
      mobile: form.mobile.trim() || undefined,
      paymentPlan: form.paymentPlan,
      customPlan:
        form.paymentPlan === "custom"
          ? form.customPlan.trim() || undefined
          : undefined,
      packageAmount: Number(form.packageAmount) || 0,
      startDate: form.startDate,
      expiryDate: form.expiryDate,
      status: form.status,
    };

    try {
      if (academy?.id) {
        await updateAcademy(academy.id, payload);
      } else {
        await createAcademy(payload);
      }

      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Academy Name *
          </label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Enter academy name"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Owner Name
          </label>
          <input
            className={inputClass}
            value={form.ownerName}
            onChange={(e) => updateField("ownerName", e.target.value)}
            placeholder="Owner name"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Mobile
          </label>
          <input
            className={inputClass}
            value={form.mobile}
            onChange={(e) => updateField("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="Mobile number"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Payment Plan
          </label>
          <select
            className={inputClass}
            value={form.paymentPlan}
            onChange={(e) =>
              updateField("paymentPlan", e.target.value)
            }
          >
            <option value="one_time">One Time</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {form.paymentPlan === "custom" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Custom Plan
            </label>
            <input
              className={inputClass}
              value={form.customPlan}
              onChange={(e) =>
                updateField("customPlan", e.target.value)
              }
              placeholder="e.g. 6 Months"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Package Amount
          </label>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.packageAmount}
            onChange={(e) =>
              updateField("packageAmount", e.target.value)
            }
            placeholder="Total package amount"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Start Date
          </label>
          <input
            type="date"
            className={inputClass}
            value={form.startDate}
            onChange={(e) =>
              updateField("startDate", e.target.value)
            }
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Expiry Date
          </label>
          <input
            type="date"
            className={inputClass}
            value={form.expiryDate}
            onChange={(e) =>
              updateField("expiryDate", e.target.value)
            }
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) =>
              updateField("status", e.target.value)
            }
          >
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : academy
              ? "Update Academy"
              : "Add Academy"}
        </button>
      </div>
    </form>
  );
}



