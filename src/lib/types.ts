export type TxType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TxType;
  /** Always stored as a positive number. */
  amount: number;
  categoryId: string;
  merchant: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  note?: string;
  createdAt: string;
  recurring?: boolean;
}

export interface Budget {
  id: string;
  /** YYYY-MM */
  month: string;
  /** "overall" for the catch-all monthly budget, otherwise a category id. */
  categoryId: string;
  amount: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline?: string;
  color: string;
  icon: string;
}

export interface Profile {
  name: string;
  email: string;
  currency: string;
  monthlyIncome: number;
  onboarded: boolean;
  demo: boolean;
}

export interface UserData {
  version: number;
  profile: Profile | null;
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
}

export interface Category {
  id: string;
  name: string;
  type: TxType;
  /** Lucide icon name, resolved in components. */
  icon: string;
  color: string;
  keywords: string[];
}

export interface MonthTotals {
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryTotal {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  count: number;
  pct: number;
}

export interface TrendPoint {
  month: string; // YYYY-MM
  label: string;
  income: number;
  expenses: number;
  net: number;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  pct: number;
  over: boolean;
  warning: boolean;
}

export interface AlertItem {
  id: string;
  kind: "budget" | "goal" | "insight";
  severity: "info" | "warning" | "danger" | "success";
  title: string;
  message: string;
  link?: string;
}