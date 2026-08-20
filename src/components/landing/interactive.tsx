"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, PieChart, Wallet, Sparkles, Plus, Send } from "lucide-react";
import { Section } from "@/components/landing/sections";
import { CashflowChart, CategoryDonut } from "@/components/charts";
import { freshDemoData } from "@/lib/seed";
import { monthTotals, categoryTotals, trendSeries, currentMonthKey } from "@/lib/analytics";
import { formatCurrency, monthKeyLabel } from "@/lib/format";
import { autoCategorize, EXPENSE_CATEGORIES } from "@/lib/categories";
import { uid } from "@/lib/utils";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: PieChart },
  { id: "budgets", label: "Budgets", icon: Wallet },
  { id: "copilot", label: "Copilot", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function InteractiveDemo() {
  const seed = useMemo(() => freshDemoData(), []);
  const [txs, setTxs] = useState<Transaction[]>(seed.transactions);
  const [tab, setTab] = useState<TabId>("overview");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [copilotOpen, setCopilotOpen] = useState(false);

  const currency = "USD";
  const month = currentMonthKey();

  const totals = useMemo(() => monthTotals(txs, month), [txs, month]);
  const cats = useMemo(() => categoryTotals(txs, month, "expense"), [txs, month]);
  const trend = useMemo(() => trendSeries(txs, 6), [txs]);

  const addExpense = () => {
    const amt = parseFloat(amount);
    const name = merchant.trim();
    if (!amt || amt <= 0 || name.length < 2) return;
    const tx: Transaction = {
      id: uid("demo"),
      type: "expense",
      amount: Math.round(amt * 100) / 100,
      merchant: name,
      categoryId: autoCategorize(name),
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    setTxs((prev) => [tx, ...prev]);
    setMerchant("");
    setAmount("");
  };

  return (
    <Section
      id="demo"
      eyebrow="Interactive demo"
      title={
        <>
          Play with it <span className="text-gradient">before you sign up.</span>
        </>
      }
      subtitle="This is real Lumen, pre-loaded with a month of realistic data. Add an expense — watch the charts react."
    >
      <div className="mx-auto max-w-4xl">
        <div className="glass-strong overflow-hidden rounded-3xl shadow-glass">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                    tab === t.id ? "bg-primary/15 text-primary" : "text-muted hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
            <span className="hidden rounded-full bg-income/10 px-2.5 py-1 text-[10px] font-semibold text-income sm:block">
              Live demo data
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {tab === "overview" && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2 rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted">Cash flow · last 6 months</p>
                        <span className="text-[10px] text-muted">{monthKeyLabel(month)}</span>
                      </div>
                      <CashflowChart data={trend} currency={currency} height={210} />
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-border bg-surface p-4">
                        <p className="text-xs font-semibold text-muted">This month</p>
                        <p className="mt-2 font-display text-xl font-semibold text-ink">{formatCurrency(totals.net, currency)}</p>
                        <p className="text-[10px] text-muted">net after {formatCurrency(totals.expenses, currency)} spend</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface p-4">
                        <p className="text-xs font-semibold text-muted">Savings rate</p>
                        <p className="mt-2 font-display text-xl font-semibold text-primary">
                          {totals.income > 0 ? Math.round((totals.net / totals.income) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "analytics" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-surface p-4">
                      <p className="text-xs font-semibold text-muted">Spending by category</p>
                      <CategoryDonut
                        data={cats.slice(0, 6).map((c) => ({ name: c.name, value: c.amount, color: c.color }))}
                        currency={currency}
                        height={210}
                      />
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-4">
                      <p className="mb-3 text-xs font-semibold text-muted">Breakdown</p>
                      <div className="space-y-2.5">
                        {cats.slice(0, 5).map((c, i) => (
                          <div key={c.categoryId} className="flex items-center gap-2.5">
                            <span className="w-4 text-[10px] font-semibold text-muted">{i + 1}</span>
                            <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                            <span className="flex-1 text-xs text-ink">{c.name}</span>
                            <span className="text-xs font-medium tabular-nums text-ink">{formatCurrency(c.amount, currency)}</span>
                            <span className="w-9 text-right text-[10px] text-muted">{c.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tab === "budgets" && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { name: "Overall", used: 82, amount: 4200, spent: 3444, color: "#f59e0b" },
                      { name: "Food & Dining", used: 96, amount: 640, spent: 614, color: "#f43f5e" },
                      { name: "Transport", used: 61, amount: 320, spent: 195, color: "#38bdf8" },
                    ].map((b) => (
                      <div key={b.name} className="rounded-2xl border border-border bg-surface p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-ink">{b.name}</p>
                          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold" style={{ color: b.color }}>
                            {b.used}%
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: b.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${b.used}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <p className="mt-2 text-[10px] text-muted">
                          {formatCurrency(b.spent, currency)} of {formatCurrency(b.amount, currency)}
                        </p>
                      </div>
                    ))}
                    <div className="rounded-2xl border border-dashed border-border p-4 text-center text-[11px] text-muted sm:col-span-3">
                      ⚠️ Food & Dining is at 96% — Lumen will nudge you at 80% so this never sneaks up on you.
                    </div>
                  </div>
                )}

                {tab === "copilot" && (
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="space-y-2.5">
                      {[
                        {
                          role: "user" as const,
                          text: "Can I afford a $1,200 laptop this month?",
                        },
                        {
                          role: "assistant" as const,
                          text: "Yes — you can. Your month-end surplus projects to $1,820 and your remaining budget is $756, covering the $1,200 with room to spare. 💻",
                        },
                      ].map((m, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.4 }}
                          className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed", m.role === "user" ? "ml-auto rounded-tr-sm bg-primary text-white" : "rounded-tl-sm bg-surface-2 text-ink")}
                        >
                          {m.text}
                        </motion.div>
                      ))}
                      {copilotOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface-2 px-4 py-2.5 text-xs leading-relaxed text-ink"
                        >
                          Good question! Your biggest category this month is <b>Food & Dining</b> at{" "}
                          <b>{formatCurrency(cats[0]?.amount ?? 0, currency)}</b> — a 14% jump. Trimming delivery
                          orders alone could recover ~$60. Want a full plan?
                        </motion.div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <input
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        placeholder="Ask anything… e.g. “Where did I spend most?”"
                        className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-3.5 text-xs outline-none transition-colors focus:border-primary/60"
                      />
                      <button
                        onClick={() => {
                          if (merchant.trim()) {
                            setMerchant("");
                            setCopilotOpen(true);
                          }
                        }}
                        aria-label="Send"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-transform active:scale-95 cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-border bg-surface/40 p-4 sm:px-6">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <input
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addExpense()}
                placeholder="Add a real expense, e.g. “Starbucks”"
                className="h-10 flex-1 rounded-xl border border-border bg-surface px-3.5 text-xs outline-none transition-colors focus:border-primary/60"
              />
              <div className="flex gap-2">
                <select
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10 w-24 rounded-xl border border-border bg-surface px-2 text-xs outline-none"
                >
                  <option value="">Amount</option>
                  {["8.5", "14", "25", "48", "90"].map((a) => (
                    <option key={a} value={a}>
                      ${a}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addExpense}
                  className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-medium text-white transition-transform active:scale-95 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-muted">
              Try it: add “Starbucks” and watch Food & Dining and the totals update everywhere. Category is detected automatically.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}