"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Is Lumen really free?",
    a: "Yes. The free plan includes unlimited transactions, budgets, goals and the AI copilot. Pro adds exports, multi-account aggregation and priority support when those ship.",
  },
  {
    q: "Where does my data live?",
    a: "In demo mode, everything stays in your own browser via localStorage — nothing is uploaded anywhere, and there are no tracking cookies or third-party scripts. Connect Supabase and your data moves to a private PostgreSQL database protected by row-level security.",
  },
  {
    q: "How does the AI copilot work without an API key?",
    a: "The copilot ships with a deterministic analysis engine that parses your question and computes the answer from your actual transactions — trends, affordability checks, budget status, forecasts. It works offline and never sends your data to an external service. An optional LLM backend can be wired later for free-form answers.",
  },
  {
    q: "Do I need a bank connection?",
    a: "No. Add transactions manually or paste a statement — auto-categorization does the tagging for you. Bank aggregation is on the roadmap for Pro.",
  },
  {
    q: "Can I export my data?",
    a: "Anytime, as JSON, from Settings → Your data. Your data is yours — no lock-in.",
  },
  {
    q: "What happens when I hit a budget limit?",
    a: "Lumen flags it inline, on the dashboard alert card, and the copilot will suggest exactly which categories to trim to get back on track.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative mx-auto w-full max-w-3xl px-4 py-24">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">FAQ</p>
      <h2 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Questions, answered
      </h2>
      <div className="mt-10 space-y-2.5">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={cn("glass rounded-2xl transition-colors", isOpen && "border-primary/30")}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-ink sm:text-base">{f.q}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted transition-transform duration-300",
                    isOpen && "rotate-180 text-primary",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
