"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, CalendarRange, TrendingUp, PiggyBank } from "lucide-react";
import { PageHeader, StatCard, DeltaPill } from "@/components/dashboard/shared";
import { CashflowChart, CategoryBars, CategoryDonut, Sparkline } from "@/components/charts";
import { Card, CardHeader, Segmented, Select } from "@/components/ui/primitives";
import { useLumen, useProfile } from "@/lib/store";
import {
  categoryTotals,
  monthTotals,
  trendSeries,
  topMerchants,
  lastNMonths,
} from "@/lib/analytics";
import { projectedMonthEnd, discretionarySplit, savingsRate } from "@/lib/ai/analysis";
import { formatCurrency, monthKeyFullLabel, monthKeyLabel, daysInMonth } from "@/lib/format";

export default function AnalyticsPage() {
  const profile = useProfile();
  const transactions = useLumen((s) => s.data.transactions);
  const currency = profile?.currency ?? "USD";

  const months = useMemo(() => lastNMonths(8).reverse(), []);
  const [month, setMonth] = useState(months[months.length - 1]);
  const [range, setRange] = useState<"6m" | "3m">("6m");

  const totals = useMemo(() => monthTotals(transactions, month), [transactions, month]);
  const cats = useMemo(() => categoryTotals(transactions, month, "expense"), [transactions, month]);
  const trend = useMemo(() => trendSeries(transactions, range === "6m" ? 6 : 3), [transactions, range]);
  const merchants = useMemo(() => topMerchants(transactions, month, 6), [transactions, month]);
  const proj = useMemo(() => projectedMonthEnd(transactions, month), [transactions, month]);
  const split = useMemo(() => discretionarySplit(transactions, month), [transactions, month]);
  const sr = useMemo(() => savingsRate(transactions, month), [transactions, month]);

  const topCat = cats[0];
  const daysElapsed = proj.dayOfMonth;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Dig into where your money goes."
        action={
          <div className="flex items-center gap-2">
            <Segmented
              options={[
                { value: "6m", label: "6 months" },
                { value: "3m", label: "3 months" },
              ]}
              value={range}
              onChange={setRange}
            />
            <Select value={month} onChange={(e) => setMonth(e.target.value)} className="w-36">
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthKeyFullLabel(m)}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Total spent"
          value={formatCurrency(totals.expenses, currency)}
          icon={<Flame className="h-4 w-4" />}
          tone="expense"
          delay={0}
        />
        <StatCard
          label="Avg / day"
          value={formatCurrency(Math.round(totals.expenses / Math.max(1, daysElapsed)), currency)}
          icon={<CalendarRange className="h-4 w-4" />}
          tone="default"
          delay={0.05}
        />
        <StatCard
          label="Projected month-end"
          value={formatCurrency(proj.projected, currency)}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="accent"
          delay={0.1}
        />
        <StatCard
          label="Savings rate"
          value={`${sr}%`}
          icon={<PiggyBank className="h-4 w-4" />}
          tone="income"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHeader title="Cash flow trend" subtitle={`${range === "6m" ? "6" : "3"}-month view of income vs expenses`} />
          <div className="mt-4">
            <CashflowChart data={trend} currency={currency} height={280} />
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Spending mix" subtitle={monthKeyFullLabel(month)} />
          {cats.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No spending recorded this month.</p>
          ) : (
            <>
              <div className="mt-2">
                <CategoryDonut data={cats.map((c) => ({ name: c.name, value: c.amount, color: c.color }))} currency={currency} height={200} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {cats.slice(0, 6).map((c) => (
                  <div key={c.categoryId} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} />
                    <span className="truncate text-muted">{c.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHeader
            title="Category breakdown"
            subtitle="Where your money went"
            action={topCat ? <DeltaPill value={0} /> : undefined}
          />
          <div className="mt-4">
            {cats.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">No data for this month.</p>
            ) : (
              <CategoryBars data={cats.slice(0, 8).map((c) => ({ name: c.name, value: c.amount, color: c.color }))} currency={currency} height={Math.max(220, cats.slice(0, 8).length * 42)} />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Top merchants" subtitle={monthKeyFullLabel(month)} />
          <div className="mt-4 space-y-3">
            {merchants.length === 0 && <p className="py-6 text-center text-sm text-muted">No merchants recorded.</p>}
            {merchants.map((m, i) => (
              <div key={m.merchant} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-semibold text-muted">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{m.merchant}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${Math.round((m.amount / (merchants[0]?.amount || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums text-ink">{formatCurrency(m.amount, currency)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader title="Discretionary vs essential" subtitle="A calmer view of your spending" />
          <div className="mt-4 flex items-center gap-6">
            <div className="w-1/2">
              <CategoryDonut
                data={[
                  { name: "Essential", value: split.essential, color: "#38bdf8" },
                  { name: "Discretionary", value: split.discretionary, color: "#f59e0b" },
                ]}
                currency={currency}
                height={200}
                centerLabel="Spending"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-muted">Essential (rent, food, bills…)</p>
                <p className="font-display text-lg font-semibold text-ink">{formatCurrency(split.essential, currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Discretionary (fun, shopping…)</p>
                <p className="font-display text-lg font-semibold text-ink">{formatCurrency(split.discretionary, currency)}</p>
              </div>
              <p className="text-xs leading-relaxed text-muted">
                {split.discretionary > split.essential
                  ? "You're spending more on wants than needs — the copilot has ideas to flip that."
                  : "Essentials dominate your spend — healthy balance."}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Insights" subtitle="Auto-generated from your data" />
          <div className="mt-4 space-y-3">
            {[
              {
                icon: <Flame className="h-4 w-4" />,
                color: "#f43f5e",
                title: topCat ? `Top category: ${topCat.name}` : "No category data yet",
                body: topCat
                  ? `${topCat.name} took ${topCat.pct}% of your ${monthKeyLabel(month)} spending (${formatCurrency(topCat.amount, currency)} across ${topCat.count} transactions).`
                  : "Add expenses to unlock insights.",
              },
              {
                icon: <TrendingUp className="h-4 w-4" />,
                color: "#8b5cf6",
                title: "Projection",
                body: `At your current pace you'll spend ~${formatCurrency(proj.projected, currency)} by end of ${monthKeyFullLabel(month)} — ${proj.projected > totals.expenses ? "more than" : "less than"} the ${daysInMonth(new Date(Number(month.split("-")[0]), Number(month.split("-")[1]) - 1, 1))}-day window suggests.`,
              },
              {
                icon: <PiggyBank className="h-4 w-4" />,
                color: "#10b981",
                title: "Savings rate",
                body: `You kept ${sr}% of income this month. ${sr >= 20 ? "Excellent — above the 20% rule of thumb." : sr >= 10 ? "Decent — try to nudge it above 20%." : "Low — ask the copilot for a reduction plan."}`,
              },
            ].map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex gap-3 rounded-xl border border-border/70 bg-surface-2/40 p-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${ins.color}1f`, color: ins.color }}>
                  {ins.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{ins.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{ins.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4">
            <p className="mb-1 text-xs text-muted">Net balance trend</p>
            <Sparkline data={trend.map((p) => p.net)} color="#10b981" height={48} />
          </div>
        </Card>
      </div>
    </div>
  );
}