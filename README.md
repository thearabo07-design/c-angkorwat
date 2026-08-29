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

The public site and CMS deploy through GitHub Pages.

## AI translation setup

The translation studio supports English source content with Khmer, French, and Simplified Chinese targets. AI output is always saved as a draft and cannot be published until an administrator marks it reviewed.

1. Apply `supabase/migrations/202608290004_ai_translations.sql`.
2. Set the Edge Function secret with `supabase secrets set OPENAI_API_KEY=...`.
3. Optionally set `OPENAI_MODEL`; the function defaults to `gpt-5.4-mini`.
4. Deploy with `supabase functions deploy translate-content`.
5. Open CMS → Translations, create an AI draft, review it, mark it reviewed, then publish it.

Never add `OPENAI_API_KEY` to `.env`, a `VITE_` variable, GitHub Pages, client code, or the database. The key belongs only in Supabase Edge Function secrets.
