"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Utensils, ShoppingCart, Car, Home, Zap, Repeat,
  ShoppingBag, Clapperboard, HeartPulse, Plane, GraduationCap, Sparkles, Receipt,
  Briefcase, Laptop, TrendingUp as TrendIcon, Gift, Target, Shield, Minus,
} from "lucide-react";
import { formatCurrency, formatCurrencySigned } from "@/lib/format";
import { getCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts";
import type { Transaction } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  utensils: Utensils, "shopping-cart": ShoppingCart, car: Car, home: Home, zap: Zap,
  repeat: Repeat, "shopping-bag": ShoppingBag, clapperboard: Clapperboard,
  "heart-pulse": HeartPulse, plane: Plane, "graduation-cap": GraduationCap,
  sparkles: Sparkles, receipt: Receipt, briefcase: Briefcase, laptop: Laptop,
  "trending-up": TrendIcon, gift: Gift, target: Target, shield: Shield,
};

export function CategoryIcon({ icon, color, size = "md", className }: { icon: string; color: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const Cmp = ICON_MAP[icon] ?? Receipt;
  const dims = size === "sm" ? "h-8 w-8 rounded-lg" : size === "lg" ? "h-12 w-12 rounded-xl" : "h-10 w-10 rounded-xl";
  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-5.5 w-5.5" : "h-4.5 w-4.5";
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center", dims, className)}
      style={{ background: `${color}1f`, color }}
    >
      <Cmp className={cn("h-4 w-4", iconSize)} />
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  tone = "default",
  spark,
  delay = 0,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  tone?: "default" | "income" | "expense" | "accent";
  spark?: number[];
  delay?: number;
}) {
  const toneColor =
    tone === "income" ? "#10b981" : tone === "expense" ? "#f43f5e" : tone === "accent" ? "#8b5cf6" : "rgb(var(--primary))";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="card relative overflow-hidden p-5"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink">{value}</p>
          {typeof delta === "number" && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium">
              {delta >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-income" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-expense" />
              )}
              <span className={delta >= 0 ? "text-income" : "text-expense"}>
                {formatCurrencySigned(delta)}
              </span>
              {deltaLabel && <span className="text-muted">{deltaLabel}</span>}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${toneColor}1f`, color: toneColor }}
          >
            {icon}
          </div>
        )}
      </div>
      {spark && (
        <div className="pointer-events-none absolute -bottom-2 right-2 w-28 opacity-40">
          <Sparkline data={spark} color={toneColor} height={36} />
        </div>
      )}
    </motion.div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function TransactionRow({
  tx,
  currency,
  onEdit,
  onDelete,
  showDate = true,
}: {
  tx: Transaction;
  currency: string;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
  showDate?: boolean;
}) {
  const cat = getCategory(tx.categoryId);
  const isIncome = tx.type === "income";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2/70"
    >
      <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{tx.merchant}</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-muted">
          {cat.name}
          {tx.recurring && <span className="rounded bg-surface-2 px-1 py-px text-[10px]">recurring</span>}
          {showDate && <span className="hidden sm:inline">· {formatDateShort(tx.date)}</span>}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {onEdit && (
          <button
            onClick={() => onEdit(tx)}
            className="rounded-lg p-2 text-muted opacity-0 transition-all hover:bg-surface-2 hover:text-ink group-hover:opacity-100 cursor-pointer"
            aria-label={`Edit ${tx.merchant}`}
          >
            <EditIcon />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(tx)}
            className="rounded-lg p-2 text-muted opacity-0 transition-all hover:bg-surface-2 hover:text-expense group-hover:opacity-100 cursor-pointer"
            aria-label={`Delete ${tx.merchant}`}
          >
            <TrashIcon />
          </button>
        )}
        <span className={cn("w-24 text-right text-sm font-semibold tabular-nums", isIncome ? "text-income" : "text-ink")}>
          {isIncome ? "+" : "-"}
          {formatCurrency(tx.amount, currency)}
        </span>
      </div>
    </motion.div>
  );
}

function formatDateShort(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  );
}

export function DeltaPill({ value }: { value: number }) {
  const up = value > 0;
  const flat = value === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        flat ? "bg-surface-2 text-muted" : up ? "bg-income/10 text-income" : "bg-expense/10 text-expense",
      )}
    >
      {flat ? <Minus className="h-3 w-3" /> : up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {formatCurrencySigned(value)}
    </span>
  );
}