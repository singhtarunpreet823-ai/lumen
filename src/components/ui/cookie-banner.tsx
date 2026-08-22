"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";

const KEY = "lumen:cookie-ok";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) {
        const t = setTimeout(() => setShow(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          role="dialog"
          aria-label="Privacy notice"
          className="glass-strong fixed bottom-4 left-4 right-4 z-[70] mx-auto flex max-w-xl items-start gap-3 rounded-2xl p-4 shadow-glass sm:left-6 sm:right-auto sm:bottom-6"
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">No tracking here</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              Lumen uses no analytics or advertising cookies. Only your preferences and (in demo mode) your
              finance data are stored locally in this browser.{" "}
              <a href="/legal#cookies" className="text-primary hover:underline">
                Details
              </a>
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss privacy notice"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
