# Smart Bookmark

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

create `.env` and set:

- `NEXT_PUBLIC_SUPABASE_URL` – from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – from Supabase project settings
- `NEXT_PUBLIC_SITE_URL` – `http://localhost:3000` for local; your Vercel URL in production

### 3. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **Authentication → Providers → Google**: Enable Google and add Client ID and Client Secret from [Google Cloud Console](https://console.cloud.google.com/). In Google OAuth, add redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
3. **SQL Editor**: Run the contents of `supabase/schema.sql` to create the `bookmarks` table and RLS.
4. **Realtime**: In SQL Editor, run `alter publication supabase_realtime add table public.bookmarks;` so the list can sync across tabs. (The "Replication" page in the dashboard is for read replicas, not this — use the SQL above.)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with Google and add bookmarks.

## Deploy on Vercel

1. Push the repo to GitHub and connect it in [Vercel](https://vercel.com).
2. Add environment variables in the Vercel project:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://<your-app>.vercel.app`
3. In Supabase **Authentication → URL Configuration**, set Site URL to your Vercel URL and add it to Redirect URLs if needed.
4. In Google OAuth, add the production Supabase callback URL and your Vercel app URL as allowed origins/redirect URIs if required.
5. Deploy. Your live URL will be `https://<project>.vercel.app`.

---

## Problems we ran into (and how we fixed them)

**Google login sent us back to the home page with `?code=...` in the URL.**  
Supabase was redirecting to `/` instead of `/auth/callback` after Google sign-in. We added a fallback: if the home page sees a `code` in the URL, it redirects to `/auth/callback?code=...` so the session still gets created. You should also add `http://localhost:3000/auth/callback` (and your production callback URL) to **Redirect URLs** in Supabase → Authentication → URL Configuration so the redirect goes to the right place in the first place.

**Vercel showed 500 MIDDLEWARE_INVOCATION_FAILED.**  
The middleware runs on the edge and was blowing up when env vars were missing or when a Supabase call failed. We made it defensive: if the Supabase URL or anon key isn’t set, we just pass the request through instead of throwing, and we wrapped the auth logic in try/catch so the middleware always returns a response. Double-check that you’ve set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel’s environment variables and redeploy.

**“Where do I enable Realtime?”**  
The **Database → Replication** screen in Supabase is for read replicas and external pipelines, not for the in-app Realtime feature. To get live updates on the `bookmarks` table, run this in the SQL Editor:  
`alter publication supabase_realtime add table public.bookmarks;`

**Adding or deleting a bookmark didn’t update the list until we refreshed.**  
The UI was relying only on Realtime for updates. We added optimistic updates: when you add a bookmark, the server action returns the new row and we push it into local state right away; when you delete, we remove it from the list immediately and only put it back if the server returns an error. The list updates instantly now even if Realtime isn’t set up.

**“Success. No rows returned” after running the schema SQL.**  
That’s normal. Statements like `CREATE TABLE` and `CREATE POLICY` don’t return rows; “No rows returned” just means they ran successfully. You can confirm in **Table Editor** that the `bookmarks` table exists.
