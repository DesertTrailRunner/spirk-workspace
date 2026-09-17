create table public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purpose text not null,
  personality text not null default '',
  knowledge text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger agents_updated_at before update on public.agents
for each row execute function public.set_updated_at();

alter table public.agents enable row level security;
create policy "Public agent access" on public.agents for all using (true) with check (true);
