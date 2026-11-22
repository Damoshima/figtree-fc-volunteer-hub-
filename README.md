# Figtree FC Volunteer Hub

A mobile-first volunteer coordination web app built for **Figtree FC** (Harry Graham Park, Wallawa St, Figtree) for the 2026 Figtree FC Volunteer Hub Challenge.

## Project Aims
- **For Parents & Volunteers:** Find and claim Saturday/Sunday marshalling, BBQ, and club setup shifts from a phone in under a minute—with clear team allocations and smart conflict checks around their child's kickoff time.
- **For Coordinators:** Spot unfilled gaps at a glance, distinguish fixed **Jobs** (e.g., 7:15 AM Clubhouse Opening) from **Duties** (2-hour marshalling blocks), enforce WWCC requirements only where needed, and track confirmations/late cancellations without a developer.

## Architecture & Zero Vendor Lock-In
- **Frontend & API:** Next.js 16 (App Router), TypeScript, Tailwind CSS.
- **Database:** Standard PostgreSQL via Supabase (`supabase/schema.sql`), exportable anytime via `pg_dump` or CSV.
- **Swappable Notification Adapter (`src/lib/notifications/adapter.ts`):**
  - Defaults to `InAppLogAdapter` ($0/month, logs all notifications in-app for demo visibility).
  - Switch `NOTIFICATION_PROVIDER=webhook_smtp` and set `NOTIFICATION_WEBHOOK_URL` in environment variables to connect to Figtree FC's chosen SMTP relay or email provider with zero code changes.

## Expected Ongoing Hosting Cost
- **$0 / month** on Vercel Hobby + Supabase Free Tier (supports 500MB PostgreSQL storage and 50,000 monthly active users, well above Figtree FC's ~2,000 weekend attendees).

## Local Setup Instructions
1. Install Node.js 20+ and run:
   ```bash
   npm install
   npm run dev