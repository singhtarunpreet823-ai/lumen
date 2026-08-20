import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/* ---------- Button ---------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:brightness-110 active:scale-[0.98] shadow-[0_8px_24px_-10px_rgb(var(--primary)/0.6)]",
  secondary: "bg-surface-2 text-ink hover:bg-border/60 active:scale-[0.98]",
  ghost: "text-ink/80 hover:bg-surface-2 active:scale-[0.98]",
  danger: "bg-expense text-white hover:brightness-110 active:scale-[0.98]",
  outline: "border border-border bg-transparent text-ink hover:bg-surface-2 active:scale-[0.98]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

/* ---------- Card ---------- */

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 p-5 pb-0", className)}>
      <div className="min-w-0">
        <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Badge ---------- */

const badgeTones: Record<string, string> = {
  green: "bg-income/10 text-income border-income/20",
  red: "bg-expense/10 text-expense border-expense/20",
  amber: "bg-warning/10 text-warning border-warning/20",
  violet: "bg-accent/10 text-accent border-accent/20",
  blue: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  slate: "bg-muted/10 text-muted border-muted/20",
};

export function Badge({
  tone = "slate",
  className,
  children,
}: {
  tone?: keyof typeof badgeTones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Progress ---------- */

export function Progress({
  value,
  className,
  barClassName,
  tone,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  tone?: "default" | "danger" | "warning" | "success";
}) {
  const v = Math.min(100, Math.max(0, value));
  const toneCls =
    tone === "danger" ? "bg-expense" : tone === "warning" ? "bg-warning" : tone === "success" ? "bg-income" : "bg-primary";
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", toneCls, barClassName)}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

/* ---------- Skeleton ---------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

/* ---------- Spinner ---------- */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-muted", className)} />;
}

/* ---------- Form controls ---------- */

export const inputBase =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 transition-all duration-200 hover:border-primary/40 focus:border-primary/60 focus:ring-4 focus:ring-primary/10 outline-none disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(inputBase, className)} {...props} />,
);
Input.displayName = "Input";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(inputBase, "appearance-none pr-8 bg-no-repeat cursor-pointer", className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(inputBase, "min-h-[80px] resize-y", className)} {...props} />,
);
Textarea.displayName = "Textarea";

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("mb-1.5 block text-xs font-medium text-ink/80", className)} {...props}>
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-expense">{message}</p>;
}

/* ---------- Empty state ---------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
      {icon && <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-muted">{icon}</div>}
      <div>
        <p className="font-display font-semibold text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Segmented control ---------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-xl border border-border bg-surface-2 p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer",
            value === o.value ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Avatar ---------- */

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-white",
        className,
      )}
    >
      {initials || "F"}
    </div>
  );
}