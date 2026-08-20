import { formatCurrency, monthKeyLabel } from "@/lib/format";
import { getCategory } from "@/lib/categories";
import {
  currentMonthKey,
  previousMonthKey,
  monthDateRange,
} from "@/lib/analytics";
import {
  affordabilityCheck,
  categoryLabel,
  compareMonths,
  discretionarySplit,
  merchantSummary,
  monthName,
  projectedMonthEnd,
  savingsRate,
  topMovingCategories,
  trendInsights,
} from "@/lib/ai/analysis";
import { budgetStatuses, categoryTotals, monthTotals, topMerchants } from "@/lib/analytics";
import type { Budget, Transaction } from "@/lib/types";

export type CopilotChart =
  | { type: "donut"; title: string; data: { name: string; value: number; color: string }[] }
  | { type: "line"; title: string; data: { label: string; income: number; expenses: number; net: number }[] }
  | { type: "bar"; title: string; data: { name: string; value: number; color: string }[] }
  | { type: "radial"; title: string; value: number; label: string; color: string }
  | { type: "list"; title: string; items: { label: string; value: string; icon?: string }[] };

export interface CopilotResult {
  intent: string;
  text: string[];
  chart?: CopilotChart;
  followUps: string[];
}

export interface CopilotContext {
  transactions: Transaction[];
  budgets: Budget[];
  goals: { name: string; target: number; saved: number; deadline?: string; color: string }[];
  currency: string;
}

const cur = currentMonthKey();
const prev = previousMonthKey();

const fmt = (n: number, c: string) => formatCurrency(n, c);

function listCategoryDeltas(cmp: ReturnType<typeof compareMonths>, currencySym: string) {
  const moving = cmp.categoryDeltas.filter((d) => d.diff !== 0).slice(0, 4);
  if (moving.length === 0) return ["Your category spending was remarkably steady month over month."];
  const lines = moving.map((d) => {
    const dir = d.diff > 0 ? "up" : "down";
    const sign = d.diff > 0 ? "+" : "-";
    return `- **${d.name}**: ${sign}${fmt(Math.abs(d.diff), currencySym)} (${d.pctChange > 0 ? "+" : ""}${d.pctChange}%)`;
  });
  return lines;
}

function buildText(rows: string[]): string[] {
  return rows.filter(Boolean);
}

