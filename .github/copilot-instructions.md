# Copilot Instructions for `payment-links`

## Build, lint, and test commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

There is currently no `test` script in `package.json`, so there is no repository-defined single-test command yet.

## High-level architecture

- **Framework/layout:** Next.js App Router app with route groups:
  - `(auth)` for `/login` and `/signup`
  - `(dashboard)` for authenticated `/dashboard` and `/links`
- **Auth/session model:** Supabase SSR is used in three layers:
  - `middleware.ts` -> `lib/supabase/middleware.ts` refreshes auth cookies and redirects:
    - unauthenticated users away from protected prefixes (`/dashboard`, `/links`) to `/login?next=...`
    - authenticated users away from auth routes (`/login`, `/signup`) to `/dashboard`
  - `app/(dashboard)/layout.tsx` is a server component that loads `auth.getUser()` and the `profiles` row, then redirects to `/login` if unauthenticated.
  - Client components use `createBrowserSupabaseClient()` for sign-in/sign-up/sign-out mutations.
- **UI composition:** Root layout provides React Query (`QueryClientProvider`) and global Sonner toasts. Dashboard pages render inside `DashboardShell`, which consumes `AuthProvider` context populated by the server layout.
- **Data model:** Supabase schema and RLS live in `supabase/migrations/20260420120000_initial_schema.sql` (`profiles`, `payment_links`, `link_views`, `payments`, trigger on `auth.users`). TypeScript DB types are mirrored in `types/database.ts`.

## Key codebase conventions

- Use the shared Supabase client factories only:
  - browser: `lib/supabase/client.ts` (`createBrowserSupabaseClient`, singleton)
  - server: `lib/supabase/server.ts` (`createServerSupabaseClient`, cookie-aware)
  - middleware: `lib/supabase/middleware.ts`
- Keep route protection server-first:
  - enforce redirects in middleware and server layouts
  - do not introduce client-only auth guards for protected pages
- Keep UI copy centralized in `lib/constants/copy.ts` (`marketingCopy`, `authCopy`, `dashboardCopy`) instead of hardcoding strings across components.
- Form pattern: React Hook Form + Zod schemas from `lib/validations/auth.schema.ts`, with inferred types (`LoginInput`, `SignupInput`) used in form components.
- Use project alias imports (`@/...`) per `tsconfig.json` and `cn()` from `lib/utils.ts` for className composition.
- This repo carries a strict Next.js note in `AGENTS.md`: when changing Next.js behavior or APIs, check the relevant docs under `node_modules/next/dist/docs/` first because version behavior may differ from older conventions.
