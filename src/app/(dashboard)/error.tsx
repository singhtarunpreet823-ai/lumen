"use client";

import { Button } from "@/components/ui/primitives";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-display text-5xl">😵</p>
      <h2 className="font-display text-xl font-semibold text-ink">Something went sideways</h2>
      <p className="max-w-sm text-sm text-muted">
        {error.message || "An unexpected error occurred. Your data is safe."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}