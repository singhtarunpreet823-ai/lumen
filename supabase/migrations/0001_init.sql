-- Lumen — Supabase schema, row-level security, and seed data
-- Run in the Supabase SQL editor or via `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------- Tables ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  currency text not null default 'USD',
  monthly_income numeric not null default 0,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount >= 0),
  category_id text not null,
  merchant text not null default '',
  note text,
  date date not null default current_date,
  recurring boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month text not null, -- YYYY-MM
  category_id text not null default 'overall',
  amount numeric not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, month, category_id)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target numeric not null check (target > 0),
  saved numeric not null default 0 check (saved >= 0),
  deadline date,
  color text not null default '#10b981',
  icon text not null default 'target',
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx on public.transactions (user_id, date desc);
create index if not exists budgets_user_month_idx on public.budgets (user_id, month);

-- ---------- Row-level security ----------

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions for delete using (auth.uid() = user_id);

create policy "budgets_select_own" on public.budgets for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets for update using (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets for delete using (auth.uid() = user_id);

create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

-- ---------- Trigger: auto-create a profile on signup ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email_placeholder)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- NOTE: the helper column below is optional; drop it after migration if undesired.
alter table public.profiles add column if not exists email_placeholder text;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();