create table public.tracking (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  action text not null,
  created_at timestamptz not null default now()
);

alter table public.tracking enable row level security;
drop policy if exists "Public tracking access" on public.tracking;
create policy "Public tracking select" on public.tracking
for select to anon, authenticated
using (true);
create policy "Public tracking insert" on public.tracking
for insert to anon, authenticated
with check (true);
