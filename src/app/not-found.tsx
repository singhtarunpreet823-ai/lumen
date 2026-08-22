import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(rgb(var(--border)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
      <Logo />
      <p className="mt-10 font-display text-7xl font-semibold tracking-tight text-ink sm:text-8xl">404</p>
      <h1 className="mt-3 font-display text-xl font-semibold text-ink sm:text-2xl">
        This page spent more than it had.
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        The page you are looking for does not exist or has been moved. Your data is safe — nothing was lost.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button size="lg" className="w-full sm:w-auto">
            <Home className="h-4 w-4" /> Back to home
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            <Search className="h-4 w-4" /> Open dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
