"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/components/theme";

export function Toaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      position="top-center"
      theme={theme}
      toastOptions={{
        style: {
          background: theme === "dark" ? "rgba(15,18,27,0.92)" : "rgba(255,255,255,0.92)",
          border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          color: theme === "dark" ? "#f1f5f9" : "#0f172a",
          backdropFilter: "blur(12px)",
          borderRadius: "14px",
        },
      }}
    />
  );
}