-- Citi Sprints — user-submitted rides.
-- Seed riders live in the client (src/lib/mockData.ts); this table holds only
-- rides people actually post, so they're shared across every visitor.

create table if not exists public.rides (
  id          uuid primary key default gen_random_uuid(),
  handle      text not null check (char_length(handle) between 2 and 20),
  distance_mi double precision not null check (distance_mi > 0 and distance_mi <= 1000),
  duration_sec integer not null check (duration_sec > 0 and duration_sec <= 86400),
  created_at  timestamptz not null default now()
);

create index if not exists rides_created_at_idx on public.rides (created_at desc);

-- The app has no user auth; everyone posts and reads as the anonymous role.
-- RLS keeps that narrow: read everything, insert new rows, nothing else.
alter table public.rides enable row level security;

drop policy if exists "anon can read rides" on public.rides;
create policy "anon can read rides"
  on public.rides for select
  to anon, authenticated
  using (true);

drop policy if exists "anon can insert rides" on public.rides;
create policy "anon can insert rides"
  on public.rides for insert
  to anon, authenticated
  with check (true);
