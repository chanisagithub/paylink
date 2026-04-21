create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  business_name text not null default '',
  logo_url text,
  brand_color text not null default '#6366f1',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_links (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  amount numeric(10, 2) not null,
  currency text not null default 'USD',
  is_active boolean not null default true,
  stripe_price_id text,
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz
);

create table if not exists public.link_views (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.payment_links (id) on delete cascade,
  viewed_at timestamptz not null default timezone('utc', now()),
  ip_hash text not null,
  user_agent text,
  referrer text
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.payment_links (id) on delete cascade,
  stripe_session_id text not null unique,
  amount_paid numeric(10, 2) not null,
  currency text not null,
  payer_email text,
  status text not null check (status in ('pending', 'completed', 'failed', 'refunded')),
  paid_at timestamptz,
  metadata jsonb
);

create index if not exists idx_payment_links_merchant_id on public.payment_links (merchant_id);
create index if not exists idx_payment_links_slug on public.payment_links (slug);
create index if not exists idx_link_views_link_id on public.link_views (link_id);
create index if not exists idx_payments_link_id on public.payments (link_id);
create index if not exists idx_payments_status on public.payments (status);

alter table public.profiles enable row level security;
alter table public.payment_links enable row level security;
alter table public.link_views enable row level security;
alter table public.payments enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "payment_links_select_own" on public.payment_links;
create policy "payment_links_select_own"
on public.payment_links
for select
to authenticated
using (auth.uid() = merchant_id);

drop policy if exists "payment_links_insert_own" on public.payment_links;
create policy "payment_links_insert_own"
on public.payment_links
for insert
to authenticated
with check (auth.uid() = merchant_id);

drop policy if exists "payment_links_update_own" on public.payment_links;
create policy "payment_links_update_own"
on public.payment_links
for update
to authenticated
using (auth.uid() = merchant_id)
with check (auth.uid() = merchant_id);

drop policy if exists "payment_links_delete_own" on public.payment_links;
create policy "payment_links_delete_own"
on public.payment_links
for delete
to authenticated
using (auth.uid() = merchant_id);

drop policy if exists "link_views_select_merchant_owned_links" on public.link_views;
create policy "link_views_select_merchant_owned_links"
on public.link_views
for select
to authenticated
using (
  exists (
    select 1
    from public.payment_links
    where payment_links.id = link_views.link_id
      and payment_links.merchant_id = auth.uid()
  )
);

drop policy if exists "link_views_insert_public" on public.link_views;
create policy "link_views_insert_public"
on public.link_views
for insert
to public
with check (true);

drop policy if exists "payments_select_merchant_owned_links" on public.payments;
create policy "payments_select_merchant_owned_links"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.payment_links
    where payment_links.id = payments.link_id
      and payment_links.merchant_id = auth.uid()
  )
);

drop policy if exists "payments_insert_service_role" on public.payments;
create policy "payments_insert_service_role"
on public.payments
for insert
to public
with check (auth.role() = 'service_role');

drop policy if exists "payments_update_service_role" on public.payments;
create policy "payments_update_service_role"
on public.payments
for update
to public
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  insert into public.profiles (id, business_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'business_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure private.handle_new_user();
