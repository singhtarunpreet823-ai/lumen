import { cn } from "@/lib/utils";

export function Logo({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-violet-500 shadow-[0_8px_24px_-8px_rgb(16_185_129/0.7)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 18L9 12L13 15L20 7"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="7" r="1.6" fill="white" />
        </svg>
      </span>
      {showWord && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          lumen
        </span>
      )}
    </span>
  );
}