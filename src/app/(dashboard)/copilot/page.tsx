"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, RotateCcw, Bot, User, TrendingUp, ArrowUpRight, Shield, Zap, Wallet, Copy,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/shared";
import { CashflowChart, CategoryDonut, CategoryBars, BudgetRadial } from "@/components/charts";
import { Button, Card, Input, Badge } from "@/components/ui/primitives";
import { useLumen, useProfile } from "@/lib/store";
import { runCopilot, SUGGESTED_QUESTIONS, quickStats, type CopilotChart, type CopilotResult } from "@/lib/ai/engine";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string[];
  chart?: CopilotChart;
  intent?: string;
}

const TYPEWRITER = {
  user: { icon: User, cls: "bg-surface-2 text-ink" },
  assistant: { icon: Bot, cls: "bg-gradient-to-br from-emerald-500 to-violet-600 text-white" },
};

export default function CopilotPage() {
  const profile = useProfile();
  const data = useLumen((s) => s.data);
  const currency = profile?.currency ?? "USD";
  const { theme } = useTheme();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ctx = useMemo(
    () => ({
      transactions: data.transactions,
      budgets: data.budgets,
      goals: data.goals.map((g) => ({ name: g.name, target: g.target, saved: g.saved, deadline: g.deadline, color: g.color })),
      currency,
    }),
    [data.transactions, data.budgets, data.goals, currency],
  );

  const stats = useMemo(() => quickStats(ctx), [ctx]);

  useEffect(() => {
    if (messages.length === 0) {
      setThinking(true);
      const t = setTimeout(() => {
        const welcome = runCopilot("hello", ctx);
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            text: [
              `Hi ${profile?.name?.split(" ")[0] ?? "there"} 👋 I'm your financial copilot. I can read your live data and answer questions like:`,
              "· Where did I spend the most this month?",
              "· Can I afford a $1,200 laptop?",
              "· How can I reduce my unnecessary spending?",
              ...welcome.text.slice(1),
            ],
            chart: welcome.chart,
            intent: welcome.intent,
          },
        ]);
        setThinking(false);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [messages.length, ctx, profile?.name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = (raw?: string) => {
    const query = (raw ?? input).trim();
    if (!query || thinking) return;
    setInput("");
    setMessages((m) => [...m, { id: `u_${Date.now()}`, role: "user", text: [query] }]);
    setThinking(true);
    setTimeout(() => {
      const result: CopilotResult = runCopilot(query, ctx);
      setMessages((m) => [
        ...m,
        {
          id: `a_${Date.now()}`,
          role: "assistant",
          text: result.text,
          chart: result.chart,
          intent: result.intent,
        },
      ]);
      setThinking(false);
      inputRef.current?.focus();
    }, 700 + Math.random() * 700);
  };

  const reset = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Financial Copilot"
        description="Ask anything about your money — it answers with your real data and the charts to prove it."
        action={
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> New chat
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Chat column */}
        <Card className="flex flex-col overflow-hidden xl:col-span-2" >
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-violet-600 text-white">
              <Sparkles className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-income" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-ink">Lumen Copilot</p>
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-income" />
                Online · analyzing {data.transactions.length} transactions
              </p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5" style={{ minHeight: 420, maxHeight: "calc(100vh - 380px)" }}>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} currency={currency} theme={theme} />
            ))}
            {thinking && <TypingBubble />}
            {messages.length === 0 && !thinking && (
              <div className="flex flex-col items-center gap-3 pt-10 text-center">
                <Sparkles className="h-8 w-8 text-accent" />
                <p className="text-sm text-muted">
                  Try one of these to start:
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-border p-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="shrink-0 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted transition-colors hover:border-primary/40 hover:text-primary cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your money… e.g. “Can I afford a $1,200 laptop?”"
                className="flex-1"
                disabled={thinking}
              />
              <Button type="submit" size="icon" className="h-11 w-11" disabled={!input.trim() || thinking} aria-label="Send">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Side column */}
        <div className="space-y-4">
          <Card className="p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Live snapshot · this month</p>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Income" value={formatCurrency(stats.t.income, currency)} tone="#10b981" />
              <Stat label="Spending" value={formatCurrency(stats.t.expenses, currency)} tone="#f43f5e" />
              <Stat label="Savings rate" value={`${stats.sr}%`} tone="#8b5cf6" />
              <Stat label="Discretionary" value={formatCurrency(stats.split.discretionary, currency)} tone="#f59e0b" />
            </div>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted">
              <p className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-income" /> Reads only your data — never shared
              </p>
              <p className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-warning" /> Answers include the underlying data
              </p>
              <p className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-accent" /> Updated the moment you log a transaction
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">What it can do</p>
            <div className="space-y-2.5">
              {[
                { icon: <Wallet className="h-4 w-4" />, title: "Spending forensics", body: "Why was spending up this month? It answers with the exact categories and amounts." },
                { icon: <ArrowUpRight className="h-4 w-4" />, title: "Purchase sanity checks", body: "“Can I afford it?” gets a verdict from your cash flow, budget and projections." },
                { icon: <TrendingUp className="h-4 w-4" />, title: "Trends & projections", body: "Month-end forecasts, savings rates, and 6-month cash flow charts." },
              ].map((f) => (
                <div key={f.title} className="flex gap-3 rounded-xl bg-surface-2/50 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{f.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, currency, theme }: { message: Message; currency: string; theme: string }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          TYPEWRITER[message.role].cls,
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div className={cn("max-w-[85%] space-y-2", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-primary text-white"
              : "rounded-tl-sm border border-border bg-surface-2/60 text-ink",
          )}
        >
          {message.text.map((line, i) => (
            <p key={i} className={cn("whitespace-pre-wrap", i > 0 && "mt-1.5", isUser && "text-white")}>
              {line}
            </p>
          ))}
        </div>
        {message.chart && !isUser && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full min-w-[300px] max-w-md">
            <CopilotChartCard chart={message.chart} currency={currency} theme={theme} />
          </motion.div>
        )}
        {!isUser && message.intent && (
          <div className="flex items-center gap-2 pl-1">
            <Badge tone="violet">#{message.intent.replace(/_/g, "-")}</Badge>
            <button
              onClick={() => {
                navigator.clipboard
                  .writeText(message.text.join("\n"))
                  .then(() => toast.success("Answer copied to clipboard"))
                  .catch(() => toast.error("Could not copy"));
              }}
              aria-label="Copy answer to clipboard"
              className="flex cursor-pointer items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-violet-600 text-white">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-border bg-surface-2/60 px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-muted"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.18 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CopilotChartCard({ chart, currency, theme }: { chart: CopilotChart; currency: string; theme: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <p className="mb-2 text-sm font-semibold text-ink">{chart.title}</p>
      {chart.type === "donut" && <CategoryDonut data={chart.data} currency={currency} height={210} />}
      {chart.type === "line" && <CashflowChart data={chart.data as any} currency={currency} height={220} />}
      {chart.type === "bar" && <CategoryBars data={chart.data as any} currency={currency} height={220} />}
      {chart.type === "radial" && (
        <div className="flex justify-center">
          <div className="w-56">
            <BudgetRadial value={chart.value} label={chart.label} color={chart.color} height={200} />
          </div>
        </div>
      )}
      {chart.type === "list" && (
        <div className="space-y-2">
          {chart.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-lg bg-surface-2/60 px-3 py-2 text-sm">
              <span className="truncate text-muted">{item.label}</span>
              <span className="shrink-0 font-medium tabular-nums text-ink">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl bg-surface-2/60 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold tabular-nums" style={{ color: tone }}>
        {value}
      </p>
    </div>
  );
}