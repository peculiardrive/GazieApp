# Gazie Living

Gazie Living is an MVP civic-tech rental transparency app for Abuja residents, starting with Lugbe axis communities. It helps users submit real rent data, calculate true move-in cost, inspect property condition, review rental actors, and request verified repair artisans.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn-style local UI components
- Supabase Auth, Postgres, Storage, and RLS
- Vitest for domain logic tests
- Vercel-ready deployment

## Project Structure

```txt
app/                    App Router pages
components/             UI primitives and product forms
lib/                    Domain logic, validation, constants, Supabase clients
supabase/schema.sql     Enums, tables, indexes, RLS policies
supabase/seed.sql       Abuja locations and starter artisans
tests/                  Calculator and livability score tests
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment variables:

```bash
cp .env.example .env.local
```

3. Add Supabase credentials to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Apply database setup in Supabase SQL editor:

```sql
-- Run supabase/schema.sql first
-- Run supabase/seed.sql second
```

5. Start development:

```bash
npm run dev
```

## Supabase Notes

- Public users can submit rent reports, condition reports, reviews, artisan profiles, and repair requests.
- Public reads are limited to approved rent reports, approved reviews, approved condition reports, and verified artisans.
- Authenticated users can edit only their own pending submissions.
- Admin-only moderation is controlled by `public.users.role = 'admin'` or `public.users.is_admin = true`.
- Evidence and repair photos should be uploaded to Supabase Storage, then recorded in `uploaded_files`.

## Verification

```bash
npm run typecheck
npm run test
npm run build
```

## MVP Limits

- Abuja only, with starter locations: Newsite, FHA Lugbe, CRD, Trademore, 1R Estate, Golden Gate, River Park, Lokogoma, Kubwa, and Gwarinpa.
- No payment features.
- No mobile app.
- No social feed or overbuilt community features.
