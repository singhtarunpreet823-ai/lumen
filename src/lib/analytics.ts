import {
  addMonths,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { formatMonthKey, monthKeyLabel, formatCurrency } from "@/lib/format";
import { getCategory } from "@/lib/categories";
import type {
  AlertItem,
  Budget,
  BudgetStatus,
  CategoryTotal,
  MonthTotals,
  Transaction,
  TrendPoint,
} from "@/lib/types";

export function monthTotals(transactions: Transaction[], month: string): MonthTotals {
  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (!t.date.startsWith(month)) continue;
    if (t.type === "income") income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, net: income - expenses };
}

export function totalsInRange(transactions: Transaction[], start: string, end: string): MonthTotals {
  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (t.date < start || t.date > end) continue;
    if (t.type === "income") income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, net: income - expenses };
}

export function categoryTotals(transactions: Transaction[], month: string, type: "income" | "expense"): CategoryTotal[] {
  const map = new Map<string, { amount: number; count: number }>();
  for (const t of transactions) {
    if (t.type !== type || !t.date.startsWith(month)) continue;
    const entry = map.get(t.categoryId) ?? { amount: 0, count: 0 };
    entry.amount += t.amount;
    entry.count += 1;
    map.set(t.categoryId, entry);
  }
  const total = [...map.values()].reduce((sum, e) => sum + e.amount, 0) || 1;
  return [...map.entries()]
    .map(([categoryId, e]) => {
      const cat = getCategory(categoryId);
      return {
        categoryId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        amount: Math.round(e.amount),
        count: e.count,
        pct: Math.round((e.amount / total) * 100),
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function topMerchants(transactions: Transaction[], month: string, limit = 6) {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense" || !t.date.startsWith(month)) continue;
    map.set(t.merchant, (map.get(t.merchant) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .map(([merchant, amount]) => ({ merchant, amount: Math.round(amount), count: 1 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function trendSeries(transactions: Transaction[], months = 6): TrendPoint[] {
  const now = startOfMonth(new Date());
  const points: TrendPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const key = formatMonthKey(subMonths(now, i));
    const t = monthTotals(transactions, key);
    points.push({
      month: key,
      label: monthKeyLabel(key),
      income: Math.round(t.income),
      expenses: Math.round(t.expenses),
      net: Math.round(t.net),
    });
  }
  return points;
}

export function lastNMonths(n: number): string[] {
  const now = startOfMonth(new Date());
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(formatMonthKey(subMonths(now, i)));
  }
  return keys;
}

export function budgetStatuses(transactions: Transaction[], budgets: Budget[], month: string): BudgetStatus[] {
  return budgets
    .filter((b) => b.month === month)
    .map((budget) => {
      const spent =
        budget.categoryId === "overall"
          ? monthTotals(transactions, month).expenses
          : (categoryTotals(transactions, month, "expense").find((c) => c.categoryId === budget.categoryId)?.amount ?? 0);
      const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return {
        budget,
        spent: Math.round(spent),
        remaining: Math.round(budget.amount - spent),
        pct: Math.round(pct),
        over: pct >= 100,
        warning: pct >= 80 && pct < 100,
      };
    })
    .sort((a, b) => b.pct - a.pct);
}

export function computeAlerts(
  transactions: Transaction[],
  budgets: Budget[],
  goals: { name: string; saved: number; target: number }[],
  month: string,
): AlertItem[] {
  const alerts: AlertItem[] = [];

  const statuses = budgetStatuses(transactions, budgets, month);
  const overall = statuses.find((s) => s.budget.categoryId === "overall");
  if (overall) {
    if (overall.over) {
      alerts.push({
        id: "budget_overall_over",
        kind: "budget",
        severity: "danger",
        title: "Overall budget exceeded",
        message: `You've spent ${overall.pct}% of your monthly budget with days left in ${monthKeyLabel(month)}.`,
        link: "/budgets",
      });
    } else if (overall.warning) {
      alerts.push({
        id: "budget_overall_warning",
        kind: "budget",
        severity: "warning",
        title: "Approaching monthly budget",
        message: `You've used ${overall.pct}% of your overall budget. Pace spending carefully.`,
        link: "/budgets",
      });
    }
  }

  for (const s of statuses) {
    if (s.budget.categoryId === "overall") continue;
    const name = getCategory(s.budget.categoryId).name;
    if (s.over) {
      alerts.push({
        id: `budget_${s.budget.categoryId}_over`,
        kind: "budget",
        severity: "danger",
        title: `${name} budget exceeded`,
        message: `${name} is ${s.pct}% over budget (${formatCurrency(-s.remaining)} over).`,
        link: "/budgets",
      });
    } else if (s.warning) {
      alerts.push({
        id: `budget_${s.budget.categoryId}_warn`,
        kind: "budget",
        severity: "warning",
        title: `${name} budget at ${s.pct}%`,
        message: `You have $${s.remaining.toLocaleString()} left in your ${name.toLowerCase()} budget.`,
        link: "/budgets",
      });
    }
  }

  for (const g of goals) {
    const pct = g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0;
    if (pct >= 100) {
      alerts.push({
        id: `goal_${g.name}`,
        kind: "goal",
        severity: "success",
        title: `Goal reached: ${g.name}`,
        message: `Congratulations! You've fully funded your "${g.name}" goal.`,
        link: "/goals",
      });
    } else if (pct >= 75) {
      alerts.push({
        id: `goal_${g.name}`,
        kind: "goal",
        severity: "info",
        title: `Almost there: ${g.name}`,
        message: `You're ${pct}% of the way to your "${g.name}" goal.`,
        link: "/goals",
      });
    }
  }

  return alerts.slice(0, 4);
}

export function monthDateRange(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  const end = new Date(y, m, 0).getDate();
  return { start: `${month}-01`, end: `${month}-${String(end).padStart(2, "0")}` };
}

export function currentMonthKey(): string {
  return format(new Date(), "yyyy-MM");
}

export function previousMonthKey(): string {
  return formatMonthKey(subMonths(new Date(), 1));
}

export function monthYearKey(date: Date): string {
  return format(date, "yyyy-MM");
}

export function addMonthsToKey(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  return formatMonthKey(addMonths(new Date(y, m - 1, 1), delta));
}