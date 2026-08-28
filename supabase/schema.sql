create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

create policy "Public can read published site content"
on public.site_content for select
using (true);

create policy "Authenticated admins can insert content"
on public.site_content for insert
to authenticated
with check (true);

create policy "Authenticated admins can update content"
on public.site_content for update
to authenticated
using (true)
with check (true);
