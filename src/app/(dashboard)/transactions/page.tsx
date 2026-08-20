"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, Search, ArrowLeftRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader, TransactionRow } from "@/components/dashboard/shared";
import { TransactionFormDialog } from "@/components/dashboard/transaction-form";
import { Button, Card, Input, Select, Skeleton, EmptyState, Segmented, Badge } from "@/components/ui/primitives";
import { useLumen, useProfile } from "@/lib/store";
import { CATEGORIES } from "@/lib/categories";
import { formatCurrency, monthKeyLabel } from "@/lib/format";
import { lastNMonths } from "@/lib/analytics";
import type { Transaction, TxType } from "@/lib/types";
import { toast } from "sonner";

type SortKey = "newest" | "oldest" | "amount-desc" | "amount-asc";

export default function TransactionsPage() {
  const profile = useProfile();
  const data = useLumen((s) => s.data);
  const addTransaction = useLumen((s) => s.addTransaction);
  const updateTransaction = useLumen((s) => s.updateTransaction);
  const deleteTransaction = useLumen((s) => s.deleteTransaction);

  const currency = profile?.currency ?? "USD";
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | TxType>("all");
  const [category, setCategory] = useState("all");
  const [month, setMonth] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const months = useMemo(() => lastNMonths(8).reverse(), []);

  const filtered = useMemo(() => {
    let list = [...data.transactions];
    if (type !== "all") list = list.filter((t) => t.type === type);
    if (category !== "all") list = list.filter((t) => t.categoryId === category);
    if (month !== "all") list = list.filter((t) => t.date.startsWith(month));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t) => t.merchant.toLowerCase().includes(q) || (t.note ?? "").toLowerCase().includes(q));
    }
    switch (sort) {
      case "oldest":
        list.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case "amount-desc":
        list.sort((a, b) => b.amount - a.amount);
        break;
      case "amount-asc":
        list.sort((a, b) => a.amount - b.amount);
        break;
      default:
        list.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    }
    return list;
  }, [data.transactions, type, category, month, query, sort]);

  const totals = useMemo(() => {
    const inc = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { inc, exp };
  }, [filtered]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setFormOpen(true);
  };

  const onDelete = (tx: Transaction) => {
    deleteTransaction(tx.id);
    toast("Transaction deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          addTransaction({
            type: tx.type,
            amount: tx.amount,
            merchant: tx.merchant,
            date: tx.date,
            categoryId: tx.categoryId,
            note: tx.note,
            recurring: tx.recurring,
          });
        },
      },
    });
  };

  const onSubmit = (values: {
    type: TxType;
    amount: number;
    merchant: string;
    categoryId: string;
    date: string;
    note?: string;
    recurring?: boolean;
  }) => {
    if (editing) {
      updateTransaction(editing.id, values);
      toast.success("Transaction updated");
    } else {
      addTransaction(values);
      toast.success("Transaction added");
    }
    setFormOpen(false);
    setEditing(null);
  };

  const hasFilters = query !== "" || type !== "all" || category !== "all" || month !== "all";

  return (
    <div>
      <PageHeader
        title="Transactions"
        description={`${filtered.length} transactions · ${formatCurrency(totals.inc, currency)} in · ${formatCurrency(totals.exp, currency)} out`}
        action={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add transaction
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search merchants or notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Segmented
          options={[
            { value: "all", label: "All" },
            { value: "income", label: "Income" },
            { value: "expense", label: "Expenses" },
          ]}
          value={type}
          onChange={setType}
          className="w-full [&>button]:flex-1"
        />
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <div className="flex gap-2.5">
          <Select value={month} onChange={(e) => setMonth(e.target.value)} className="flex-1">
            <option value="all">All months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthKeyLabel(m)}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="flex-1">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="amount-desc">Amount ↓</option>
            <option value="amount-asc">Amount ↑</option>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <div className="mb-4 flex items-center gap-2">
          <Badge tone="violet">
            {type !== "all" ? type : "all"} · {category !== "all" ? CATEGORIES.find((c) => c.id === category)?.name : "any category"} ·{" "}
            {month !== "all" ? monthKeyLabel(month) : "any month"}
          </Badge>
          <button
            onClick={() => {
              setQuery("");
              setType("all");
              setCategory("all");
              setMonth("all");
            }}
            className="text-xs font-medium text-muted transition-colors hover:text-expense cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      <Card className="p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight className="h-5 w-5" />}
            title={hasFilters ? "Nothing matches your filters" : "No transactions yet"}
            description={hasFilters ? "Try widening your search or clearing filters." : "Add your first transaction to start tracking."}
            action={
              !hasFilters ? (
                <Button size="sm" onClick={openAdd}>
                  <Plus className="h-3.5 w-3.5" /> Add transaction
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="divide-y divide-border/60">
            <AnimatePresence initial={false}>
              {filtered.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  currency={currency}
                  onEdit={openEdit}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      <TransactionFormDialog open={formOpen} onClose={() => setFormOpen(false)} editing={editing} onSubmit={onSubmit} />
    </div>
  );
}