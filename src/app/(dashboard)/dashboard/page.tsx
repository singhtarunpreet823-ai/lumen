"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, ArrowUpRight, Wallet, AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";
import { StatCard, PageHeader, TransactionRow, DeltaPill } from "@/components/dashboard/shared";
import { TransactionFormDialog } from "@/components/dashboard/transaction-form";
import { CashflowChart, CategoryDonut, BudgetRadial } from "@/components/charts";
import { Button, Card, CardHeader, Progress, EmptyState } from "@/components/ui/primitives";
import { useLumen, useProfile } from "@/lib/store";
import { categoryTotals, computeAlerts, trendSeries, budgetStatuses, monthTotals, currentMonthKey, previousMonthKey } from "@/lib/analytics";
import { monthKeyLabel, greeting, formatCurrency } from "@/lib/format";
import { getCategory } from "@/lib/categories";
import { monthDeltaNote } from "@/lib/ai/engine";
import { toast } from "sonner";

export default function DashboardPage() {
  const profile = useProfile();
  const data = useLumen((s) => s.data);
  const addTransaction = useLumen((s) => s.addTransaction);
  const [formOpen, setFormOpen] = useState(false);

  const month = currentMonthKey();
  const prev = previousMonthKey();
  const currency = profile?.currency ?? "USD";

  const totals = useMemo(() => monthTotals(data.transactions, month), [data.transactions, month]);
  const prevTotals = useMemo(() => monthTotals(data.transactions, prev), [data.transactions, prev]);
  const cats = useMemo(() => categoryTotals(data.transactions, month, "expense"), [data.transactions, month]);
  const trend = useMemo(() => trendSeries(data.transactions, 6), [data.transactions]);
  const alerts = useMemo(() => computeAlerts(data.transactions, data.budgets, data.goals, month), [data.transactions, data.budgets, data.goals, month]);
  const budgets = useMemo(() => budgetStatuses(data.transactions, data.budgets, month), [data.transactions, data.budgets, month]);
  const recent = useMemo(() => data.transactions.slice(0, 6), [data.transactions]);
  const insight = useMemo(() => monthDeltaNote(data.transactions, currency), [data.transactions, currency]);

  const savingsRate = totals.income > 0 ? Math.round((totals.net / totals.income) * 100) : 0;
  const expenseDelta = Math.round(totals.expenses - prevTotals.expenses);
  const incomeDelta = Math.round(totals.income - prevTotals.income);

  const onAdd = (values: { type: "income" | "expense"; amount: number; merchant: string; categoryId: string; date: string; note?: string; recurring?: boolean }) => {
    addTransaction({
      type: values.type,
      amount: values.amount,
      merchant: values.merchant,
      date: values.date,
      categoryId: values.categoryId,
      note: values.note,
      recurring: values.recurring,
    });
    setFormOpen(false);
    toast.success("Transaction added");
  };

  const overallBudget = budgets.find((b) => b.budget.categoryId === "overall");

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${profile?.name?.split(" ")[0] ?? "there"} 👋`}
        description={`Here's your ${monthKeyLabel(month)} snapshot.`}
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Add transaction
          </Button>
        }
      />

      {alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {alerts.slice(0, 2).map((a) => (
            <Link key={a.id} href={a.link ?? "/dashboard"} className="group">
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass flex items-center gap-3 rounded-2xl px-4 py-3"
              >
                {a.severity === "danger" ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-expense" />
                ) : a.severity === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-income" />
                ) : (
                  <Info className="h-4 w-4 shrink-0 text-warning" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{a.title}</p>
                  <p className="truncate text-xs text-muted">{a.message}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Net this month"
          value={formatCurrency(totals.net, currency)}
          delta={Math.round(totals.net - prevTotals.net)}
          deltaLabel="vs last month"
          icon={<Wallet className="h-4 w-4" />}
          tone="accent"
          spark={trend.map((p) => p.net)}
          delay={0}
        />
        <StatCard
          label="Income"
          value={formatCurrency(totals.income, currency)}
          delta={incomeDelta}
          deltaLabel="vs last month"
          icon={<ArrowUpRight className="h-4 w-4" />}
          tone="income"
          spark={trend.map((p) => p.income)}
          delay={0.05}
        />
        <StatCard
          label="Spending"
          value={formatCurrency(totals.expenses, currency)}
          delta={-expenseDelta}
          deltaLabel="vs last month"
          icon={<Sparkles className="h-4 w-4" />}
          tone="expense"
          spark={trend.map((p) => p.expenses)}
          delay={0.1}
        />
        <StatCard
          label="Savings rate"
          value={`${savingsRate}%`}
          delta={Math.round(savingsRate - (prevTotals.income > 0 ? (prevTotals.net / prevTotals.income) * 100 : 0))}
          deltaLabel="vs last month"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="default"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHeader
            title="Cash flow"
            subtitle="Last 6 months"
            action={
              <Link href="/analytics" className="text-xs font-medium text-primary hover:underline">
                Full analytics →
              </Link>
            }
          />
          <div className="mt-4">
            <CashflowChart data={trend} currency={currency} height={260} />
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Spending by category" subtitle={monthKeyLabel(month)} />
          {cats.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted">No expenses yet this month.</div>
          ) : (
            <>
              <div className="mt-2">
                <CategoryDonut
                  data={cats.slice(0, 6).map((c) => ({ name: c.name, value: c.amount, color: c.color }))}
                  currency={currency}
                  height={220}
                  centerLabel="Spent"
                />
              </div>
              <div className="mt-3 space-y-1.5">
                {cats.slice(0, 4).map((c) => (
                  <div key={c.categoryId} className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} />
                    <span className="flex-1 truncate text-muted">{c.name}</span>
                    <span className="font-medium text-ink">{formatCurrency(c.amount, currency)}</span>
                    <span className="w-9 text-right text-xs text-muted">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <CardHeader
            title="Monthly budget"
            subtitle={overallBudget ? `${overallBudget.pct}% used` : "No overall budget set"}
            action={
              <Link href="/budgets" className="text-xs font-medium text-primary hover:underline">
                Manage →
              </Link>
            }
          />
          <div className="mt-4">
            {overallBudget ? (
              <>
                <BudgetRadial
                  value={overallBudget.pct}
                  label={`${formatCurrency(overallBudget.spent, currency)} of ${formatCurrency(overallBudget.budget.amount, currency)}`}
                  color={overallBudget.over ? "#f43f5e" : overallBudget.warning ? "#f59e0b" : "#8b5cf6"}
                  height={190}
                />
                <p className={`mt-1 text-center text-sm ${overallBudget.over ? "text-expense" : overallBudget.warning ? "text-warning" : "text-muted"}`}>
                  {overallBudget.over
                    ? `${formatCurrency(overallBudget.remaining, currency)} over budget`
                    : `${formatCurrency(overallBudget.remaining, currency)} remaining`}
                </p>
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted">
                Set an overall monthly budget in the Budgets page to see progress here.
              </p>
            )}
          </div>
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            {budgets.filter((b) => b.budget.categoryId !== "overall").slice(0, 3).map((b) => (
              <div key={b.budget.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-ink">{getCategory(b.budget.categoryId).name}</span>
                  <span className="text-muted">
                    {formatCurrency(b.spent, currency)} / {formatCurrency(b.budget.amount, currency)}
                  </span>
                </div>
                <Progress
                  value={b.pct}
                  tone={b.over ? "danger" : b.warning ? "warning" : "default"}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <CardHeader
            title="Recent transactions"
            action={
              <Link href="/transactions" className="text-xs font-medium text-primary hover:underline">
                View all →
              </Link>
            }
          />
          <div className="mt-3">
            {recent.length === 0 ? (
              <EmptyState
                icon={<Wallet className="h-5 w-5" />}
                title="No transactions yet"
                description="Add your first transaction or explore the demo."
                action={
                  <Button size="sm" onClick={() => setFormOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> Add one
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-border/60">
                {recent.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} currency={currency} />
                ))}
              </div>
            )}
          </div>

          {insight && (
            <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                <Sparkles className="h-3.5 w-3.5" /> AI insight
              </div>
              <p className="mt-1.5 text-sm text-ink">{insight.text}</p>
              <Link href="/copilot" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
                Ask the copilot why →
              </Link>
            </div>
          )}
        </Card>
      </div>

      <TransactionFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSubmit={onAdd} />
    </div>
  );
}