import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Privacy & Terms",
  description:
    "How Lumen handles your data: no tracking, local-first storage, and the terms that apply when you use the app.",
};

const UPDATED = "August 22, 2026";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border pt-10 first:border-t-0 first:pt-0">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted [&_strong]:text-ink">{children}</div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <div id="main" className="mx-auto min-h-screen w-full max-w-2xl px-4 py-16 sm:py-20">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Lumen home">
          <Logo />
        </Link>
        <Link
          href="/"
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          Back to site
        </Link>
      </div>

      <h1 className="mt-12 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Privacy &amp; Terms
      </h1>
      <p className="mt-2 text-xs uppercase tracking-wider text-muted">Last updated: {UPDATED}</p>

      <div className="mt-10 space-y-10 pb-20">
        <Section id="privacy" title="Privacy">
          <p>
            Lumen is local-first. In demo mode <strong>all of your data stays in your browser</strong> — it is
            never uploaded to a server, shared with third parties, or used for advertising. There are no analytics
            scripts, no fingerprinting and no cross-site trackers on this site.
          </p>
          <p>
            If you connect a Supabase backend, your email address and hashed password are stored for
            authentication, and your finance records are stored in a private PostgreSQL database where{" "}
            <strong>row-level security</strong> restricts every read and write to your own account.
          </p>
        </Section>

        <Section id="cookies" title="Cookies & local storage">
          <p>
            Lumen sets no advertising or tracking cookies. It uses browser <strong>local storage</strong> only
            for: your theme preference, your dismissal of notices like the privacy banner, and (in demo mode)
            your workspace data. You can erase everything at any time from Settings → Clear all data, or by
            clearing site data in your browser.
          </p>
        </Section>

        <Section id="terms" title="Terms of use">
          <p>
            Lumen is provided as-is for personal, non-commercial use. It offers budgeting tools and insights for
            informational purposes only — <strong>it is not financial advice</strong>. Always verify important
            decisions with a qualified professional.
          </p>
          <p>
            You are responsible for the data you enter. The service may change or discontinue free features at any
            time. Questions? Contact{" "}
            <a href="mailto:hello@lumen.app" className="text-primary hover:underline">
              hello@lumen.app
            </a>
            .
          </p>
        </Section>

        <Section id="security" title="Security summary">
          <p>
            Transport is HTTPS-only with HSTS. Responses carry a strict Content-Security-Policy,
            X-Frame-Options DENY and related hardening headers. Passwords (when Supabase auth is enabled) are
            salted and hashed server-side by Supabase. See the repository&apos;s SECURITY.md for the full audit.
          </p>
        </Section>
      </div>
    </div>
  );
}
