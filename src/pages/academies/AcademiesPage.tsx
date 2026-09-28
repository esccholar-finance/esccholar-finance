import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Academies
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage academy accounts, plans and payment status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Add Academy
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search academy, owner or mobile..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as "all" | AcademyStatus,
              )
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading ? (
          <div className="px-6 py-14 text-center text-sm text-slate-500">
            Loading academies...
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
      </div>

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
