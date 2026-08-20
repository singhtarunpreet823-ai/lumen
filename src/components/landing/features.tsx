"use client";

import {
  Sparkles, Tag, Wallet, Target, TrendingUp, ShieldCheck, Smartphone, BellRing, Utensils,
  ShoppingCart, Car, ShoppingBag, Clapperboard,
} from "lucide-react";
import { Section, BentoCard } from "@/components/landing/sections";

const chipData = [
  { icon: Utensils, label: "Food & Dining", color: "#f59e0b", amount: "$312", pct: 72 },
  { icon: ShoppingCart, label: "Groceries", color: "#84cc16", amount: "$186", pct: 55 },
  { icon: Car, label: "Transport", color: "#38bdf8", amount: "$94", pct: 40 },
  { icon: ShoppingBag, label: "Shopping", color: "#e879f9", amount: "$41", pct: 30 },
  { icon: Clapperboard, label: "Entertainment", color: "#c084fc", amount: "$27", pct: 22 },
];

export function Features() {
  return (
    <Section
      id="features"
      eyebrow="Features"
      title={
        <>
          Everything you need. <span className="text-gradient">Nothing you don't.</span>
        </>
      }
      subtitle="A calm, minimal workspace that quietly handles the busywork — so you can focus on the decisions that matter."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BentoCard className="sm:col-span-2 lg:row-span-2">
          <div className="flex h-full flex-col">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Tag className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold text-ink">Auto-categorization</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Every transaction is classified instantly using smart keyword matching. "Starbucks" lands in Food &
              Dining, "Shell Gas" in Transport — no manual filing, ever.
            </p>
            <div className="mt-6 flex-1 space-y-2.5">
              {chipData.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface/60 px-3.5 py-2.5"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: `${c.color}1f`, color: c.color }}
                  >
                    <c.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-ink">{c.label}</p>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-ink">{c.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </BentoCard>

        <BentoCard>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-expense/15 text-expense">
            <BellRing className="h-5 w-5" />
          </span>
          <h3 className="mt-5 font-display text-lg font-semibold text-ink">Budget alerts</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Set monthly limits and get nudged at 80% — before the receipt becomes a problem.
          </p>
        </BentoCard>

        <BentoCard>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Sparkles className="h-5 w-5" />
          </span>
          <h3 className="mt-5 font-display text-lg font-semibold text-ink">AI Copilot</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            "Can I afford this?" — get a verdict backed by your cash flow, projections and budget.
          </p>
        </BentoCard>

        <BentoCard>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning/15 text-warning">
            <TrendingUp className="h-5 w-5" />
          </span>
          <h3 className="mt-5 font-display text-lg font-semibold text-ink">Interactive analytics</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Monthly trends, category breakdowns, projections and savings-rate tracking.
          </p>
        </BentoCard>

        <BentoCard>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-500">
            <Target className="h-5 w-5" />
          </span>
          <h3 className="mt-5 font-display text-lg font-semibold text-ink">Savings goals</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Emergency fund, Japan trip, new laptop — watch progress fill up with every contribution.
          </p>
        </BentoCard>

        <BentoCard className="sm:col-span-2">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex-1">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-income/15 text-income">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">Private by design</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Row-level security on every table, encrypted in transit and at rest. Your money data is yours alone —
                we never sell it, and the copilot reads only what you own.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["RLS", "TLS 1.3", "AES-256", "SOC 2 ready"].map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-border bg-surface-2 px-3.5 py-1.5 font-mono text-xs text-muted"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </BentoCard>

        <BentoCard className="sm:col-span-2 lg:col-span-4">
          <div className="flex flex-col items-center gap-8 lg:flex-row">
            <div className="flex-1 lg:pl-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400">
                <Smartphone className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">Beautiful on every screen</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                The same calm, frosted-glass experience on desktop, tablet and phone. Log an expense on the go, check
                your budgets from the bus, and ask the copilot anything — anywhere.
              </p>
            </div>
            <div className="flex items-end gap-3 pr-2">
              <div className="glass hidden w-36 rounded-t-3xl rounded-b-xl border-b-0 p-3 sm:block">
                <div className="mx-auto h-1 w-12 rounded-full bg-border" />
                <div className="mt-3 space-y-2">
                  {["Net", "Income", "Spending"].map((l) => (
                    <div key={l} className="rounded-lg bg-surface-2/80 px-2.5 py-1.5">
                      <p className="text-[9px] text-muted">{l}</p>
                      <p className="text-[11px] font-semibold text-ink">$6.8k</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[10px] font-medium text-primary">
                  Budget on track ✓
                </div>
              </div>
              <div className="glass rounded-t-3xl rounded-b-xl border-b-0 p-4 sm:w-52">
                <div className="mx-auto h-1.5 w-16 rounded-full bg-border" />
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs font-semibold text-ink">Copilot</p>
                  <span className="h-2 w-2 rounded-full bg-income" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="ml-auto w-4/5 rounded-xl rounded-tr-sm bg-primary px-3 py-2 text-[10px] text-white">
                    Can I afford a $1,200 laptop?
                  </div>
                  <div className="w-11/12 rounded-xl rounded-tl-sm bg-surface-2 px-3 py-2 text-[10px] text-ink">
                    Yes — your month-end surplus covers it with $600 to spare.
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-6 flex-1 rounded-lg bg-surface-2" />
                  <div className="h-6 w-6 rounded-lg bg-primary" />
                </div>
              </div>
            </div>
          </div>
        </BentoCard>
      </div>
    </Section>
  );
}