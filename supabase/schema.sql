create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

do $$ begin
  create type public.app_role as enum ('editor', 'admin', 'super_admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table public.user_roles enable row level security;

grant select on table public.site_content to anon, authenticated;
grant insert, update on table public.site_content to authenticated;
grant select on table public.user_roles to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Public can read published site content" on public.site_content;
drop policy if exists "Authenticated admins can insert content" on public.site_content;
drop policy if exists "Authenticated admins can update content" on public.site_content;
drop policy if exists "Admins can insert content" on public.site_content;
drop policy if exists "Admins can update content" on public.site_content;
drop policy if exists "Users can read their own role" on public.user_roles;

create policy "Public can read published site content"
on public.site_content for select
using (true);

create policy "Admins can insert content"
on public.site_content for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update content"
on public.site_content for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can read their own role"
on public.user_roles for select
to authenticated
using (user_id = auth.uid() or public.is_admin());
