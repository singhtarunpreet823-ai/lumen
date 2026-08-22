"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Wallet, Target, Sparkles, Settings,
  LogOut, Menu, X, Home,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/primitives";
import { useLumen, useProfile } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchTrigger } from "@/components/dashboard/site-search";
import { initials } from "@/lib/format";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/copilot", label: "AI Copilot", icon: Sparkles, badge: "AI" },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const profile = useProfile();
  const resetAll = useLumen((s) => s.resetAll);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => NAV.map((item) => ({ ...item, active: pathname === item.href || pathname.startsWith(item.href + "/") })),
    [pathname],
  );

  const logout = () => {
    resetAll();
    router.push("/login");
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface/50 px-3 py-6 backdrop-blur-xl lg:flex">
        <div className="flex items-center justify-between px-3">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto no-scrollbar">
          {items.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>
        <div className="mt-4 border-t border-border pt-4">
          <div className="mb-3">
            <SearchTrigger />
          </div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            {profile ? <Avatar name={profile.name} /> : <Avatar name="Guest" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{profile?.name ?? "Guest"}</p>
              <p className="truncate text-xs text-muted">{profile?.email ?? "Not signed in"}</p>
            </div>
            <button
              onClick={logout}
              aria-label="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-expense cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/70 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-2 cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col gap-1 border-l border-border bg-surface p-4 lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="mb-4 flex items-center justify-between px-2">
                <Logo />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-2 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1">
                {items.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      setOpen(false);
                      router.push(item.href);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors cursor-pointer",
                      item.active ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-2 hover:text-ink",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-4 border-t border-border pt-4">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-expense cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-surface/85 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {NAV.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 px-3 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active ? "text-primary" : "text-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-xl bg-primary/10"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
        />
      )}
      <Icon className="relative z-10 h-4 w-4" />
      <span className="relative z-10">{label}</span>
      {badge && (
        <span className="relative z-10 ml-auto rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function useSidebar() {
  return { profile: useProfile(), initials: (n: string) => initials(n) };
}