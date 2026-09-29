import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useAcademies } from "../../hooks/useAcademies";
import { usePayments } from "../../hooks/usePayments";
import { deleteAcademy } from "../../services/academyService";
import type { Academy, AcademyStatus } from "../../types/finance";
import { Modal } from "../../components/ui/Modal";
import { AcademyForm } from "../../components/academies/AcademyForm";
import { AcademyTable } from "../../components/academies/AcademyTable";

export function AcademiesPage() {
  const navigate = useNavigate();
  const { academies, loading } = useAcademies();
  const { payments } = usePayments();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | AcademyStatus>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAcademy, setEditingAcademy] = useState<Academy | null>(null);

  const filteredAcademies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return academies.filter((academy) => {
      const matchesSearch =
        !query ||
        academy.name.toLowerCase().includes(query) ||
        academy.ownerName?.toLowerCase().includes(query) ||
        academy.mobile?.includes(query);

      const matchesStatus =
        status === "all" || academy.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [academies, search, status]);

  const stats = useMemo(
    () => ({
      total: academies.length,
      active: academies.filter((academy) => academy.status === "active").length,
      expired: academies.filter((academy) => academy.status === "expired").length,
      suspended: academies.filter(
        (academy) => academy.status === "suspended",
      ).length,
    }),
    [academies],
  );

  function handleAdd() {
    setEditingAcademy(null);
    setModalOpen(true);
  }

  function handleEdit(academy: Academy) {
    setEditingAcademy(academy);
    setModalOpen(true);
  }

  async function handleDelete(academy: Academy) {
    if (!academy.id) return;

    const confirmed = window.confirm(
      `Delete "${academy.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    await deleteAcademy(academy.id);
  }

  function handleSaved() {
    setModalOpen(false);
    setEditingAcademy(null);
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Building2 size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  E-Sccholar Finance
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Academies
                </h1>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  Manage academy accounts, plans and payment status.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus size={18} />
              Add Academy
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Academies"
          value={stats.total}
          icon={<Building2 size={18} />}
          className="bg-indigo-100 text-indigo-700"
        />

        <StatCard
          label="Active"
          value={stats.active}
          icon={<CheckCircle2 size={18} />}
          className="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          label="Expired"
          value={stats.expired}
          icon={<Clock3 size={18} />}
          className="bg-amber-100 text-amber-700"
        />

        <StatCard
          label="Suspended"
          value={stats.suspended}
          icon={<ShieldAlert size={18} />}
          className="bg-red-100 text-red-700"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Academy Directory
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Search and filter academy accounts.
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Showing{" "}
              <span className="text-slate-900">
                {filteredAcademies.length}
              </span>{" "}
              of {academies.length}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search academy, owner or mobile..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as "all" | AcademyStatus,
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
            <p className="mt-3 text-sm text-slate-500">
              Loading academies...
            </p>
          </div>
        ) : (
          <AcademyTable
            academies={filteredAcademies}
            payments={payments}
            onView={(academy) => {
              if (academy.id) {
                navigate(`/academies/${academy.id}`);
              }
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAcademy ? "Edit Academy" : "Add Academy"}
      >
        <AcademyForm
          academy={editingAcademy}
          onSaved={handleSaved}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <div className={`rounded-lg p-2 ${className}`}>
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}
