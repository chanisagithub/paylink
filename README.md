# PayLink

PayLink is a production-oriented merchant payment link SaaS built with Next.js App Router, Supabase, Stripe Checkout, shadcn/ui, React Query, and Framer Motion.

## Stack

- Next.js 14 (App Router) + TypeScript (strict)
- Supabase (Auth + Postgres + RLS)
- Stripe (Checkout Sessions + webhooks)
- Tailwind CSS + shadcn/ui
- TanStack Query v5
- React Hook Form + Zod
- Framer Motion
- Recharts

## Architecture decisions

### 1) Single full-stack repo (App + API together)

All frontend and backend logic lives in the same Next.js app:

- UI routes: `app/(auth)`, `app/(dashboard)`, `app/pay/[slug]`
- API routes: `app/api/**`
- Shared domain logic: `lib/**`
- Client data orchestration: `hooks/**`

This keeps product flows (form → API → DB → UI revalidation) in one deployable unit.

### 2) Auth and route protection are server-first

- `middleware.ts` + `lib/supabase/middleware.ts` enforce redirects before rendering protected pages.
- `app/(dashboard)/layout.tsx` validates auth on the server and provides user/profile context to client children.
- Supabase SSR helpers (`@supabase/ssr`) are used for browser, server, and middleware clients.

### 3) Payments are webhook-first with success-page recovery sync

- Checkout is created in `/api/pay/checkout`.
- Stripe webhooks (`/api/webhooks/stripe`) are signature-verified and idempotent by `stripe_session_id`.
- `/pay/[slug]/success` triggers `/api/pay/confirm` as a fallback sync path in case webhook delivery is delayed.

### 4) Data safety: payment history is preserved

- Links with payment history cannot be deleted at API level.
- DB migration `20260421142000_preserve_payments_on_link_delete.sql` changes `payments.link_id` FK to `ON DELETE RESTRICT` (no payment cascade deletes).

### 5) Validation and types

- Zod schemas in `lib/validations/**` are used for API payload validation and form validation.
- Supabase table typing is centralized in `types/database.ts`.
- Production query paths avoid `select('*')`.

### 6) UI architecture

- Shared UI primitives live in `components/ui` (shadcn/ui).
- Dashboard uses a dark system (`#0f0f0f` shell, `#1a1a1a` cards).
- Mobile dashboard navigation collapses to a fixed bottom nav.
- Motion and loading states are deliberate: staggered cards, page transitions, skeletons, toasts, and error boundaries.

## Data model (Supabase)

Core tables:

- `profiles`
- `payment_links`
- `link_views`
- `payments`

Schema and RLS policies live in `supabase/migrations/`.

## Environment setup

1. Copy env template and fill values:

```bash
cp .env.example .env.local
```

2. Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
VIEW_HASH_SALT=
```

3. Install and run:

```bash
npm install
npm run dev
```

## Supabase migrations (manual)

From repo root:

```bash
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push
```

## Stripe webhook (local)

Forward Stripe events to local app:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Vercel deployment

This repo includes `vercel.json` for serverless function limits used by Stripe/webhook endpoints.

Deploy steps:

1. Import the repo in Vercel.
2. Add all env vars from `.env.example` in Vercel Project Settings.
3. Deploy.

After deploy, configure Stripe webhook endpoint to:

```bash
https://<your-domain>/api/webhooks/stripe
```
