# PayLink

PayLink is a full-stack Next.js app for creating branded payment links, sharing them with customers, and collecting payments through Stripe Checkout.

## Tech stack

- Next.js (App Router) + React + TypeScript
- Supabase (Auth, Postgres, RLS)
- Stripe (price creation + hosted checkout)
- Tailwind CSS + shadcn/ui + React Query

## Core features

- Merchant signup/login with Supabase SSR sessions
- Protected dashboard routes (`/dashboard`, `/links`)
- Create, list, edit, and delete payment links
- Public payment pages at `/pay/[slug]`
- Stripe Checkout session creation
- Link view tracking and basic analytics tables

## Architecture overview

This repository is a **single full-stack app** (no separate backend repo):

- **Frontend**
  - `app/` page UIs (`(auth)`, `(dashboard)`, `pay/[slug]`)
  - `components/`, `contexts/`, `hooks/`, `public/`
- **Backend (within Next.js)**
  - `app/api/**` route handlers (server APIs)
  - `middleware.ts` + `lib/supabase/middleware.ts` (auth/session redirects)
  - `lib/supabase/server.ts` and `lib/supabase/admin.ts` (server/admin DB access)
  - `lib/stripe/client.ts` (Stripe server SDK)
- **Database layer**
  - `supabase/migrations/` (schema, RLS policies, triggers)
  - `types/database.ts` (generated/maintained DB typing)

## Environment variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VIEW_HASH_SALT=optional_custom_salt
```

## Local development

1. Install dependencies:

```bash
npm install
```

2. Run the app:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Available scripts

```bash
npm run dev    # start dev server
npm run build  # production build
npm run start  # run production build
npm run lint   # lint codebase
```

## API routes

- `GET /api/links` - list merchant links
- `GET /api/links?slug=...` - check slug availability
- `POST /api/links` - create a payment link
- `PATCH /api/links/:id` - update a link
- `DELETE /api/links/:id` - delete a link
- `POST /api/pay/checkout` - create Stripe Checkout session
- `POST /api/pay/view` - track public page views
