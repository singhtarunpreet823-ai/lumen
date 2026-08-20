"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Wallet, ShieldCheck, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { freshDemoData } from "@/lib/seed";
import { CashflowChart, CategoryDonut } from "@/components/charts";
import { formatCurrency, formatDate, greeting } from "@/lib/format";
import { monthTotals, categoryTotals, trendSeries, currentMonthKey } from "@/lib/analytics";

const HeroScene = dynamic(() => import("./hero-scene").then((m) => m.HeroScene), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0">
      <div className="h-full w-full bg-[radial-gradient(800px_circle_at_50%_60%,rgb(16_185_129/0.12),transparent_60%)]" />
    </div>
  ),
});

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const previewY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={sectionRef} className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(700px circle at 15% 15%, rgb(16 185 129 / 0.13), transparent 55%), radial-gradient(800px circle at 85% 25%, rgb(139 92 246 / 0.15), transparent 55%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 opacity-80">
        <HeroScene />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg" />

      {/* Copy */}
      <motion.div
        style={{ opacity: copyOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 pt-32 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-ink"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Meet your AI financial copilot — now live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-6xl lg:text-7xl"
        >
          Understand your money.
          <br />
          <span className="text-gradient">Build your future.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
        >
          Lumen tracks every dollar, auto-categorizes your spending, and gives you a copilot that answers questions
          about your money — with the charts to prove it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Sparkles className="h-4 w-4 text-accent" />
              Try the live demo
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-income" /> Bank-grade security
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-income" /> Free forever plan
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-income" /> No credit card required
          </span>
        </motion.div>
      </motion.div>

      {/* Dashboard preview */}
      <motion.div
        style={{ y: previewY }}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-10"
      >
        <DashboardPreview />
      </motion.div>
    </section>
  );
}

function DashboardPreview() {
  const demo = useMemo(() => freshDemoData(), []);
  const currency = demo.profile?.currency ?? "USD";
  const month = currentMonthKey();
  const totals = useMemo(() => monthTotals(demo.transactions, month), [demo, month]);
  const cats = useMemo(() => categoryTotals(demo.transactions, month, "expense").slice(0, 5), [demo, month]);
  const trend = useMemo(() => trendSeries(demo.transactions, 6), [demo]);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-emerald-500/20 via-violet-500/20 to-fuchsia-500/20 blur-3xl"
      />
      <div className="glass-strong relative overflow-hidden rounded-3xl shadow-glass">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-expense/70" />
            <span className="h-3 w-3 rounded-full bg-warning/70" />
            <span className="h-3 w-3 rounded-full bg-income/70" />
          </div>
          <p className="hidden text-xs font-medium text-muted sm:block">
            {greeting()}, {demo.profile?.name?.split(" ")[0]} — your money, decoded
          </p>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-income/10 px-2 py-0.5 text-[10px] font-semibold text-income">+2.4%</span>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white"
              aria-label="Add transaction"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Income" value={formatCurrency(totals.income, currency, { compact: true })} tone="#10b981" />
              <MiniStat label="Spending" value={formatCurrency(totals.expenses, currency, { compact: true })} tone="#f43f5e" />
              <MiniStat label="Net" value={formatCurrency(totals.net, currency, { compact: true })} tone="#8b5cf6" />
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="mb-2 text-xs font-semibold text-muted">Cash flow — last 6 months</p>
              <CashflowChart data={trend} currency={currency} height={190} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="mb-1 text-xs font-semibold text-muted">Where it goes</p>
              <CategoryDonut data={cats.map((c) => ({ name: c.name, value: c.amount, color: c.color }))} currency={currency} height={150} centerLabel="Spent" />
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="mb-2 text-xs font-semibold text-muted">Recent</p>
              <div className="space-y-1.5">
                {demo.transactions.filter((t) => t.date.startsWith(month)).slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-ink">{t.merchant}</span>
                    <span className={t.type === "income" ? "font-medium text-income" : "font-medium text-ink"}>
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount, currency, { compact: true })}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted">Updated {formatDate(new Date().toISOString(), "short")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chips */}
      <motion.div
        className="glass-strong absolute -left-4 top-24 hidden rounded-2xl px-4 py-3 shadow-glass md:block lg:-left-12"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-income/15 text-income">
            <Wallet className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] text-muted">Saved this month</p>
            <p className="text-sm font-semibold text-ink">{formatCurrency(Math.max(0, totals.net), currency, { compact: true })}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="glass-strong absolute -right-4 bottom-24 hidden rounded-2xl px-4 py-3 shadow-glass md:block lg:-right-12"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] text-muted">Copilot says</p>
            <p className="max-w-[140px] truncate text-sm font-semibold text-ink">Food & dining up 14% 📈</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold tabular-nums" style={{ color: tone }}>
        {value}
      </p>
    </div>
  );
}