import { isDiscretionary, getCategory } from "@/lib/categories";
import { daysInMonth, monthKeyFullLabel } from "@/lib/format";
import { budgetStatuses, categoryTotals, monthTotals, topMerchants, trendSeries } from "@/lib/analytics";
import type { Budget, Transaction } from "@/lib/types";

export interface CategoryDelta {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  current: number;
  previous: number;
  diff: number;
  pctChange: number;
}

export interface MonthComparison {
  current: { income: number; expenses: number; net: number };
  previous: { income: number; expenses: number; net: number };
  delta: { income: number; expenses: number; net: number; expensesPct: number };
  categoryDeltas: CategoryDelta[];
}

export function compareMonths(transactions: Transaction[], current: string, previous: string): MonthComparison {
  const cur = monthTotals(transactions, current);
  const prev = monthTotals(transactions, previous);
  const curCats = categoryTotals(transactions, current, "expense");
  const prevCats = categoryTotals(transactions, previous, "expense");
  const prevMap = new Map(prevCats.map((c) => [c.categoryId, c.amount]));

  const categoryDeltas: CategoryDelta[] = curCats
    .map((c) => {
      const prevAmount = prevMap.get(c.categoryId) ?? 0;
      const diff = c.amount - prevAmount;
      const pctChange = prevAmount > 0 ? Math.round((diff / prevAmount) * 100) : null;
      return {
        categoryId: c.categoryId,
        name: c.name,
        color: c.color,
        icon: c.icon,
        current: c.amount,
        previous: prevAmount,
        diff,
        pctChange: pctChange ?? 100,
      };
    })
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  return {
    current: cur,
    previous: prev,
    delta: {
      income: cur.income - prev.income,
      expenses: cur.expenses - prev.expenses,
      net: cur.net - prev.net,
      expensesPct: prev.expenses > 0 ? Math.round(((cur.expenses - prev.expenses) / prev.expenses) * 100) : 0,
    },
    categoryDeltas,
  };
}

export function projectedMonthEnd(transactions: Transaction[], month: string) {
  const totals = monthTotals(transactions, month);
  const [, mm, dd] = month.split("-").map(Number);
  const today = new Date();
  const dayOfMonth = month === currentMonthKeyOf() ? today.getDate() : Number(dd);
  const days = daysInMonth(new Date(Number(month.split("-")[0]), Number(month.split("-")[1]) - 1, 1));
  const elapsed = Math.max(1, Math.min(dayOfMonth, days));
  const daily = totals.expenses / elapsed;
  return {
    projected: Math.round(daily * days),
    daily,
    dayOfMonth,
    days,
  };
}

function currentMonthKeyOf() {
  return new Date().toISOString().slice(0, 7);
}

export function savingsRate(transactions: Transaction[], month: string) {
  const t = monthTotals(transactions, month);
  if (t.income <= 0) return 0;
  return Math.round((t.net / t.income) * 100);
}

export function discretionarySplit(transactions: Transaction[], month: string) {
  const cats = categoryTotals(transactions, month, "expense");
  let discretionary = 0;
  let essential = 0;
  for (const c of cats) {
    if (isDiscretionary(c.categoryId)) discretionary += c.amount;
    else essential += c.amount;
  }
  return { discretionary, essential, total: discretionary + essential };
}

export function affordabilityCheck(transactions: Transaction[], month: string, amount: number, budgets: Budget[] = []) {
  const t = monthTotals(transactions, month);
  const proj = projectedMonthEnd(transactions, month);
  const projectedRemaining = t.income - proj.projected;
  const currentCash = t.income - t.expenses;
  const statuses = budgetStatuses(transactions, budgets, month);
  const overall = statuses.find((s) => s.budget.categoryId === "overall");
  const overallRemaining = overall?.remaining ?? null;

  const sources = [
    { label: "Cash remaining this month", value: Math.round(currentCash) },
    { label: "Projected month-end surplus", value: Math.round(projectedRemaining) },
  ];
  if (overallRemaining !== null) {
    sources.push({ label: "Remaining monthly budget", value: Math.round(overallRemaining) });
  }

  let verdict = "no";
  let strongest = sources[0].value;
  for (const s of sources) {
    if (s.value > strongest) strongest = s.value;
  }
  if (strongest >= amount) verdict = "yes";
  else if (strongest >= amount * 0.6) verdict = "tight";

  return {
    amount: Math.round(amount),
    currentCash,
    projectedRemaining,
    overallRemaining,
    sources,
    verdict: verdict as "yes" | "tight" | "no",
  };
}

export function topMovingCategories(transactions: Transaction[], current: string, previous: string, n = 3) {
  const cmp = compareMonths(transactions, current, previous);
  return cmp.categoryDeltas.slice(0, n);
}

export function trendInsights(transactions: Transaction[], months = 6) {
  const series = trendSeries(transactions, months);
  const avgSpend = Math.round(series.reduce((s, p) => s + p.expenses, 0) / series.length);
  const avgIncome = Math.round(series.reduce((s, p) => s + p.income, 0) / series.length);
  return { series, avgSpend, avgIncome };
}

export function merchantSummary(transactions: Transaction[], month: string) {
  return topMerchants(transactions, month, 6);
}

export function categoryLabel(categoryId: string) {
  return getCategory(categoryId).name;
}

export function monthName(key: string) {
  return monthKeyFullLabel(key);
}