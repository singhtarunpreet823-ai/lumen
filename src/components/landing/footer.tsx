"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Github, Mail, Phone } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/primitives";

const REPO = "https://github.com/singhtarunpreet823-ai/lumen";

export function CTA() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 px-6 py-16 text-center sm:py-20"
        style={{
          background:
            "radial-gradient(700px circle at 50% 0%, rgb(16 185 129 / 0.18), transparent 60%), radial-gradient(700px circle at 50% 120%, rgb(139 92 246 / 0.16), transparent 60%), rgb(var(--surface))",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgb(var(--border)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Free forever plan — no credit card
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl sm:leading-[1.12]">
            Your money finally makes sense.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted">
            Join thousands getting clearer on their money every single day. It takes two minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Create your free account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore the demo first
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Understand your money. Build your future. A calm, modern personal-finance dashboard with an AI copilot.
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href={REPO}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Lumen on GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@lumen.app?subject=Hello%20Lumen"
                aria-label="Email the Lumen team"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="tel:+15550102030"
                aria-label="Call Lumen support"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>
          {[
            {
              title: "Product",
              links: [
                { label: "Features", href: "/#features" },
                { label: "Live demo", href: "/login" },
                { label: "AI Copilot", href: "/#copilot" },
                { label: "Pricing", href: "/#pricing" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "Security", href: "/#security" },
                { label: "FAQ", href: "/#faq" },
                { label: "Source code", href: REPO, external: true },
              ],
            },
            {
              title: "Support",
              links: [
                { label: "hello@lumen.app", href: "mailto:hello@lumen.app" },
                { label: "+1 (555) 010-2030", href: "tel:+15550102030" },
                { label: "Help center", href: "/legal#privacy" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {"external" in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-ink/75 transition-colors hover:text-primary"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-ink/75 transition-colors hover:text-primary">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Lumen. Crafted with care.</p>
          <div className="flex gap-5">
            <Link href="/legal#privacy" className="hover:text-primary">
              Privacy
            </Link>
            <Link href="/legal#terms" className="hover:text-primary">
              Terms
            </Link>
            <Link href="/legal#cookies" className="hover:text-primary">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}