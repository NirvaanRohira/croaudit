-- CROaudit Database Schema
-- Run this in the Supabase SQL editor

-- Users (managed by Supabase Auth, extended with profile)
create table public.profiles (
  id uuid references auth.users primary key,
  email text not null,
  full_name text,
  plan text not null default 'free', -- 'free', 'pro', 'agency'
  audits_used_this_month integer not null default 0,
  audits_limit integer not null default 1, -- free=1, pro=15, agency=50
  billing_provider text, -- 'stripe' or 'razorpay'
  stripe_customer_id text,
  razorpay_customer_id text,
  subscription_id text,
  subscription_status text, -- 'active', 'canceled', 'past_due'
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sites (a domain the user is tracking)
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  domain text not null,
  name text,
  avg_score integer,
  page_count integer default 0,
  last_audited_at timestamptz,
  monitoring_enabled boolean default false,
  created_at timestamptz default now()
);

-- Pages (individual URLs under a site)
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade not null,
  url text not null,
  page_type text not null, -- 'home', 'product', 'category', 'landing', 'cart', 'checkout', 'thank_you', 'general'
  classification_confidence real,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Audits (each run of the audit pipeline on a page)
create table public.audits (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending', -- 'pending', 'crawling', 'auditing', 'optimizing', 'complete', 'failed'
  score integer, -- 0-100 overall CRO score
  pass_count integer,
  fail_count integer,
  unable_count integer,
  total_items integer,
  -- PageSpeed data
  performance_score integer,
  accessibility_score integer,
  mobile_friendly boolean,
  core_web_vitals jsonb, -- { fcp, lcp, tbt, cls }
  -- Audit results
  audit_results jsonb, -- array of { item, section, status, explanation, impact }
  quick_wins jsonb, -- top 5 high-impact failures
  -- Optimization suggestions (null for free tier)
  suggestions jsonb, -- array of { failed_item, suggestion_title, recommendation, example }
  -- Report
  html_report text, -- full HTML report string
  -- Metadata
  model_used_audit text,
  model_used_optimize text,
  score_change integer,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Crawl results (temporary, for the site scan confirmation step)
create table public.crawl_results (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade not null,
  discovered_pages jsonb not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.pages enable row level security;
alter table public.audits enable row level security;
alter table public.crawl_results enable row level security;

create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can CRUD own sites" on public.sites for all using (auth.uid() = user_id);
create policy "Users can CRUD own pages" on public.pages for all using (
  site_id in (select id from public.sites where user_id = auth.uid())
);
create policy "Users can read own audits" on public.audits for all using (auth.uid() = user_id);
create policy "Users can CRUD own crawls" on public.crawl_results for all using (
  site_id in (select id from public.sites where user_id = auth.uid())
);

-- Monthly usage reset tracking
alter table public.profiles add column if not exists usage_reset_at timestamptz default now();

-- Atomic audit counter with lazy monthly reset
-- Checks limit, resets if new month, and increments in one transaction
create or replace function public.increment_audit_counter(p_user_id uuid)
returns table(allowed boolean, current_count integer, max_limit integer) as $$
declare
  v_used integer;
  v_limit integer;
begin
  -- Lazy reset: if usage_reset_at is before current month, reset counter
  update public.profiles
  set audits_used_this_month = 0,
      usage_reset_at = date_trunc('month', now())
  where id = p_user_id
    and usage_reset_at < date_trunc('month', now());

  -- Atomic conditional increment: only succeeds if under limit
  update public.profiles
  set audits_used_this_month = audits_used_this_month + 1,
      updated_at = now()
  where id = p_user_id
    and audits_used_this_month < audits_limit
  returning audits_used_this_month, audits_limit into v_used, v_limit;

  if v_used is not null then
    return query select true, v_used, v_limit;
  else
    select p.audits_used_this_month, p.audits_limit into v_used, v_limit
    from public.profiles p where p.id = p_user_id;
    return query select false, coalesce(v_used, 0), coalesce(v_limit, 1);
  end if;
end;
$$ language plpgsql security definer;

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
