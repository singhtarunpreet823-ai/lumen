"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/format";

function ChartTooltip({
  active,
  payload,
  label,
  currency = "USD",
  prefix,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency?: string;
  prefix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface/95 px-3 py-2 shadow-xl backdrop-blur-xl">
      {label && <p className="mb-1 text-xs font-medium text-muted">{label}</p>}
      <div className="space-y-0.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color ?? p.fill }} />
              {p.name}
            </span>
            <span className="font-medium text-ink">
              {formatCurrency(Number(p.value), currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CashflowChart({
  data,
  currency = "USD",
  height = 260,
  type = "line",
}: {
  data: { label: string; income: number; expenses: number; net: number }[];
  currency?: string;
  height?: number;
  type?: "line" | "area";
}) {
  const chartData = data.map((d) => ({ ...d, income: Number(d.income), expenses: Number(d.expenses), net: Number(d.net) }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgb(var(--border))" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
            />
            <Tooltip content={<ChartTooltip currency={currency} />} />
            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#gIncome)" name="Income" />
            <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gExpense)" name="Expenses" />
          </AreaChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgb(var(--border))" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} />
            <YAxis axisLine={false} tickLine={false} width={52} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)} />
            <Tooltip content={<ChartTooltip currency={currency} />} />
            <Area type="monotone" dataKey="net" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gNet)" name="Net" />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDonut({
  data,
  currency = "USD",
  height = 260,
  centerLabel,
}: {
  data: { name: string; value: number; color: string }[];
  currency?: string;
  height?: number;
  centerLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={3}
            strokeWidth={0}
            cornerRadius={6}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip currency={currency} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-muted">{centerLabel ?? "Total"}</span>
        <span className="font-display text-xl font-bold text-ink">{formatCurrency(total, currency)}</span>
      </div>
    </div>
  );
}

export function CategoryBars({
  data,
  currency = "USD",
  height = 260,
}: {
  data: { name: string; value: number; color: string }[];
  currency?: string;
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={110} tick={{ fontSize: 12 }} />
          <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ fill: "rgb(var(--surface-2))" }} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BudgetRadial({
  value,
  label,
  color = "#8b5cf6",
  height = 220,
}: {
  value: number;
  label: string;
  color?: string;
  height?: number;
}) {
  const data = [{ name: "used", value: Math.min(100, Math.max(0, value)), fill: color }];
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={data}
          innerRadius="75%"
          outerRadius="100%"
          startAngle={220}
          endAngle={-40}
          barSize={14}
        >
          <Pie
            data={[{ value: 100 }]}
            dataKey="value"
            cx="50%"
            cy="50%"
            startAngle={220}
            endAngle={-40}
            innerRadius="75%"
            outerRadius="100%"
            fill="rgb(var(--surface-2))"
            stroke="none"
          />
          <RadialBar dataKey="value" cornerRadius={8} background={false} />
          <Tooltip content={() => null} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-ink">{value}%</span>
        <span className="text-xs text-muted">{label}</span>
      </div>
    </div>
  );
}

export function Sparkline({
  data,
  color = "rgb(var(--primary))",
  height = 44,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill="url(#spark)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}