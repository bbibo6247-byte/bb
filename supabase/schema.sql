-- Run this file in Supabase Dashboard > SQL Editor.
-- Each farm record belongs to its creator; RLS prevents cross-account access.

create table if not exists public.daily_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day_number integer not null check (day_number between 1 and 42),
  feed_bags numeric(12,2) not null default 0 check (feed_bags >= 0),
  daily_deaths integer not null default 0 check (daily_deaths >= 0),
  cumulative_deaths integer not null default 0 check (cumulative_deaths >= 0),
  medicine text,
  notes text,
  record_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, day_number)
);

create table if not exists public.feed_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  supplier text not null,
  feed_type text not null default 'بادي' check (feed_type in ('بادي', 'نامي', 'ناهي')),
  quantity_tons numeric(12,2) not null default 0 check (quantity_tons >= 0),
  quantity_bags numeric(12,2) not null default 0 check (quantity_bags >= 0),
  price_per_ton numeric(14,2) not null default 0 check (price_per_ton >= 0),
  total_amount numeric(14,2) not null default 0 check (total_amount >= 0),
  received_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.gas_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  received_count integer not null default 0 check (received_count >= 0),
  used_count integer not null default 0 check (used_count >= 0),
  price_per_cylinder numeric(14,2) not null default 0 check (price_per_cylinder >= 0),
  total_amount numeric(14,2) not null default 0 check (total_amount >= 0),
  record_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.electricity_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  billing_month text not null,
  meter_reading numeric(14,2) not null default 0 check (meter_reading >= 0),
  amount numeric(14,2) not null default 0 check (amount >= 0),
  paid_on date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  worker_name text not null,
  wage_type text not null default 'يومي' check (wage_type in ('يومي', 'شهري')),
  wage_amount numeric(14,2) not null default 0 check (wage_amount >= 0),
  attendance_days integer not null default 0 check (attendance_days >= 0),
  absence_days integer not null default 0 check (absence_days >= 0),
  advance_amount numeric(14,2) not null default 0 check (advance_amount >= 0),
  record_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  expense_name text not null,
  amount numeric(14,2) not null check (amount >= 0),
  spent_on date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.merchant_sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  merchant_name text not null,
  quantity_kg numeric(14,2) not null default 0 check (quantity_kg >= 0),
  crates_count integer not null default 0 check (crates_count >= 0),
  price_per_kg numeric(14,2) not null default 0 check (price_per_kg >= 0),
  total_amount numeric(14,2) not null default 0 check (total_amount >= 0),
  paid_amount numeric(14,2) not null default 0 check (paid_amount >= 0),
  remaining_amount numeric(14,2) not null default 0 check (remaining_amount >= 0),
  sold_on date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  check (paid_amount <= total_amount)
);

create index if not exists daily_records_user_day_idx on public.daily_records (user_id, day_number);
create index if not exists feed_invoices_user_date_idx on public.feed_invoices (user_id, received_on desc);
create index if not exists gas_records_user_date_idx on public.gas_records (user_id, record_date desc);
create index if not exists electricity_bills_user_date_idx on public.electricity_bills (user_id, paid_on desc);
create index if not exists workers_user_date_idx on public.workers (user_id, record_date desc);
create index if not exists expenses_user_date_idx on public.expenses (user_id, spent_on desc);
create index if not exists merchant_sales_user_date_idx on public.merchant_sales (user_id, sold_on desc);

alter table public.daily_records enable row level security;
alter table public.feed_invoices enable row level security;
alter table public.gas_records enable row level security;
alter table public.electricity_bills enable row level security;
alter table public.workers enable row level security;
alter table public.expenses enable row level security;
alter table public.merchant_sales enable row level security;

drop policy if exists "Users manage own daily records" on public.daily_records;
create policy "Users manage own daily records" on public.daily_records for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own feed invoices" on public.feed_invoices;
create policy "Users manage own feed invoices" on public.feed_invoices for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own gas records" on public.gas_records;
create policy "Users manage own gas records" on public.gas_records for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own electricity bills" on public.electricity_bills;
create policy "Users manage own electricity bills" on public.electricity_bills for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own workers" on public.workers;
create policy "Users manage own workers" on public.workers for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own expenses" on public.expenses;
create policy "Users manage own expenses" on public.expenses for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own merchant sales" on public.merchant_sales;
create policy "Users manage own merchant sales" on public.merchant_sales for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
