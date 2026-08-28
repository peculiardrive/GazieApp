# Newsite EstateOS

Production-ready MVP for Newsite Estate service charge collection, resident/property records, maintenance, security operations, reports, and executive visibility.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible local components
- Supabase Auth, PostgreSQL, RLS
- Vercel-ready configuration

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
copy .env.example .env.local
```

3. Add your Supabase URL and publishable key in `.env.local`.

4. Apply database schema and seed data in Supabase SQL editor:

```sql
-- Run supabase/migrations/001_initial_schema.sql
-- Then run supabase/seed.sql
```

5. Start the app:

```bash
npm run dev
```

## Auth And RBAC

The app uses Supabase Auth and middleware route protection when Supabase env vars are configured. For local UI review without credentials, protected routes are accessible as a demo shell. In production, configure Supabase env vars and assign role and estate claims in `app_metadata`, for example:

```json
{
  "role": "super_admin",
  "estate_id": "00000000-0000-0000-0000-000000000001"
}
```

Roles included:

- Super Admin
- Estate Chairman
- Treasurer/Accountant
- Secretary
- Security Officer
- Maintenance Officer
- Resident

## Database

Schema files are in `supabase/`:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/seed.sql`

Tables include estates, users, profiles, properties, residents, vehicles, invoices, payments, receipts, expenses, maintenance assets/tasks, security visitors/incidents, documents, and audit logs.

RLS is enabled on public tables. Policies restrict accounting data from security users and restrict resident access to their own property/payment records.

## Paystack Placeholder

The webhook placeholder is available at:

```text
/api/paystack/webhook
```

Before going live, verify Paystack signatures, reconcile `payment_reference`, update invoices and receipts in a transaction, and log audit events.

## Deployment

Deploy to Vercel with the variables in `.env.example`. `vercel.json` keeps the app Next.js-ready with a default region.
