import { freshDemoData } from "../src/lib/seed";
import { runCopilot } from "../src/lib/ai/engine";

const data = freshDemoData();
const ctx = {
  transactions: data.transactions,
  budgets: data.budgets,
  goals: data.goals.map((g) => ({ name: g.name, target: g.target, saved: g.saved, deadline: g.deadline, color: g.color })),
  currency: "USD",
};

const queries = [
  "Where did I spend the most this month?",
  "Why was my spending higher this month?",
  "Can I afford a $1,200 laptop?",
  "Can I afford a $50,000 car?",
  "How can I reduce my unnecessary spending?",
  "What's my budget status?",
  "Show my 6-month trend",
  "List my subscriptions",
  "Am I on track for my savings goals?",
  "What's my income this month?",
  "Forecast my month-end spending",
  "hello there",
];

console.log("transactions:", data.transactions.length, "| budgets:", data.budgets.length, "| goals:", data.goals.length);

for (const q of queries) {
  const r = runCopilot(q, ctx);
  console.log("\n=== Q:", q, "-> intent:", r.intent);
  for (const line of r.text) console.log("  ", line.slice(0, 160));
  console.log("   chart:", r.chart?.type ?? "none", "| followups:", r.followUps.length);
}