export function runCopilot(query: string, ctx: CopilotContext): CopilotResult {
  const q = query.toLowerCase();
  const { transactions, budgets, currency } = ctx;

  const has = (...words: string[]) => words.some((w) => q.includes(w));

  // ---- CAN I AFFORD ----
  if (has("can i afford", "afford", "can we afford")) {
    const cleaned = q.replace(/,/g, "").replace(/[$€£]/g, " ");
    const amountMatch = cleaned.match(/(?:\b)(\d+(?:\.\d+)?)\s*(k|thousand|hundred|dollars|bucks)?\b/);
    let amount = 0;
    if (amountMatch) {
      const mult = amountMatch[2] === "k" || amountMatch[2] === "thousand" ? 1000 : amountMatch[2] === "hundred" ? 100 : 1;
      amount = parseFloat(amountMatch[1]) * mult;
    }
    if (amount === 0) {
      return {
        intent: "afford",
        text: [
          `Sure — tell me the price (like "Can I afford a $1,200 laptop?") and I'll check it against your current cash flow, remaining budget and month-end projections.`,
        ],
        followUps: ["Can I afford a $1,200 laptop?", "What's my month-end projection?"],
      };
    }
    if (amount > 0) {
      const check = affordabilityCheck(transactions, cur, amount, budgets);
      const now = monthKeyLabel(cur);
      const headline =
        check.verdict === "yes"
          ? `Yes — you can afford **${fmt(amount, currency)}** based on your finances right now.`
          : check.verdict === "tight"
            ? `It's tight — you could afford **${fmt(amount, currency)}**, but it would stretch your ${now} budget.`
            : `Not right now — ${fmt(amount, currency)} is above what's comfortably available this month.`;
      const lines = [
        headline,
        `Here's what's available:`,
        ...check.sources.map((s) => `- **${s.label}**: ${fmt(s.value, currency)}`),
        check.overallRemaining !== null && check.verdict === "tight"
          ? `Tip: defer the purchase for a month and it becomes a comfortable yes.`
          : check.verdict === "no"
            ? `Tip: save ${fmt(amount, currency)} over the next few months, or trim discretionary spending (${fmt(discretionarySplit(transactions, cur).discretionary, currency)} went to non-essentials this month).`
            : "",
      ];
      return {
        intent: "afford",
        text: buildText(lines),
        chart: {
          type: "bar",
          title: `Affordability — ${fmt(amount, currency)} purchase`,
          data: [
            { name: "Cash this month", value: Math.round(check.currentCash), color: "#10b981" },
            { name: "Projected surplus", value: Math.round(check.projectedRemaining), color: "#22d3ee" },
            ...(check.overallRemaining !== null
              ? [{ name: "Budget remaining", value: Math.round(check.overallRemaining), color: "#8b5cf6" }]
              : []),
            { name: "Purchase cost", value: amount, color: "#f43f5e" },
          ],
        },
        followUps: [
          "What if I save for it over 3 months?",
          "Where can I cut back to afford this faster?",
        ],
      };
    }
  }

  // ---- WHY HIGHER / INCREASE ----
  if (
    has("why", "increase", "higher", "went up", "spiked", "up by", "more than last", "compare") ||
    (has("spending") && has("higher", "up", "increase", "why"))
  ) {
    const cmp = compareMonths(transactions, cur, prev);
    const delta = cmp.delta.expenses;
    const top = cmp.categoryDeltas.filter((d) => d.diff > 0).slice(0, 3);
    const lines = [
      delta > 0
        ? `Your spending in **${monthKeyLabel(cur)}** is **${fmt(delta, currency)} higher** than last month (${delta > 0 ? "+" : ""}${cmp.delta.expensesPct}%).`
        : delta < 0
          ? `Good news — your spending in **${monthKeyLabel(cur)}** is actually **${fmt(Math.abs(delta), currency)} lower** than last month.`
          : `Your spending is essentially flat compared to last month.`,
      top.length > 0 && delta > 0 ? `The main drivers:`.concat("") : "",
      ...listCategoryDeltas(cmp, currency),
      `Overall: ${fmt(cmp.current.expenses, currency)} spent vs ${fmt(cmp.previous.expenses, currency)} last month.`,
    ];
    return {
      intent: "why_higher",
      text: buildText(lines),
      chart: {
        type: "bar",
        title: "Spending change by category",
        data: cmp.categoryDeltas.slice(0, 6).map((d) => ({
          name: d.name,
          value: d.diff,
          color: d.diff > 0 ? "#f43f5e" : "#10b981",
        })),
      },
      followUps: [
        "Where did I spend the most this month?",
        "How can I reduce my spending?",
        "What was my transport spend last month?",
      ],
    };
  }

  // ---- WHERE DID I SPEND MOST ----
  if (has("where", "spend most", "biggest", "top", "most on", "largest", "breakdown", "categories", "category")) {
    const cats = categoryTotals(transactions, cur, "expense").slice(0, 5);
    const merchants = topMerchants(transactions, cur, 3);
    const lines = [
      `Your biggest spending categories in **${monthKeyLabel(cur)}**:`,
      ...cats.map((c, i) => `- **${c.name}**: ${fmt(c.amount, currency)} (${c.pct}%)`),
      merchants.length > 0 ? `Your top merchants: ${merchants.map((m) => `${m.merchant} (${fmt(m.amount, currency)})`).join(", ")}.` : "",
    ];
    return {
      intent: "top_spending",
      text: buildText(lines),
      chart: {
        type: "donut",
        title: "Spending by category",
        data: cats.map((c) => ({ name: c.name, value: c.amount, color: c.color })),
      },
      followUps: [
        "How can I reduce my spending?",
        "Why was my spending higher this month?",
        "Is my grocery budget on track?",
      ],
    };
  }

  // ---- REDUCE / SAVE ----
  if (has("reduce", "save money", "cut back", "unnecessary", "cut down", "waste", "less spend", "save more", "budget better")) {
    const split = discretionarySplit(transactions, cur);
    const cmp = compareMonths(transactions, cur, prev);
    const topDiscretionary = categoryTotals(transactions, cur, "expense")
      .filter((c) => ["food-dining", "shopping", "entertainment", "personal", "subscriptions", "travel"].includes(c.categoryId))
      .slice(0, 3);
    const lines = [
      `Here's a realistic plan to reduce spending in **${monthKeyLabel(cur)}**:`,
      `- **Non-essential spending is ${fmt(split.discretionary, currency)}** (${Math.round((split.discretionary / (split.total || 1)) * 100)}% of all expenses).`,
      ...topDiscretionary.map(
        (c, i) => `- Trim **${c.name.toLowerCase()}** (${fmt(c.amount, currency)}): you could save ~${fmt(Math.round(c.amount * 0.3), currency)} with a 30% cut.`,
      ),
      cmp.delta.expenses > 0 ? `- Spending rose ${cmp.delta.expensesPct}% vs last month — review the categories above first.` : `- You're already spending less than last month. Keep the momentum!`,
      `- Consider consolidating subscriptions and ordering groceries instead of food delivery (${fmt((categoryTotals(transactions, cur, "expense").find((c) => c.categoryId === "food-dining")?.amount ?? 0), currency)} went to food & dining).`,
    ];
    return {
      intent: "reduce",
      text: buildText(lines),
      chart: {
        type: "donut",
        title: "Discretionary vs essential",
        data: [
          { name: "Essential", value: split.essential, color: "#38bdf8" },
          { name: "Discretionary", value: split.discretionary, color: "#f59e0b" },
        ],
      },
      followUps: [
        "Where did I spend the most this month?",
        "Can I afford a $1,200 laptop?",
        "Show my monthly trend",
      ],
    };
  }

  // ---- GOALS ----
  if (has("goal", "save for", "target", "saving", "on track")) {
    const sr = savingsRate(transactions, cur);
    const lines = [
      ctx.goals.length > 0
        ? `You have **${ctx.goals.length} savings goals** and a **${sr}%** savings rate this month.`
        : "You haven't set any savings goals yet — create one to start tracking progress.",
      ...ctx.goals.map((g) => {
        const pct = Math.round((g.saved / g.target) * 100);
        return `- **${g.name}**: ${fmt(g.saved, currency)} / ${fmt(g.target, currency)} (${pct}%)`;
      }),
    ];
    const monthSurplus = Math.round(monthTotals(transactions, cur).net);
    if (ctx.goals.length > 0 && monthSurplus > 0) {
      lines.push(
        `At your current ${fmt(monthSurplus, currency)} monthly surplus, you could add ${fmt(monthSurplus, currency)} to savings each month.`,
      );
    }
    return {
      intent: "goals",
      text: buildText(lines),
      chart: {
        type: "list",
        title: "Savings goals",
        items: ctx.goals.map((g) => ({
          label: g.name,
          value: `${Math.round((g.saved / g.target) * 100)}% · ${fmt(g.saved, currency)} of ${fmt(g.target, currency)}`,
          icon: "target",
        })),
      },
      followUps: [
        "How can I save more each month?",
        "Can I afford a $1,200 laptop?",
        "What's my budget status?",
      ],
    };
  }

  // ---- BUDGET ----
  if (has("budget", "over budget")) {
    const statuses = budgetStatuses(transactions, budgets, cur);
    const active = statuses.length > 0 ? statuses : [];
    const lines = [
      `Here's your **${monthKeyLabel(cur)}** budget health:`,
      ...(active.length
        ? active.slice(0, 6).map((s) => {
            const name = s.budget.categoryId === "overall" ? "Overall" : categoryLabel(s.budget.categoryId);
            const flag = s.over ? "⚠️ over" : s.warning ? "🟡 close" : "🟢 on track";
            return `- **${name}**: ${fmt(s.spent, currency)} / ${fmt(s.budget.amount, currency)} (${s.pct}%) — ${flag}`;
          })
        : ["No budgets set for this month. Add one on the Budgets page to get alerts."]),
    ];
    return {
      intent: "budget",
      text: buildText(lines),
      chart: {
        type: "radial",
        title: "Overall budget used",
        value: statuses.find((s) => s.budget.categoryId === "overall")?.pct ?? 0,
        label: fmt(
          statuses.find((s) => s.budget.categoryId === "overall")?.spent ?? 0,
          currency,
        ),
        color: "#8b5cf6",
      },
      followUps: [
        "Which budget is closest to being exceeded?",
        "Why was my spending higher this month?",
        "Where did I spend the most this month?",
      ],
    };
  }

  // ---- TREND ----
  if (has("trend", "trending", "over time", "last 6", "last six", "months", "pattern", "history", "track record")) {
    const insights = trendInsights(transactions, 6);
    const lines = [
      `Your **6-month trend** shows an average of ${fmt(insights.avgSpend, currency)} in monthly expenses and ${fmt(insights.avgIncome, currency)} in income.`,
      `Your net savings rate over the last 3 months: **${savingsRate(transactions, cur)}%** (this month), ${savingsRate(transactions, prev)}% (last month).`,
    ];
    return {
      intent: "trend",
      text: buildText(lines),
      chart: {
        type: "line",
        title: "Cash flow over 6 months",
        data: insights.series.map((p) => ({
          label: p.label,
          income: p.income,
          expenses: p.expenses,
          net: p.net,
        })),
      },
      followUps: [
        "Where did I spend the most this month?",
        "Why was my spending higher this month?",
        "What's my savings rate?",
      ],
    };
  }

  // ---- FORECAST ----
  if (has("forecast", "project", "predict", "end of month", "month-end", "finish the month")) {
    const proj = projectedMonthEnd(transactions, cur);
    const cmp = compareMonths(transactions, cur, prev);
    const lines = [
      `Projecting from the first ${proj.dayOfMonth} days, you're on pace to spend **${fmt(proj.projected, currency)}** by the end of ${monthKeyLabel(cur)}.`,
      `That's ${proj.projected > cmp.current.expenses ? "ahead of" : "behind"} the pace you'd need to match last month's ${fmt(cmp.current.expenses, currency)}.`,
    ];
    return {
      intent: "forecast",
      text: buildText(lines),
      chart: {
        type: "bar",
        title: "Spent so far vs projected month-end",
        data: [
          { name: "Spent so far", value: Math.round(cmp.current.expenses), color: "#38bdf8" },
          { name: "Projected", value: proj.projected, color: "#8b5cf6" },
          { name: "Last month", value: Math.round(cmp.previous.expenses), color: "#64748b" },
        ],
      },
      followUps: [
        "Can I afford a $1,200 laptop?",
        "How can I reduce my spending?",
        "Show my monthly trend",
      ],
    };
  }

  // ---- RECURRING / SUBSCRIPTIONS ----
  if (has("subscription", "recurring", "membership")) {
    const recurring = transactions.filter((t) => t.type === "expense" && t.recurring && t.date.startsWith(cur));
    const total = Math.round(recurring.reduce((s, t) => s + t.amount, 0));
    const grouped = new Map<string, number>();
    for (const t of recurring) {
      grouped.set(t.merchant, (grouped.get(t.merchant) ?? 0) + t.amount);
    }
    const lines = [
      recurring.length > 0
        ? `You have **${recurring.length} recurring charges** totaling **${fmt(total, currency)}** this month.`
        : `No recurring charges detected this month.`,
      ...[...grouped.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, amt]) => `- **${name}**: ${fmt(amt, currency)}`),
    ];
    return {
      intent: "recurring",
      text: buildText(lines),
      chart: {
        type: "list",
        title: "Recurring charges",
        items: [...grouped.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, value]) => ({ label: name, value: fmt(value, currency) })),
      },
      followUps: [
        "How can I reduce my spending?",
        "What's my monthly budget status?",
      ],
    };
  }

  // ---- INCOME ----
  if (has("income", "salary", "earn", "paycheck", "how much do i make", "revenue")) {
    const t = monthTotals(transactions, cur);
    const prevT = monthTotals(transactions, prev);
    const sr = savingsRate(transactions, cur);
    const lines = [
      `This month you've earned **${fmt(t.income, currency)}** (${fmt(t.income - prevT.income, currency)} vs last month).`,
      `After ${fmt(t.expenses, currency)} in expenses, you're left with a **${fmt(t.net, currency)} surplus** — a ${sr}% savings rate.`,
    ];
    return {
      intent: "income",
      text: buildText(lines),
      chart: {
        type: "line",
        title: "Monthly income",
        data: trendInsights(transactions, 6).series.map((p) => ({
          label: p.label,
          income: p.income,
          expenses: p.expenses,
          net: p.net,
        })),
      },
      followUps: ["Show my monthly trend", "Why was my spending higher this month?", "What's my budget status?"],
    };
  }

  // ---- OVERVIEW / DEFAULT ----
  const t = monthTotals(transactions, cur);
  const cmp = compareMonths(transactions, cur, prev);
  const sr = savingsRate(transactions, cur);
  const split = discretionarySplit(transactions, cur);
  const trend = trendInsights(transactions, 6);
  const up = topMovingCategories(transactions, cur, prev, 2);
  const avg = Math.round(trend.series.reduce((s, p) => s + p.expenses, 0) / Math.max(1, trend.series.length));

  const lines = [
    `Here's your **${monthName(cur)}** snapshot:`,
    `- **Income**: ${fmt(t.income, currency)}`,
    `- **Spending**: ${fmt(t.expenses, currency)} (${fmt(cmp.delta.expenses, currency)} vs last month, ${cmp.delta.expensesPct > 0 ? "+" : ""}${cmp.delta.expensesPct}%)`,
    `- **Net**: ${fmt(t.net, currency)} — a **${sr}% savings rate**`,
    up.length > 0
      ? `- Biggest mover: **${up[0].name}** (${up[0].diff > 0 ? "+" : ""}${fmt(up[0].diff, currency)} vs last month)`
      : `- Spending is steady compared to last month.`,
    `- You're spending about **${fmt(avg, currency)}/month** on average over the last 6 months.`,
    split.discretionary > 0
      ? `- ${Math.round((split.discretionary / (split.total || 1)) * 100)}% of expenses went to discretionary categories.`
      : "",
  ];

  return {
    intent: "overview",
    text: buildText(lines),
    chart: {
      type: "line",
      title: "6-month cash flow",
      data: trend.series.map((p) => ({ label: p.label, income: p.income, expenses: p.expenses, net: p.net })),
    },
    followUps: [
      "Where did I spend the most this month?",
      "Why was my spending higher this month?",
      "Can I afford a $1,200 laptop?",
      "How can I reduce my spending?",
    ],
  };
}

export const SUGGESTED_QUESTIONS = [
  "Where did I spend the most this month?",
  "Why was my spending higher this month?",
  "Can I afford a $1,200 laptop?",
  "How can I reduce my unnecessary spending?",
  "What's my budget status?",
  "Show my 6-month trend",
  "List my subscriptions",
  "Am I on track for my savings goals?",
];

export function quickStats(ctx: CopilotContext) {
  const t = monthTotals(ctx.transactions, cur);
  const sr = savingsRate(ctx.transactions, cur);
  const proj = projectedMonthEnd(ctx.transactions, cur);
  const split = discretionarySplit(ctx.transactions, cur);
  return { t, sr, proj, split };
}

export function monthRange(month: string) {
  return monthDateRange(month);
}

export { monthTotals, categoryTotals, compareMonths };

export function monthDeltaNote(transactions: Transaction[], curren: string) {
  const cmp = compareMonths(transactions, cur, prev);
  const top = cmp.categoryDeltas.filter((d) => d.diff > 0)[0];
  if (!top) return null;
  return {
    title: `${top.name} drove the change`,
    text: `${top.name} spending is ${fmt(top.diff, curren)} higher this month.`,
    categoryId: top.categoryId,
    color: getCategory(top.categoryId).color,
  };
}