-- Figtree FC Volunteer Hub — Pass 1 Database Schema
-- Standard PostgreSQL (zero vendor lock-in; portable to any Postgres host)

create extension if not exists "pgcrypto";

-- 1. Teams (with optional weekend kickoff windows for conflict checks)
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  age_group text not null,
  match_day text check (match_day in ('Saturday', 'Sunday')),
  match_start time,
  match_end time,
  created_at timestamptz not null default now()
);

-- 2. Volunteer & Coordinator Profiles
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  team_id uuid references teams(id) on delete set null,
  has_wwcc boolean not null default false,
  is_coordinator boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Configurable Harry Graham Park Locations / Zones
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  zone_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. Configurable Roles & Badge Requirements
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  requires_wwcc boolean not null default false,
  requires_approval boolean not null default false,
  created_at timestamptz not null default now()
);

-- 5. Opportunities: Supports both Jobs (fixed tasks) & Duties (time windows)
create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('job', 'duty')),
  title text not null,
  role_id uuid not null references roles(id) on delete restrict,
  location_id uuid not null references locations(id) on delete restrict,
  shift_date date not null,
  day_label text not null check (day_label in ('Saturday', 'Sunday')),
  start_time time not null,
  end_time time not null,
  required_headcount integer not null default 1 check (required_headcount >= 1),
  assigned_team_id uuid references teams(id) on delete set null,
  conflict_mode text not null default 'warn' check (conflict_mode in ('warn', 'block')),
  recurrence_group text,
  notes text,
  created_at timestamptz not null default now()
);

-- 6. Claims: Individual sign-ups, 1-tap confirmations, late cancels & no-shows
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  status text not null default 'claimed' check (status in ('claimed', 'confirmed', 'cancelled_late', 'no_show')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id, profile_id)
);

-- 7. Notification Logs (backs the $0 InAppLogAdapter and audit trail)
create table if not exists notification_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  recipient_email text not null,
  subject text not null,
  body text not null,
  event_type text not null,
  created_at timestamptz not null default now()
);

-- Helpful indexes for fast mobile queries
create index if not exists idx_opportunities_date on opportunities(shift_date, start_time);
create index if not exists idx_opportunities_team on opportunities(assigned_team_id);
create index if not exists idx_claims_opportunity on claims(opportunity_id);
create index if not exists idx_claims_profile on claims(profile_id);

-- Demo-friendly Row Level Security (open read/write for demo; tighten to auth.uid() for live club rollout)
alter table teams enable row level security;
alter table profiles enable row level security;
alter table locations enable row level security;
alter table roles enable row level security;
alter table opportunities enable row level security;
alter table claims enable row level security;
alter table notification_logs enable row level security;

create policy "Public demo access teams" on teams for all using (true) with check (true);
create policy "Public demo access profiles" on profiles for all using (true) with check (true);
create policy "Public demo access locations" on locations for all using (true) with check (true);
create policy "Public demo access roles" on roles for all using (true) with check (true);
create policy "Public demo access opportunities" on opportunities for all using (true) with check (true);
create policy "Public demo access claims" on claims for all using (true) with check (true);
create policy "Public demo access notification_logs" on notification_logs for all using (true) with check (true);