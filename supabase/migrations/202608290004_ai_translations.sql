create table if not exists public.site_translations (
  locale text primary key check (locale in ('km', 'fr', 'zh-CN')),
  content jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'published', 'stale')),
  ai_model text,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer uuid references auth.users(id) on delete set null
);

alter table public.site_translations enable row level security;
grant select on table public.site_translations to anon, authenticated;
grant insert, update on table public.site_translations to authenticated;

drop policy if exists "Public can read published translations" on public.site_translations;
drop policy if exists "Admins can read translations" on public.site_translations;
drop policy if exists "Admins can insert translations" on public.site_translations;
drop policy if exists "Admins can update translations" on public.site_translations;

create policy "Public can read published translations"
on public.site_translations for select
to anon, authenticated
using (status = 'published');

create policy "Admins can read translations"
on public.site_translations for select
to authenticated
using (public.is_admin());

create policy "Admins can insert translations"
on public.site_translations for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update translations"
on public.site_translations for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
