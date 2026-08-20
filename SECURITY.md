# Security

Lumen's security posture, verified against the live deployment.

## Current architecture (demo mode — what's live today)

- **No data leaves the device.** The live site runs fully in-browser: transactions,
  budgets, and goals live in `localStorage` under `lumen:data`. There is no server,
  no database, no tracking, no analytics, and no third-party requests at runtime.
- **Nothing personal is collected** — no email, no IP logging, no cookies beyond a
  theme preference and (optionally) a local session.
- If Supabase env vars are configured, email/password auth is handled by Supabase
  (bcrypt-hashed server-side, rate-limited).

## Verified controls

| Control | Status |
| --- | --- |
| XSS / HTML injection sinks (`dangerouslySetInnerHTML`, `eval`, raw `innerHTML`) | None — React auto-escaping only |
| Secrets in repo (API keys, tokens, `.env`) | None tracked; `.env.example` only |
| Service-role (admin) Supabase key in client code | Never used — anon key only |
| Row-level security (when Supabase enabled) | Every table: select/insert/update/delete scoped to `auth.uid()`; no public policies |
| Transport | HTTPS only (Vercel default, HSTS preload header) |
| Headers | CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` |

## Threat model notes

- **localStorage caveat**: demo data is readable by anyone with physical access to
  the browser. For real multi-user data, wire the Supabase backend (schema + RLS
  already in `supabase/migrations/0001_init.sql`) — the same app code then stores
  rows server-side where RLS enforces per-user isolation.
- **CSP `unsafe-inline`**: required by Next.js App Router's inline hydration
  scripts/styles; risk is mitigated because the app has zero HTML-injection sinks.
- **Never expose the Supabase `service_role` key** anywhere client-side; it bypasses RLS.
- **The Vercel CLI token used during setup was revoked** after deployment.

## Rules for contributors

1. Never commit `.env`, tokens, or keys. Use `.env.example` as the template.
2. Keep all new user content rendered through React (`{value}`) — never HTML strings.
3. New Supabase tables must ship with `user_id` + RLS policies mirroring `0001_init.sql`.
4. Server-only secrets (`service_role`, OpenAI keys) belong in server routes / env vars,
   never in `NEXT_PUBLIC_*`.
