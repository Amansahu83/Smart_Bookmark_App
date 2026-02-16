# Smart Bookmark

A private bookmark manager with Google sign-in and real-time sync across tabs. Built with Next.js (App Router), Supabase (Auth, Database, Realtime), and Tailwind CSS.

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` – from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – from Supabase project settings
- `NEXT_PUBLIC_SITE_URL` – `http://localhost:3000` for local; your Vercel URL in production

### 3. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **Authentication → Providers → Google**: Enable Google and add Client ID and Client Secret from [Google Cloud Console](https://console.cloud.google.com/). In Google OAuth, add redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
3. **SQL Editor**: Run the contents of `supabase/schema.sql` to create the `bookmarks` table and RLS.
4. **Database → Replication**: Enable replication for the `public.bookmarks` table so Realtime works.

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
