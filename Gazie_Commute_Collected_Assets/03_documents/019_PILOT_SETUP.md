# Gazie Commute Pilot Setup

The pilot schema is applied to Supabase project `CommuteApp`
(`buxiqqduzatptmrdkcwu`). It extends the existing marketplace database without
replacing its tables.

## Required environment variables

Configure these in `.env.local` and in Vercel Preview/Production:

```text
NEXT_PUBLIC_SUPABASE_URL=https://buxiqqduzatptmrdkcwu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
SUPABASE_SERVICE_ROLE_KEY=<server-only secret key>
```

Never prefix the service-role key with `NEXT_PUBLIC_`.

## First administrator

1. Submit a pilot application using the administrator's email.
2. In the Supabase SQL editor, grant that pilot profile admin access:

```sql
update public.pilot_profiles
set is_admin = true,
    verification_status = 'approved'
where email = 'admin@example.com';
```

The user can then sign in at `/admin/login`.

## WhatsApp worker

Configure:

```text
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WORKER_SECRET=
```

Schedule an authenticated `POST /api/notifications/whatsapp` request with the
header `x-worker-secret`. The worker sends up to 20 queued notifications per
run and records attempts, failures, and sent timestamps.

## Database source of truth

The committed schema is:

`supabase/migrations/20260611211436_gazie_pilot_mvp.sql`

It includes RLS, private Storage policies, admin-field protection triggers,
consent timestamps, trip records, incident records, CSV-ready tables, and the
WhatsApp notification outbox.
