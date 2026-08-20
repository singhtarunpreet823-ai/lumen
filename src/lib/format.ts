import { format, parseISO } from "date-fns";

export function formatCurrency(amount: number, currency = "USD", opts?: { compact?: boolean }) {
  const value = Math.abs(amount);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: opts?.compact ? "compact" : "standard",
      maximumFractionDigits: opts?.compact ? 1 : 0,
    }).format(value);
  } catch {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
}

export function formatCurrencySigned(amount: number, currency = "USD") {
  const sign = amount < 0 ? "-" : "+";
  return `${sign}${formatCurrency(Math.abs(amount), currency)}`;
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function formatMonthKey(date: Date): string {
  return format(date, "yyyy-MM");
}

export function monthKeyLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

export function monthKeyFullLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatDate(iso: string, style: "short" | "medium" | "long" = "medium") {
  try {
    const d = parseISO(iso);
    if (style === "short") return format(d, "MMM d");
    if (style === "long") return format(d, "EEEE, MMMM d");
    return format(d, "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}