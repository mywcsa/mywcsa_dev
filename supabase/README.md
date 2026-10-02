# MyWCSA AMS database setup

Use the existing Supabase project you configured. Start with the migration:

`migrations/20261002_001_membership_invoices.sql`

Open it in GitHub, choose **Raw**, copy the entire script, and paste it into **Supabase → SQL Editor → New query**. Run it as the project owner. Success should report no rows returned. It creates server-controlled Registry/invoice/payment tables and functions. It inserts no sample memberships or invoices and does not delete existing records.

Then register the authorised Microsoft reviewer using `bootstrap-registry-staff.example.sql`; replace both placeholders before running it. That is a separate step so you can verify the actual account and tenant. No secret key or password belongs in either script.

The app reads the Supabase URL and server secret from Vercel. After deployment and SQL setup, staff can check `/api/ams/setup-status` and use `/apps/ams/membership-invoices` after their Registry grant. See `../docs/membership-payments.md` for scope and operations.
