interface TransactionFormFooterProps {
  saving: boolean;
  isEditing: boolean;
  onClose: () => void;
}

export function TransactionFormFooter({
  saving,
  isEditing,
  onClose,
}: TransactionFormFooterProps) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onClose}
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
          : isEditing
            ? "Update Transaction"
            : "Add Transaction"}
      </button>
    </div>
  );
}
