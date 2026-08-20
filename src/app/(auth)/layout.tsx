import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden border-r border-border bg-surface p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(600px circle at 20% 20%, rgb(16 185 129 / 0.14), transparent 60%), radial-gradient(700px circle at 80% 80%, rgb(139 92 246 / 0.16), transparent 60%)",
          }}
        />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-md">
          <p className="font-display text-3xl font-semibold leading-snug tracking-tight text-ink">
            Money clarity,
            <br />
            <span className="text-gradient">with a copilot</span> in your pocket.
          </p>
          <p className="mt-4 text-muted">
            Lumen turns your transactions into insight — budgets that actually stick, goals you reach, and answers to
            questions you never knew to ask.
          </p>
        </div>
        <div className="relative flex items-center gap-3 text-sm text-muted">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-income/10 text-income">✓</span>
          Bank-grade encryption
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-income/10 text-income">✓</span>
          AI analysis
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-income/10 text-income">✓</span>
          Free forever
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}