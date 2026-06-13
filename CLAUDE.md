# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The `@AGENTS.md` import above is load-bearing: this repo runs a Next.js build whose
> APIs and conventions may differ from training data. Before changing Next.js behavior,
> read the relevant guide under `node_modules/next/dist/docs/`.

## Commands

```bash
npm run dev      # local dev server (localhost:3000)
npm run build    # production build
npm run start    # serve production build
npm run lint     # next lint (eslint-config-next)
```

There is no test runner configured — no `test` script and no test files exist.

Supabase migrations are applied manually (not in any build step):

```bash
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push
```

Stripe webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copy printed signing secret into STRIPE_WEBHOOK_SECRET
```

## Architecture

PayLink is a single-deployable full-stack Next.js 14 App Router app (UI routes, API routes,
and domain logic in one repo). Stack: Supabase (Auth + Postgres + RLS), Stripe Checkout,
Tailwind + shadcn/ui, TanStack Query v5, React Hook Form + Zod. TypeScript is strict and all
imports use the `@/*` alias (maps to repo root).

### Supabase clients — pick the right tier

There are three factory functions and they are NOT interchangeable. Never call
`@supabase/supabase-js` or `@supabase/ssr` directly:

- `lib/supabase/client.ts` — `createBrowserSupabaseClient()` (singleton, browser only)
- `lib/supabase/server.ts` — `createServerSupabaseClient()` (cookie-aware, RLS-scoped to the
  signed-in user; use in server components and API routes for user-scoped reads/writes)
- `lib/supabase/middleware.ts` — used only by `middleware.ts` to refresh auth cookies
- `lib/supabase/admin.ts` — `createAdminSupabaseClient()` (service-role key, **bypasses RLS**).
  Used only in trusted server contexts that act without a user session, e.g. Stripe webhook
  payment sync. Do not use it to shortcut RLS in user-facing request paths.

### Auth is server-first

Route protection happens in three server layers; do not add client-only auth guards:

1. `middleware.ts` → `lib/supabase/middleware.ts` refreshes cookies and redirects
   unauthenticated users away from `/dashboard` and `/links` (to `/login?next=...`), and
   authenticated users away from `/login` / `/signup`.
2. `app/(dashboard)/layout.tsx` (server component) loads `auth.getUser()` + the `profiles` row
   and redirects to `/login` if absent, then feeds `AuthProvider` (`contexts/auth-context.tsx`).
3. Client components consume that context; they use the browser client only for
   sign-in/up/out mutations.

### Payments are webhook-first with a success-page fallback

- `/api/pay/checkout` creates the Stripe Checkout Session (with `link_id` in `metadata`).
- `/api/webhooks/stripe` is signature-verified (`lib/stripe/webhook.ts`) and **idempotent by
  `stripe_session_id`** — `upsertPaymentFromSession` (`lib/stripe/payment-sync.ts`) inserts if
  the session id is new, otherwise updates. Preserve this idempotency when touching payments.
- `/pay/[slug]/success` calls `/api/pay/confirm` as a recovery sync in case webhook delivery
  is delayed; both paths converge on the same upsert logic.
- Payment history is protected: links with payments cannot be deleted at the API level, and
  migration `20260421142000_preserve_payments_on_link_delete.sql` sets `payments.link_id` FK
  to `ON DELETE RESTRICT`.

### Conventions

- **UI copy is centralized** in `lib/constants/copy.ts` (`marketingCopy`, `authCopy`,
  `dashboardCopy`, `linkCopy`). API routes also return error strings from here — don't
  hardcode user-facing strings in components or routes.
- **Validation**: Zod schemas in `lib/validations/**` (`auth.schema.ts`, `link.schema.ts`,
  `pay.schema.ts`) back both form validation and API payload parsing; use the inferred types.
  API routes typically `schema.parse(...)` and catch `ZodError` → 400.
- **Avoid `select('*')`** in query paths — select explicit columns (see `app/api/links/route.ts`).
- **DB types** are hand-maintained in `types/database.ts`; keep them in sync with
  `supabase/migrations/**` when the schema changes.
- Stripe and admin Supabase clients are lazily-initialized singletons that throw if their env
  vars are missing — expect setup errors to surface as thrown `Error`s, not silent failures.
- Money: amounts are stored in major units; convert to cents (`* 100`) only at the Stripe
  boundary.

### Data model (Supabase)

Core tables `profiles`, `payment_links`, `link_views`, `payments`, plus an `auth.users`
trigger that seeds a profile. Schema + RLS live in
`supabase/migrations/20260420120000_initial_schema.sql`.

### Required environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
VIEW_HASH_SALT
```
