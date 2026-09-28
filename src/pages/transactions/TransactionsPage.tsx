import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { db } from "../../db/database";
import { deleteTransaction } from "../../services/transactionService";
import type { Transaction } from "../../types/finance";
import { TransactionFormModal } from "../../components/transactions/TransactionFormModal";
import {
  TransactionFilters,
  type TransactionFilter,
} from "../../components/transactions/TransactionFilters";
import {
  TransactionSummaryCards,
} from "../../components/transactions/TransactionSummaryCards";
import {
  TransactionTable,
  type TransactionListItem,
} from "../../components/transactions/TransactionTable";

export function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [error, setError] = useState("");

  const data = useLiveQuery(async () => {
    const [transactions, academies, categories] = await Promise.all([
      db.transactions.orderBy("transactionDate").reverse().toArray(),
      db.academies.toArray(),
      db.categories.toArray(),
    ]);

    const academyMap = new Map(
      academies.map((academy) => [academy.id, academy.name]),
    );

    const categoryMap = new Map(
      categories.map((category) => [category.id, category.name]),
    );

    return transactions.map((transaction) => ({
      ...transaction,
      academyName: transaction.academyId
        ? academyMap.get(transaction.academyId) ?? "Unknown Academy"
        : "Company / General",
      categoryName:
        categoryMap.get(transaction.categoryId) ?? "Unknown Category",
    }));
  }, []);

  const transactions = data ?? [];

  const filteredTransactions = useMemo<TransactionListItem[]>(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesType =
        filter === "all" || transaction.type === filter;

      if (!matchesType) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        transaction.transactionNumber,
        transaction.categoryName,
        transaction.academyName,
        transaction.description ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [transactions, search, filter]);

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const handleEdit = (transaction: Transaction) => {
    if (transaction.paymentId !== undefined) {
      setError(
        "Academy payment transactions must be edited from the Payments section.",
      );
      return;
    }

    setError("");
    setEditingTransaction(transaction);
    setTransactionModalOpen(true);
  };

  const handleDelete = async (transaction: Transaction) => {
    if (transaction.paymentId !== undefined) {
      setError(
        "Academy payment transactions must be deleted from the Payments section.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete transaction ${transaction.transactionNumber}?`,
    );

    if (!confirmed || transaction.id === undefined) {
      return;
    }

    try {
      setError("");
      await deleteTransaction(transaction.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete transaction.",
      );
    }
  };

  const handleModalClose = () => {
    setTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const handleTransactionSaved = () => {
    handleModalClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage E-Sccholar income and expenses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingTransaction(null);
            setError("");
            setTransactionModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <TransactionSummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />

      <TransactionFilters
        search={search}
        filter={filter}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />

      <TransactionTable
        transactions={filteredTransactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TransactionFormModal
        open={transactionModalOpen}
        onClose={handleModalClose}
        onSaved={handleTransactionSaved}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
