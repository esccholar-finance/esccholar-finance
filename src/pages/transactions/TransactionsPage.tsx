import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowDownLeft,
  ArrowUpRight,
  IndianRupee,
  Plus,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import { db } from "../../db/database";
import { deleteTransaction } from "../../services/transactionService";
import type { Transaction } from "../../types/finance";
import { TransactionFormModal } from "../../components/transactions/TransactionFormModal";
import {
  TransactionFilters,
  type TransactionFilter,
} from "../../components/transactions/TransactionFilters";
import { TransactionSummaryCards } from "../../components/transactions/TransactionSummaryCards";
import {
  TransactionTable,
  type TransactionListItem,
} from "../../components/transactions/TransactionTable";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

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

  const netAmount = totalIncome - totalExpense;

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
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-7 text-white sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <ReceiptText size={23} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Transactions
                  </h1>

                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                    {transactions.length}{" "}
                    {transactions.length === 1
                      ? "transaction"
                      : "transactions"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  Manage E-Sccholar income, expenses and financial activity.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingTransaction(null);
                setError("");
                setTransactionModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              <Plus size={18} />
              Add Transaction
            </button>
          </div>
        </div>

        <div className="grid gap-4 border-b border-slate-100 bg-slate-50/70 p-5 md:grid-cols-3">
          <QuickStat
            label="Total Income"
            value={formatCurrency(totalIncome)}
            icon={ArrowUpRight}
            iconClass="bg-emerald-100 text-emerald-700"
            valueClass="text-emerald-700"
          />

          <QuickStat
            label="Total Expense"
            value={formatCurrency(totalExpense)}
            icon={ArrowDownLeft}
            iconClass="bg-red-100 text-red-700"
            valueClass="text-red-700"
          />

          <QuickStat
            label="Net Position"
            value={formatCurrency(netAmount)}
            icon={WalletCards}
            iconClass={
              netAmount >= 0
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700"
            }
            valueClass={
              netAmount >= 0 ? "text-blue-700" : "text-amber-700"
            }
          />
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
            !
          </span>
          <p>{error}</p>
        </div>
      )}

      <TransactionSummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <IndianRupee size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Transaction Filters
            </h2>
            <p className="text-xs text-slate-500">
              Search and filter your financial records.
            </p>
          </div>
        </div>

        <TransactionFilters
          search={search}
          filter={filter}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Transaction History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredTransactions.length} matching{" "}
              {filteredTransactions.length === 1
                ? "record"
                : "records"}
            </p>
          </div>

          <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            Live financial data
          </span>
        </div>

        <TransactionTable
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>

      <TransactionFormModal
        open={transactionModalOpen}
        onClose={handleModalClose}
        onSaved={handleTransactionSaved}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}

function QuickStat({
  label,
  value,
  icon: Icon,
  iconClass,
  valueClass,
}: {
  label: string;
  value: string;
  icon: typeof ArrowUpRight;
  iconClass: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className={`mt-2 text-xl font-bold ${valueClass}`}>
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}
