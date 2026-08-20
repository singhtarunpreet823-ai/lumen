# Lumen 💚

**Understand your money. Build your future.**

A polished, production-style personal-finance dashboard with an **AI Financial Copilot** — built like a real SaaS product: Next.js + TypeScript + Tailwind, a calm bento-grid UI with frosted-glass accents, Recharts visualizations, a subtle Three.js hero scene, and a PostgreSQL/Supabase-ready data layer with row-level security.

> It runs **instantly in demo mode** — no database, no API keys. A fully seeded demo workspace (realistic transactions across 9 months, budgets, goals) is one click away, so you can explore every feature before registering.

---

## ✨ Features

- 💰 **Transactions** — add/edit/delete income & expenses with optimistic UI, instant auto-categorization, search, filters (type/category/month) and sorting
- 📊 **Analytics** — cash-flow trends, category donut & bars, top merchants, discretionary vs essential split, month-end projections, savings rate
- 🏷️ **Auto-categorization** — smart keyword matching ("Starbucks" → Food & Dining, "Shell Gas" → Transport), with inline "auto-detected" suggestions
- 🎯 **Savings goals** — progress rings, quick contributions, deadlines, "goal reached" celebrations
- 📅 **Budgets** — overall + per-category monthly limits with at-a-glance radials and progress bars
- 🔔 **Budget alerts** — at 80% you're warned; over 100% you're flagged, surfaced on the dashboard and home page
- 🤖 **AI Financial Copilot** — ask natural-language questions about your real data:
  - *"Where did I spend the most this month?"* → top categories + donut chart
  - *"Can I afford a $1,200 laptop?"* → verdict from cash flow, projections & budget
  - *"Why was my spending higher this month?"* → month-over-month category forensics
  - *"How can I reduce my unnecessary spending?"* → quantified reduction plan
  - …plus trends, forecasts, subscriptions, goals, budget status and a general snapshot. Every answer can render its underlying chart inline.
- 🌙 **Light / dark themes** — calm, minimal, frosted-glass in both
- 📱 **Fully responsive** — sidebar on desktop, drawer + bottom nav on mobile
- 🌐 **Landing page** — 3D animated hero, bento feature grid, **interactive live demo**, AI copilot showcase, security, pricing, and more

## 🧱 Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Motion | Framer Motion, Three.js / React Three Fiber (hero scene) |
| Charts | Recharts |
| State | Zustand + persist (optimistic UI out of the box) |
| Forms | React Hook Form + Zod |
| Backend | Supabase (PostgreSQL) with **row-level security**, or built-in local demo mode |
| AI | Rule-based financial analysis engine (deterministic, no keys needed) — LLM-ready |

## 🚀 Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Open the app, click **"Explore the live demo"** on the login page — you'll land in a fully seeded workspace. Or create an account.

### Production build

```bash
npm run build
npm start
```

### Sanity-check the AI engine

```bash
npx tsx scripts/ai-smoke.ts   # runs 12 queries against seeded data
```

## 🗄️ Demo mode vs Supabase

**Demo mode (default).** With no env vars set, all data lives in your browser (localStorage) and a seeded demo dataset is generated for you. Great for exploring and for portfolio demos.

**Supabase backend (optional).** Copy `.env.example` → `.env.local` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=   # optional, for LLM-powered copilot responses
```

Then run the migration in `supabase/migrations/0001_init.sql` (SQL editor or `supabase db push`). It creates `profiles`, `transactions`, `budgets` and `goals` tables, enables **row-level security** on every table, and wires an auto-profile trigger on signup.

## 🗂️ Project structure

```
src/
├── app/
│   ├── page.tsx                  # landing page
│   ├── (auth)/login|signup       # auth screens
│   └── (dashboard)/              # app shell + pages
│       ├── dashboard|transactions|analytics|budgets|goals|copilot|settings
├── components/
│   ├── landing/                  # hero (3D), bento features, live demo, copilot, pricing…
│   ├── dashboard/                # sidebar, shared widgets, transaction form
│   ├── charts/                   # Recharts wrappers
│   └── ui/                       # primitives, dialog, logo, theme toggle
├── lib/
│   ├── ai/                       # analysis.ts + engine.ts  → the Copilot brain
│   ├── analytics.ts              # totals, trends, budget statuses, alerts
│   ├── categories.ts             # categories + auto-categorization
│   ├── seed.ts                   # realistic demo data generator
│   ├── store.ts                  # zustand data store (optimistic UI)
│   └── supabase/                 # optional Supabase client
supabase/migrations/0001_init.sql # schema + RLS + signup trigger
```

## 🔐 Security notes

- Every Supabase table uses **RLS** scoped to `auth.uid()`.
- TLS in transit, AES-256 at rest, OWASP-aware form validation (Zod).
- The Copilot only ever reads the signed-in user's own rows.
- You own your data: export JSON or wipe it entirely from Settings.

---

Built with care. Questions, feedback, and pull requests are welcome.