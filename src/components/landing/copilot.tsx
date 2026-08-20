"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, Database, BarChart3, Lightbulb, ArrowRight } from "lucide-react";
import { Section, Reveal } from "@/components/landing/sections";
import { Button } from "@/components/ui/primitives";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MockMessage {
  role: "user" | "assistant";
  text: string;
}

const CHAT_LOOP: MockMessage[][] = [
  [
    { role: "user", text: "Why was my spending higher this month?" },
    {
      role: "assistant",
      text: "Your spending rose 14% this month. The main driver was Food & Dining (+$86) and Transport (+$42). Here's the breakdown by category:",
    },
  ],
  [
    { role: "user", text: "Can I afford a $1,200 laptop?" },
    {
      role: "assistant",
      text: "Yes — your projected month-end surplus is $1,820, and your remaining overall budget is $756. The laptop fits with room to spare.",
    },
  ],
  [
    { role: "user", text: "How can I reduce unnecessary spending?" },
    {
      role: "assistant",
      text: "Food delivery is your biggest discretionary leak at $96 this month. Cutting it in half could free up ~$48 — about $570 a year. 📉",
    },
  ],
];

export function CopilotSection() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCycle((c) => (c + 1) % CHAT_LOOP.length), 9000);
    return () => clearInterval(t);
  }, []);

  return (
    <Section
      id="copilot"
      eyebrow="AI Financial Copilot"
      title={
        <>
          Don't just see your money. <span className="text-gradient">Ask about it.</span>
        </>
      }
      subtitle="A conversational analyst with direct access to your data — it doesn't guess, it computes. Every answer comes with the numbers and charts behind it."
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="space-y-4">
            {[
              {
                icon: Database,
                title: "Built on your real data",
                body: "The copilot runs queries across your transactions, budgets and goals — month-over-month, category by category.",
              },
              {
                icon: BarChart3,
                title: "Answers with receipts",
                body: "Every reply can render the underlying chart inline: donuts, cash-flow lines, budget radials, affordability bars.",
              },
              {
                icon: Lightbulb,
                title: "Personalized recommendations",
                body: "It spots your biggest leaks and suggests concrete, quantified actions — not generic advice.",
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="glass flex gap-4 rounded-2xl p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-ink">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{f.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div className="mt-6 flex items-center gap-4">
              <Link href="/signup">
                <Button>
                  Try the copilot <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-income opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-income" />
                </span>
                Connected to your data
              </div>
            </div>
          </Reveal>
        </div>

        {/* Chat mockup */}
        <Reveal delay={0.15}>
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/15 via-violet-500/10 to-fuchsia-500/15 blur-3xl"
            />
            <div className="glass-strong relative rounded-3xl shadow-glass">
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-violet-600 text-white">
                  <Bot className="h-4.5 w-4.5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-income" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Copilot</p>
                  <p className="text-[10px] text-muted">Analyzing 1,248 transactions</p>
                </div>
                <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                  Live demo
                </span>
              </div>
              <div className="min-h-[300px] space-y-3 p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={cycle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {CHAT_LOOP[cycle].map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.35, duration: 0.35 }}
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed",
                          m.role === "user"
                            ? "ml-auto rounded-tr-sm bg-primary text-white"
                            : "rounded-tl-sm bg-surface-2 text-ink",
                        )}
                      >
                        {m.text}
                      </motion.div>
                    ))}
                    {cycle === 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.1 }}
                        className="rounded-2xl border border-border bg-surface p-3"
                      >
                        <p className="mb-2 text-[10px] font-semibold text-muted">Spending change by category</p>
                        <div className="space-y-1.5">
                          {[
                            { name: "Food & Dining", pct: 62, color: "#f43f5e" },
                            { name: "Transport", pct: 34, color: "#f59e0b" },
                            { name: "Shopping", pct: 22, color: "#38bdf8" },
                            { name: "Entertainment", pct: 12, color: "#10b981" },
                          ].map((b) => (
                            <div key={b.name} className="flex items-center gap-2 text-[10px]">
                              <span className="w-24 text-muted">{b.name}</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: b.color }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${b.pct}%` }}
                                  transition={{ delay: 1.3, duration: 0.6 }}
                                />
                              </div>
                              <span className="w-6 text-right font-medium text-ink">{b.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="border-t border-border px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="h-9 flex-1 rounded-xl bg-surface-2 px-3.5 text-xs text-muted flex items-center">
                    Ask about your money…
                  </div>
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white" aria-label="Send">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}