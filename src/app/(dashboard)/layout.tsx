"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SiteSearch } from "@/components/dashboard/site-search";
import { useLumen } from "@/lib/store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const profile = useLumen((s) => s.data.profile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !profile) {
      router.replace("/login");
    }
  }, [mounted, profile, router]);

  if (!mounted || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div id="main" className="flex min-h-screen bg-bg">
      <Sidebar />
      <SiteSearch />
      <main className="relative min-w-0 flex-1 pb-20 lg:pb-0">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}