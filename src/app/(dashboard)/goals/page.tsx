"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target, Trash2, PiggyBank, TrendingUp, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared";
import { Button, Card, Input, Label, FieldError, EmptyState, Progress, Select } from "@/components/ui/primitives";
import { Dialog } from "@/components/ui/dialog";
import { useLumen, useProfile } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/format";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const GOAL_COLORS = ["#10b981", "#8b5cf6", "#f472b6", "#38bdf8", "#f59e0b", "#f43f5e"];
const GOAL_ICONS = ["target", "shield", "plane", "laptop", "home", "gift"];

const schema = z.object({
  name: z.string().min(2, "Give your goal a name").max(60),
  target: z.coerce.number().positive("Target must be greater than 0").max(100_000_000),
  deadline: z.string().optional(),
  color: z.string(),
  icon: z.string(),
});

const contributeSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
});

export default function GoalsPage() {
  const profile = useProfile();
  const goals = useLumen((s) => s.data.goals);
  const transactions = useLumen((s) => s.data.transactions);
  const addGoal = useLumen((s) => s.addGoal);
  const contributeToGoal = useLumen((s) => s.contributeToGoal);
  const withdrawFromGoal = useLumen((s) => s.withdrawFromGoal);
  const deleteGoal = useLumen((s) => s.deleteGoal);
  const currency = profile?.currency ?? "USD";

  const [createOpen, setCreateOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<string | null>(null);

  const totalSaved = useMemo(() => goals.reduce((s, g) => s + g.saved, 0), [goals]);
  const avgPct = useMemo(
    () => (goals.length ? Math.round(goals.reduce((s, g) => s + (g.saved / g.target) * 100, 0) / goals.length) : 0),
    [goals],
  );

  const thisMonthNet = useMemo(() => {
    const key = new Date().toISOString().slice(0, 7);
    let inc = 0, exp = 0;
    for (const t of transactions) {
      if (!t.date.startsWith(key)) continue;
      if (t.type === "income") inc += t.amount;
      else exp += t.amount;
    }
    return inc - exp;
  }, [transactions]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", target: undefined as unknown as number, deadline: "", color: GOAL_COLORS[0], icon: "target" },
  });
  const watchColor = watch("color");

  const contributeForm = useForm<z.infer<typeof contributeSchema>>({
    resolver: zodResolver(contributeSchema),
    defaultValues: { amount: 100 },
  });

  const onCreate = handleSubmit((values) => {
    addGoal({ ...values, saved: 0 });
    toast.success(`Goal "${values.name}" created`);
    setCreateOpen(false);
    reset();
  });

  const onContribute = contributeForm.handleSubmit((values) => {
    if (!activeGoal) return;
    contributeToGoal(activeGoal, values.amount);
    const g = goals.find((x) => x.id === activeGoal);
    if (g && g.saved + values.amount >= g.target) toast.success("Goal reached! 🎉");
    else toast.success("Contribution added");
    setActiveGoal(null);
    contributeForm.reset({ amount: 100 });
  });

  const active = goals.find((g) => g.id === activeGoal);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings goals"
        description={`${formatCurrency(totalSaved, currency)} saved across ${goals.length || "no"} goals · ${avgPct}% complete on average`}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={<Target className="h-5 w-5" />}
          title="Nothing saved yet"
          description="Goals turn vague wishes into deadlines. Emergency fund, a trip, a new laptop — start one."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Create your first goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((g, i) => {
            const pct = Math.round((g.saved / g.target) * 100);
            const remaining = Math.max(0, g.target - g.saved);
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card group relative overflow-hidden p-5"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-15 blur-2xl"
                  style={{ background: g.color }}
                />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-lg"
                      style={{ background: `${g.color}1f`, color: g.color }}
                    >
                      {g.icon === "plane" ? "✈️" : g.icon === "shield" ? "🛡️" : g.icon === "laptop" ? "💻" : g.icon === "home" ? "🏠" : g.icon === "gift" ? "🎁" : "🎯"}
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-ink">{g.name}</p>
                      <p className="text-xs text-muted">
                        {g.deadline ? `Due ${formatDate(g.deadline, "short")}` : "No deadline"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      deleteGoal(g.id);
                      toast.success("Goal removed");
                    }}
                    aria-label={`Delete ${g.name}`}
                    className="rounded-lg p-1.5 text-muted opacity-0 transition-all hover:bg-surface-2 hover:text-expense group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="font-display text-2xl font-semibold tabular-nums text-ink">{formatCurrency(g.saved, currency)}</p>
                    <p className="text-xs text-muted">of {formatCurrency(g.target, currency)} target</p>
                  </div>
                  <span className="font-display text-xl font-semibold" style={{ color: g.color }}>
                    {pct}%
                  </span>
                </div>

                <div className="mt-3">
                  <Progress value={pct} className="h-2.5" barClassName="!bg-none" tone={pct >= 100 ? "success" : "default"} />
                  <div
                    className="-mt-2.5 h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      background: `linear-gradient(90deg, ${g.color}cc, ${g.color})`,
                      transition: "width .7s cubic-bezier(.16,1,.3,1)",
                    }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted">
                    {pct >= 100 ? "Funded — celebrate! 🎉" : `${formatCurrency(remaining, currency)} to go`}
                  </p>
                  <Button size="sm" variant="secondary" onClick={() => setActiveGoal(g.id)} disabled={pct >= 100}>
                    <PiggyBank className="h-3.5 w-3.5" /> Contribute
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {goals.length > 0 && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-income/10 text-income">
                <PiggyBank className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted">This month's surplus available to save</p>
                <p className="font-display text-xl font-semibold text-ink">{formatCurrency(Math.max(0, thisMonthNet), currency)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted">Average progress</p>
                <p className="font-display text-xl font-semibold text-ink">{avgPct}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted">Next goal to finish</p>
                <p className="font-display text-xl font-semibold text-ink">
                  {goals.sort((a, b) => b.saved / b.target - a.saved / a.target)[0]?.name ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="New savings goal" description="Name it, size it, and set a deadline.">
        <form onSubmit={onCreate} className="space-y-4">
          <div>
            <Label>Goal name</Label>
            <Input placeholder="e.g. Emergency fund" autoFocus {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Target amount</Label>
              <Input type="number" min="1" step="0.01" placeholder="5000" {...register("target")} />
              <FieldError message={errors.target?.message} />
            </div>
            <div>
              <Label>Deadline (optional)</Label>
              <Input type="date" {...register("deadline")} />
            </div>
          </div>
          <div>
            <Label>Accent</Label>
            <div className="flex flex-wrap gap-2">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("color", c)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform hover:scale-110 cursor-pointer",
                    c === watchColor ? "border-ink" : "border-transparent",
                  )}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: "rgba(255,255,255,0.85)" }} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Icon</Label>
            <Select {...register("icon")}>
              {GOAL_ICONS.map((i) => (
                <option key={i} value={i}>
                  {i === "plane" ? "✈️ Plane" : i === "shield" ? "🛡️ Shield" : i === "laptop" ? "💻 Laptop" : i === "home" ? "🏠 Home" : i === "gift" ? "🎁 Gift" : "🎯 Target"}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create goal</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={Boolean(active)}
        onClose={() => setActiveGoal(null)}
        title={`Contribute to ${active?.name ?? ""}`}
        description={`${formatCurrency(active?.saved ?? 0, currency)} of ${formatCurrency(active?.target ?? 0, currency)} saved so far.`}
      >
        <form onSubmit={onContribute} className="space-y-4">
          <div>
            <Label>Amount</Label>
            <Input type="number" min="0.01" step="0.01" autoFocus {...contributeForm.register("amount")} />
            <FieldError message={contributeForm.formState.errors.amount?.message} />
          </div>
          <div className="flex flex-wrap gap-2">
            {[50, 100, 250, 500].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => contributeForm.setValue("amount", a)}
                className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary cursor-pointer"
              >
                +{formatCurrency(a, currency)}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setActiveGoal(null)}>
              Cancel
            </Button>
            <Button type="submit">
              <PiggyBank className="h-4 w-4" /> Contribute
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}