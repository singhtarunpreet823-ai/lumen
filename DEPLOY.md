# 🚀 Deploying Lumen 24/7

Lumen is a static-friendly Next.js app: all pages pre-render and the demo mode is 100% client-side.
That makes it cheap and bulletproof to host. This is the exact path I recommend — **$0/month**.

---

## Step 1 — Put the code on GitHub

```bash
# from the project root
git init
git add -A
git commit -m "Lumen: personal finance dashboard with an AI copilot"
```

Then on github.com: **New repository** → `lumen` (private or public — public looks better in a portfolio) → copy the remote URL and run:

```bash
git remote add origin https://github.com/<your-username>/lumen.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Deploy to Vercel (free, runs 24/7)

1. Sign up at [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New → Project** → import the `lumen` repo.
3. Framework preset auto-detects **Next.js**. Leave the defaults.
4. Add the environment variables (Settings → Environment Variables):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL (only if doing Step 3) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key (only if doing Step 3) |

   > Without these, the site runs in **demo mode** — which is fine. It deploys and works immediately.
5. Click **Deploy**. In ~2 minutes you get a live URL like `lumen-xyz.vercel.app`.

**That's it — the site is now online 24/7.** Every future `git push` to `main` auto-deploys.

---

## Step 3 — Optional: real backend with Supabase (free)

The app ships with a full PostgreSQL schema including **row-level security**.
Current wiring: Supabase powers **auth** (email/password login). Transactions/budgets/goals still live in the browser (demo mode) until you wire the data sync — the schema is ready when you are.

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste the contents of `supabase/migrations/0001_init.sql` → **Run**.
3. In **Project Settings → API**, copy the project URL and the anon key.
4. Add them as the two Vercel env vars above, then **Redeploy**.

---

## Step 4 — Optional: your own domain

Vercel → Project → **Settings → Domains** → add `lumen.dev` (or whatever). Follow the DNS instructions (CNAME to `cname.vercel-dns.com`). SSL is automatic.

Recommended: `lumen.dev` / `lumen.finance` / `getlumen.app` / `lumen.so`.

---

## Step 5 — Optional: GPT-powered copilot

The AI Copilot currently uses a built-in analysis engine (zero API keys, deterministic — great for demos).
To plug in an LLM later:

1. Add `OPENAI_API_KEY` to Vercel env vars (server-only — never expose it in the browser).
2. Create `src/app/api/copilot/route.ts` that takes the user's query + a compact financial summary, calls the OpenAI API, and streams the answer back.

---

## Day-to-day ops

| Task | Command |
| --- | --- |
| Local dev | `npm run dev` |
| Update site | `git add -A && git commit -m "…" && git push` |
| Check deploy | Vercel dashboard → your project → Deployments |
| Rollback | Vercel → Deployments → ⋯ → Promote previous deployment |

## Cost & limits

- **Vercel free tier**: 100 GB bandwidth/mo — plenty for a portfolio site. Site is mostly static so it never sleeps or cold-starts.
- **Supabase free tier**: 500 MB DB, 50k active users/mo — plenty.
- Total cost: **$0/month** until you need a domain (~$10/yr) or more scale.

## Checklist

- [ ] GitHub repo pushed
- [ ] Vercel project deployed + live URL works
- [ ] (Optional) Supabase project + migration run
- [ ] (Optional) Custom domain
- [ ] (Optional) OpenAI key for LLM copilot
