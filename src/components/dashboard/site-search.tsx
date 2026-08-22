"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, LayoutDashboard, ArrowLeftRight, PieChart, Wallet, Target, Sparkles, Settings } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useLumen } from "@/lib/store";
import { getCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Result = { id: string; label: string; sub: string; href: string; icon: React.ReactNode };

const PAGES = [
  { label: "Overview", sub: "Dashboard home", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Transactions", sub: "Search, add and manage", href: "/transactions", icon: <ArrowLeftRight className="h-4 w-4" /> },
  { label: "Analytics", sub: "Trends and projections", href: "/analytics", icon: <PieChart className="h-4 w-4" /> },
  { label: "Budgets", sub: "Monthly category limits", href: "/budgets", icon: <Wallet className="h-4 w-4" /> },
  { label: "Goals", sub: "Savings goals and progress", href: "/goals", icon: <Target className="h-4 w-4" /> },
  { label: "AI Copilot", sub: "Ask about your money", href: "/copilot", icon: <Sparkles className="h-4 w-4" /> },
  { label: "Settings", sub: "Profile, export, data", href: "/settings", icon: <Settings className="h-4 w-4" /> },
];

export function SearchTrigger() {
  return (
    <button
      onClick={() => document.dispatchEvent(new Event("lumen:search"))}
      aria-label="Search (Ctrl+K)"
      className="hidden w-full cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface-2/50 px-3 py-2.5 text-left text-sm text-muted transition-colors hover:border-primary/30 hover:text-ink lg:flex"
    >
      <Search className="h-3.5 w-3.5" />
      Search…
      <kbd className="ml-auto rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted">
        Ctrl K
      </kbd>
    </button>
  );
}

export function SiteSearch() {
  const router = useRouter();
  const data = useLumen((s) => s.data);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const openEvent = () => setOpen(true);
    document.addEventListener("keydown", handler);
    document.addEventListener("lumen:search", openEvent);
    return () => {
      document.removeEventListener("keydown", handler);
      document.removeEventListener("lumen:search", openEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const query = q.trim().toLowerCase();
    const pages: Result[] = PAGES.filter(
      (p) => !query || p.label.toLowerCase().includes(query) || p.sub.toLowerCase().includes(query),
    ).map((p) => ({ id: p.href, label: p.label, sub: p.sub, href: p.href, icon: p.icon }));

    const goals: Result[] = data.goals
      .filter((g) => query && g.name.toLowerCase().includes(query))
      .map((g) => ({
        id: `goal-${g.id}`,
        label: g.name,
        sub: "Savings goal",
        href: "/goals",
        icon: <Target className="h-4 w-4" />,
      }));

    const budgets: Result[] = Array.from(
      new Set(data.budgets.map((b) => b.categoryId)),
    )
      .filter((cid) => query && getCategory(cid).name.toLowerCase().includes(query))
      .map((cid) => ({
        id: `budget-${cid}`,
        label: `${getCategory(cid).name} budget`,
        sub: "Budget",
        href: "/budgets",
        icon: <Wallet className="h-4 w-4" />,
      }));

    return [...pages, ...goals, ...budgets].slice(0, 9);
  }, [q, data.goals, data.budgets]);

  const go = (r: Result) => {
    setOpen(false);
    router.push(r.href);
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} className="max-w-xl">
        <div>
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, results.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === "Enter" && results[active]) {
                  go(results[active]);
                }
              }}
              placeholder="Search pages, goals, budgets…"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              aria-label="Search Lumen"
            />
            <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted">esc</kbd>
          </div>
          <ul className="max-h-80 overflow-y-auto pt-2">
            {results.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-muted">No matches for “{q}”</li>
            )}
            {results.map((r, i) => (
              <li key={r.id}>
                <button
                  onClick={() => go(r)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    i === active ? "bg-surface-2" : "",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      i === active ? "bg-primary/15 text-primary" : "bg-surface-2 text-muted",
                    )}
                  >
                    {r.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{r.label}</span>
                    <span className="block truncate text-xs text-muted">{r.sub}</span>
                  </span>
                  {i === active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Dialog>
    </>
  );
}
