"use client";

import { ShieldCheck, Lock, KeyRound, Server, EyeOff, FileCheck2 } from "lucide-react";
import { Section, BentoCard } from "@/components/landing/sections";

export function Security() {
  return (
    <Section
      id="security"
      eyebrow="Security"
      title={
        <>
          Your money data, <span className="text-gradient">locked down</span>
        </>
      }
      subtitle="Lumen is built on Postgres with row-level security — every query is scoped to your account at the database layer."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BentoCard className="sm:col-span-2">
          <div className="flex h-full flex-col">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-income/15 text-income">
              <Lock className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold text-ink">Row-level security</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Your transactions, budgets and goals live in PostgreSQL tables protected by RLS policies. Even a leaked
              API key can only ever see <em>your</em> rows.
            </p>
            <div className="mt-4 flex-1 rounded-2xl border border-border bg-surface/60 p-4 font-mono text-[10px] leading-relaxed">
              <p className="text-muted">-- policy on transactions</p>
              <p className="text-ink">
                using (<span className="text-primary">auth.uid()</span> = user_id)
              </p>
              <p className="mt-2 text-muted">-- your query</p>
              <p className="text-ink">
                select * from <span className="text-accent">transactions</span>
              </p>
              <p className="text-muted">-- returns 1,248 rows</p>
              <p className="text-ink">-- only ever yours</p>
            </div>
          </div>
        </BentoCard>

        <BentoCard>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-500">
            <KeyRound className="h-5 w-5" />
          </span>
          <h3 className="mt-5 font-display text-lg font-semibold text-ink">Auth built-in</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Email/password and OAuth sign-in backed by Supabase Auth, with sessions and per-user profiles.
          </p>
        </BentoCard>

        <BentoCard>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning/15 text-warning">
            <EyeOff className="h-5 w-5" />
          </span>
          <h3 className="mt-5 font-display text-lg font-semibold text-ink">Private by default</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            No tracking, no ads, no selling data. Your balances are your business.
          </p>
        </BentoCard>

        <BentoCard>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h3 className="mt-5 font-display text-lg font-semibold text-ink">Encryption everywhere</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            TLS 1.3 in transit, AES-256 at rest, and standard OWASP practices on every endpoint.
          </p>
        </BentoCard>

        <BentoCard className="sm:col-span-2">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <FileCheck2 className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">Full data ownership</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Export everything as JSON anytime from Settings. Delete your account, delete every byte — it's gone.
              </p>
            </div>
            <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
              <Server className="h-8 w-8 text-muted" />
              <div>
                <p className="text-xs font-semibold text-ink">PostgreSQL</p>
                <p className="text-[10px] text-muted">Backed by Supabase</p>
              </div>
            </div>
          </div>
        </BentoCard>

        <BentoCard>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-400/15 text-rose-400">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h3 className="mt-5 font-display text-lg font-semibold text-ink">Audit-friendly</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Deterministic analytics and full query history — the copilot shows its work, always.
          </p>
        </BentoCard>
      </div>
    </Section>
  );
}