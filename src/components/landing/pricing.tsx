"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Section, Reveal } from "@/components/landing/sections";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    tagline: "For getting started",
    monthly: 0,
    annual: 0,
    cta: "Start free",
    features: ["Unlimited transactions", "Auto-categorization", "3 budgets", "2 savings goals", "Monthly analytics", "Community support"],
  },
  {
    name: "Plus",
    tagline: "For building momentum",
    monthly: 8,
    annual: 6,
    popular: true,
    cta: "Start 14-day trial",
    features: [
      "Everything in Free",
      "AI Financial Copilot",
      "Unlimited budgets & goals",
      "Projections & forecasts",
      "Budget alerts (email + push)",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    tagline: "For money power users",
    monthly: 16,
    annual: 13,
    cta: "Start 14-day trial",
    features: [
      "Everything in Plus",
      "Multi-currency accounts",
      "Custom categories & rules",
      "Advanced export (CSV/JSON)",
      "AI insights digest",
      "Early access to new features",
    ],
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <Section
      id="pricing"
      eyebrow="Pricing"
      title={
        <>
          Simple pricing. <span className="text-gradient">Real value.</span>
        </>
      }
      subtitle="Start free. Upgrade when you want the copilot on call 24/7."
    >
      <div className="mb-10 flex items-center justify-center gap-3">
        <button
          onClick={() => setAnnual(false)}
          className={cn("text-sm font-medium transition-colors cursor-pointer", !annual ? "text-ink" : "text-muted")}
        >
          Monthly
        </button>
        <button
          onClick={() => setAnnual(true)}
          aria-label="Toggle billing period"
          className="relative h-7 w-14 rounded-full border border-border bg-surface-2 transition-colors cursor-pointer"
        >
          <motion.span
            className="absolute top-0.5 h-[22px] w-[22px] rounded-full bg-primary shadow-md"
            animate={{ left: annual ? "calc(100% - 26px)" : "2px" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <button
          onClick={() => setAnnual(true)}
          className={cn("flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer", annual ? "text-ink" : "text-muted")}
        >
          Annual
          <span className="rounded-full bg-income/10 px-2 py-0.5 text-[10px] font-semibold text-income">Save 25%</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((plan, i) => {
          const price = annual ? plan.annual : plan.monthly;
          return (
            <Reveal key={plan.name} delay={i * 0.08}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border p-6 transition-all duration-300 lg:p-7",
                  plan.popular
                    ? "border-primary/40 bg-gradient-to-b from-primary/10 via-surface to-surface shadow-glow-primary"
                    : "border-border bg-surface/60 hover:border-border",
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-violet-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg">
                    Most popular
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-ink">{plan.name}</h3>
                  {plan.name === "Plus" && <Sparkles className="h-4 w-4 text-accent" />}
                </div>
                <p className="mt-1 text-xs text-muted">{plan.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-semibold tracking-tight text-ink">
                    ${price === 0 ? 0 : price}
                  </span>
                  <span className="text-sm text-muted">
                    {price === 0 ? "forever" : annual ? "/mo, billed yearly" : "/month"}
                  </span>
                </div>
                <Link href={price === 0 ? "/signup" : "/signup"} className="mt-5">
                  <Button variant={plan.popular ? "primary" : "outline"} className="w-full">
                    {plan.cta} {plan.popular && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </Link>
                <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink/85">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-income" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.2}>
        <p className="mt-8 text-center text-xs text-muted">
          All plans include encryption, RLS-protected data and a live demo you can explore without an account.
        </p>
      </Reveal>
    </Section>
  );
}