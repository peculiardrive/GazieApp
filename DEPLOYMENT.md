# 🚀 Gazie Commute — Production Launch Runbook

This guide covers everything required to take Gazie Commute from local development to a live production deployment.

---

## 📑 Table of Contents
1. [Step 1: Supabase Setup (Database, Auth & Storage)](#step-1-supabase-setup)
2. [Step 2: Paystack Setup (Live Payments & Webhooks)](#step-2-paystack-setup)
3. [Step 3: Vercel Deployment (Hosting & Environment Variables)](#step-3-vercel-deployment)
4. [Step 4: Superadmin Account Initialization](#step-4-superadmin-account-initialization)
5. [Step 5: Production Verification Checklist](#step-5-production-verification-checklist)

---

## Step 1: Supabase Setup

### 1.1 Create Project
1. Log in to [Supabase](https://supabase.com).
2. Click **New Project** and name it `gazie-commute-prod`.
3. Choose a region closest to Nigeria (e.g., `EU West (London)` or `EU Central (Frankfurt)`).
4. Save your database password securely.

### 1.2 Run SQL Schema
1. In the Supabase Dashboard, navigate to the **SQL Editor** tab on the left sidebar.
2. Click **New Query**.
3. Open the [`schema.sql`](./schema.sql) file from this repository, copy its entire contents, and paste it into the editor.
4. Click **Run** (or `Ctrl + Enter`).
5. Verify that the following tables and resources are created:
   - Tables: `profiles`, `bookings`, `ride_postings`, `recurring_templates`, `incidents`, `notifications`, `payments`.
   - Function: `confirm_ride_booking(...)`.
   - Storage Bucket: `verification-docs` with RLS policies.
   - Performance Indexes: `idx_bookings_...`, `idx_ride_postings_...`.

### 1.3 Configure Authentication
1. Go to **Authentication > URL Configuration**:
   - Set **Site URL** to your production domain: `https://app.gazie.ng` (or your Vercel URL `https://your-project.vercel.app`).
   - Add redirect URLs: `https://app.gazie.ng/**`, `http://localhost:3000/**`.
2. Go to **Authentication > Providers**:
   - If using Phone OTP: Configure SMS Provider (e.g. Termii, Twilio, or MessageBird).
   - If using Email / Magic Link: Verify SMTP provider settings (or use Supabase default for launch).

### 1.4 Retrieve API Credentials
1. Navigate to **Project Settings > API**.
2. Note down:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon / public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

---

## Step 2: Paystack Setup

### 2.1 Live Account Activation
1. Log in to [Paystack Dashboard](https://dashboard.paystack.com).
2. Ensure your business account is activated for **Live** mode.
3. Switch toggle in top navigation from *Test* to *Live*.

### 2.2 Retrieve Live API Keys
1. Navigate to **Settings > API Keys & Webhooks**.
2. Copy:
   - **Live Public Key** (`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` starting with `pk_live_...`)
   - **Live Secret Key** (`PAYSTACK_SECRET_KEY` starting with `sk_live_...`)

### 2.3 Set Webhook URL
1. In the **Live Webhook URL** field, enter:
   ```text
   https://app.gazie.ng/api/webhooks/paystack
   ```
   *(or `https://your-app.vercel.app/api/webhooks/paystack` if testing Vercel preview first)*
2. Save changes.

---

## Step 3: Vercel Deployment

### 3.1 Deploy Repository
1. Push this repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import the `GazieApp` repository.
4. Framework Preset: **Next.js** (auto-detected).

### 3.2 Add Environment Variables
In the Vercel **Environment Variables** section, add:

| Key | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Public Anon Key |
| `PAYSTACK_SECRET_KEY` | `sk_live_...` | Paystack Live Secret Key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_live_...` | Paystack Live Public Key |
| `NEXT_PUBLIC_PLATFORM_FEE_ENABLED` | `true` | Requires ₦50 fee to confirm match |
| `NEXT_PUBLIC_APP_URL` | `https://app.gazie.ng` | Base domain for SEO & sitemaps |

5. Click **Deploy**.

---

## Step 4: Superadmin Account Initialization

After deployment, elevate your user account to Administrator:

1. Visit your live app URL (`https://app.gazie.ng/login`) and sign up with your phone number/email.
2. Go to your **Supabase Dashboard > Table Editor > `profiles` table**.
3. Find your user row and set:
   - `role` = `'admin'`
   - `verification_status` = `'verified'`
4. Now, visit `https://app.gazie.ng/dashboard/admin` to access the live admin control center (approvals, user triage, analytics).

---

## Step 5: Production Verification Checklist

- [ ] Sign up a test Rider and test Driver account.
- [ ] Submit a KYC Document upload and verify it appears in Supabase Storage (`verification-docs`).
- [ ] Approve the documents from the Admin Dashboard.
- [ ] Post a commute route as a verified Driver.
- [ ] Match and complete a ₦50 booking fee payment as a Rider.
- [ ] Check that Paystack Webhook marks the booking status as `confirmed` and reserves the seat.
- [ ] Inspect the live digital boarding pass ticket.
