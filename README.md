# C Angkorwat V2 foundation

The working V1 heritage site is preserved while V2 is developed on the local `codex/v2-foundation` branch.

## Local development

```bash
npm install
npm run dev
```

- Public site: `/c-angkorwat/`
- Protected admin: `/c-angkorwat/admin`

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Configure Supabase

1. Create a separate development Supabase project.
2. Run `supabase/migrations/202608280001_v2_foundation.sql` in the SQL Editor.
3. Create the first administrator in Authentication → Users.
4. Find that user's UUID in Authentication → Users.
5. In the SQL Editor, assign the role, replacing the example UUID:

```sql
insert into public.user_roles (user_id, role)
values ('00000000-0000-0000-0000-000000000000', 'super_admin');
```

6. Copy `.env.example` to `.env`.
7. Add only the project URL and browser-safe publishable key.
8. Restart the development server.

Never put a Supabase secret key or service-role key in this repository or any `VITE_` variable. Vite variables are visible to website visitors.

## Security model

- Public visitors may read published site content.
- Signing in is not sufficient for CMS access.
- The database requires an explicit `admin` or `super_admin` role.
- Row Level Security enforces the same rule for content writes.
- The admin route remains locked when Supabase is unconfigured.
- CMS content is schema-validated when loaded and before publishing.

## Deployment status

Phase 2 is local only. Do not merge or push this branch until database policies, login, route hosting, and end-to-end tests have been verified in the development environment.
