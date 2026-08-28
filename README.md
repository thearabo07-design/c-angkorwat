# C Angkorwat V2

A responsive Cambodian heritage journal with a Supabase-ready content dashboard.

## Local development

```bash
npm install
npm run dev
```

Open the public site at the Vite URL and use `#admin` to open the dashboard. Without Supabase credentials, the dashboard runs in preview mode and does not persist changes.

## Enable the admin backend

1. Create a Supabase project.
2. In its SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql).
3. In Authentication → Users, create the administrator account.
4. Copy `.env.example` to `.env` and add the project URL and public anon key.
5. Restart the Vite server.

Only authenticated users can publish content. Public visitors can read the published `main` content record. Never place the Supabase service-role key in this frontend project.

For GitHub Pages, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository Actions variables and expose them to the build step when the backend is ready.

## Quality checks

```bash
npm run lint
npm run build
```
