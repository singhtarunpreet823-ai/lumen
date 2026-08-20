"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Wallet, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared";
import { BudgetRadial } from "@/components/charts";
import { Button, Card, CardHeader, Progress, Select, Input, Label, FieldError, EmptyState, Badge } from "@/components/ui/primitives";
import { Dialog } from "@/components/ui/dialog";
import { useLumen, useProfile } from "@/lib/store";
import { budgetStatuses, lastNMonths, currentMonthKey } from "@/lib/analytics";
import { monthKeyFullLabel, monthKeyLabel, formatCurrency } from "@/lib/format";
import { getCategory, EXPENSE_CATEGORIES } from "@/lib/categories";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const schema = z.object({
  categoryId: z.string().min(1),
  amount: z.coerce.number().positive("Budget must be greater than 0").max(1_000_000, "That's a lot of budget"),
});

export default function BudgetsPage() {
  const profile = useProfile();
  const data = useLumen((s) => s.data);
  const setBudget = useLumen((s) => s.setBudget);
  const deleteBudget = useLumen((s) => s.deleteBudget);
  const currency = profile?.currency ?? "USD";

  const months = useMemo(() => lastNMonths(4).reverse(), []);
  const [month, setMonth] = useState(currentMonthKey());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<{ categoryId: string; amount: number } | null>(null);

  const statuses = useMemo(
    () => budgetStatuses(data.transactions, data.budgets, month),
    [data.transactions, data.budgets, month],
  );
  const overall = statuses.find((s) => s.budget.categoryId === "overall");
  const categoryBudgets = statuses.filter((s) => s.budget.categoryId !== "overall");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { categoryId: "food-dining", amount: undefined as unknown as number },
  });

  const openAdd = () => {
    setEditing(null);
    reset({ categoryId: "food-dining", amount: undefined as unknown as number });
    setDialogOpen(true);
  };

  const openEdit = (categoryId: string, amount: number) => {
    setEditing({ categoryId, amount });
    reset({ categoryId, amount });
    setDialogOpen(true);
  };

  const onSubmit = handleSubmit((values) => {
    if (editing) {
      setBudget(month, editing.categoryId, values.amount);
      toast.success("Budget updated");
    } else {
      setBudget(month, values.categoryId, values.amount);
      toast.success("Budget created");
    }
    setDialogOpen(false);
    setEditing(null);
  });

  const existing = useMemo(() => new Set(categoryBudgets.map((s) => s.budget.categoryId)), [categoryBudgets]);
  const availableCategories = EXPENSE_CATEGORIES.filter((c) => !existing.has(c.id));

  const warningCount = categoryBudgets.filter((s) => s.warning).length;
  const overCount = categoryBudgets.filter((s) => s.over).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description={`Monthly limits that keep you honest — ${overCount > 0 ? `${overCount} exceeded` : warningCount > 0 ? `${warningCount} close to the line` : "all on track"} this month.`}
        action={
          <div className="flex items-center gap-2">
            <Select value={month} onChange={(e) => setMonth(e.target.value)} className="w-36">
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthKeyFullLabel(m)}
                </option>
              ))}
            </Select>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add budget
            </Button>
          </div>
        }
      />

      {overall && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="w-48 shrink-0">
                <BudgetRadial
                  value={overall.pct}
                  label={`of ${formatCurrency(overall.budget.amount, currency)}`}
                  color={overall.over ? "#f43f5e" : overall.warning ? "#f59e0b" : "#8b5cf6"}
                  height={200}
                />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted">Overall monthly budget</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-ink">
                    {formatCurrency(overall.spent, currency)}{" "}
                    <span className="text-base font-normal text-muted">of {formatCurrency(overall.budget.amount, currency)}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={overall.over ? "red" : overall.warning ? "amber" : "green"}>
                    {overall.over ? "Over budget" : overall.warning ? `${overall.pct}% used` : "On track"}
                  </Badge>
                  <Badge tone="slate">
                    {overall.remaining >= 0
                      ? `${formatCurrency(overall.remaining, currency)} remaining`
                      : `${formatCurrency(-overall.remaining, currency)} over`}
                  </Badge>
                </div>
                <p className="text-sm text-muted">
                  {overall.over
                    ? "You've blown the overall budget — the copilot can help you find where to claw it back."
                    : overall.warning
                      ? "Approaching the limit. The next 20% of spend should go to savings."
                      : "Healthy pace for the month. Keep it up."}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted">
          Category budgets · {monthKeyLabel(month)}
        </h2>
        {categoryBudgets.length === 0 ? (
          <EmptyState
            icon={<Wallet className="h-5 w-5" />}
            title="No category budgets yet"
            description="Set limits for food, transport, shopping and more — Lumen will alert you before you blow them."
            action={
              <Button size="sm" onClick={openAdd}>
                <Plus className="h-3.5 w-3.5" /> Create budget
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categoryBudgets.map((s, i) => {
              const cat = getCategory(s.budget.categoryId);
              return (
                <motion.div
                  key={s.budget.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card group relative p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-sm font-semibold text-ink">{cat.name}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatCurrency(s.spent, currency)} of {formatCurrency(s.budget.amount, currency)}
                      </p>
                    </div>
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: `${cat.color}1f`, color: cat.color }}
                    >
                      <span className="text-base font-bold">{s.pct}%</span>
                    </span>
                  </div>
                  <div className="mt-4">
                    <Progress value={s.pct} tone={s.over ? "danger" : s.warning ? "warning" : "default"} className="h-2.5" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs font-medium ${s.over ? "text-expense" : s.warning ? "text-warning" : "text-muted"}`}>
                      {s.over
                        ? `${formatCurrency(-s.remaining, currency)} over`
                        : `${formatCurrency(s.remaining, currency)} left`}
                    </span>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(s.budget.categoryId, s.budget.amount)}
                        aria-label={`Edit ${cat.name} budget`}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          deleteBudget(month, s.budget.categoryId);
                          toast.success(`${cat.name} budget removed`);
                        }}
                        aria-label={`Delete ${cat.name} budget`}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-expense cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit budget" : "New budget"}
        description={editing ? `Adjust the ${getCategory(editing.categoryId).name} limit.` : "Pick a category and set a monthly limit."}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {!editing && (
            <div>
              <Label>Category</Label>
              <Select {...register("categoryId")}>
                {availableCategories.length === 0 && <option value="">All categories have budgets</option>}
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div>
            <Label>Monthly limit</Label>
            <Input type="number" min="1" step="0.01" placeholder="e.g. 400" autoFocus {...register("amount")} />
            <FieldError message={errors.amount?.message} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save" : "Create budget"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}