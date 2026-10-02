# Membership invoices, Supabase and Paystack

## Current implementation

MyWCSA AMS owns Registry invoice issuance, persistent payments, receipts and membership state. The membership portal redirects to Paystack only for an invoice approved by an authorised Registry user. A local browser draft is never a live application or proof of approval. Current fee: 2027 WCSSA School membership, R350 (35000 cents), ZAR. Other categories and years remain disabled until their fees and rules are agreed.

The backend now connects directly to Supabase from server code. No separate `WCSA_AMS_API_URL` or `WCSA_AMS_API_KEY` is required for this setup. The legacy external AMS adapter remains available only when neither Supabase variable is set.

## Vercel Production settings

| Name | Value |
|---|---|
| PAYSTACK_MODE | live |
| PAYSTACK_SECRET_KEY | Merchant live sk_live_… key |
| MEMBERSHIP_PUBLIC_ORIGIN | https://govapps.wcsports.co.za |
| SUPABASE_URL | Supabase project base URL, https://<project-ref>.supabase.co |
| SUPABASE_SECRET_KEY | Supabase backend sb_secret_… key |

Secrets go directly into Vercel; never in source control, chat, browser variables or URLs. No public Paystack/Supabase key is needed for this invoice backend. Deploy again after changing environment settings. Production settings and test/preview settings must be separate.

## Install the database

1. In the Supabase project's SQL Editor, open a new query and run `supabase/migrations/20261002_001_membership_invoices.sql` using the project owner's database role. It creates only the namespaced AMS invoice tables and functions; it does not delete existing records or insert sample invoices. Re-running the same version preserves existing records. If any statement fails, the entire transaction rolls back.
2. Grant the actual Registry approver's Microsoft tenant UUID and exact sign-in email using `supabase/bootstrap-registry-staff.example.sql`. This is an explicit administrative grant, not automatic access for every Microsoft user. Use your own verified staff account or a specifically authorised reviewer. The Microsoft issuer must point to your tenant UUID, not common or organisations.
3. Sign in to GovApps with that staff account and open `/apps/ams/membership-invoices`. For diagnostics, `/api/ams/setup-status` returns database/schema status, the current signed-in account's email/tenant, Registry access and gateway configuration flags; no secrets are returned.

Tables include organisations, authorised Registry staff, approved invoices, payments, receipts, membership state, audit events and short-lived checkout rate-limit counters. Row Level Security is enabled on all tables. Anonymous and Supabase-authenticated browser users have no table access or function execution privileges. Server service_role has read privileges for invoice tables and can mutate invoice records only through the explicitly granted functions. Security-definer functions use an empty search_path and qualified object names. Staff creation/grants are owner-controlled SQL operations.

## Registry workflow

At the AMS invoice page, authorised Registry staff enter a real school's name and 10-digit EMIS/paypoint, the authorised payer email, the existing reviewed application/file reference and review notes. They must attest that details, representative authority and required documents have been checked. The server records the Microsoft identity, controls year/category/fee/mode and issues one invoice per school/year/mode. This supports a completed offline/existing Registry review while public account registration, live uploads and application submission are still being implemented; it never promotes a preview draft automatically.

The private 256-bit payment code is shown only when issuing the invoice. Only its SHA256 hash is stored. Give the code securely to the authorised payer, with the approved invoice reference; no automated email is sent. Codes expire after 30 days. Do not create another invoice or invent a new provider reference if the code is lost or checkout fails; contact the database administrator for recovery/reconciliation. Self-service code rotation is not implemented in this version.

Clients use `/membership/payments`. The database locks the invoice to prevent concurrent initialization, persists its stable provider reference, and caches the checkout URL for retries. Attempts are limited to 20 per minute per keyed client-address hash; raw IP addresses are not stored. On Vercel, the platform-overwritten x-forwarded-for header supplies the address. Non-Vercel local runs use a shared local bucket. SQL schema installation is required for these checks; missing configuration or functions block checkout.

## Payment notifications

Live webhook URL in Paystack:
`https://govapps.wcsports.co.za/api/membership/payments/webhook`

Server-generated callback:
`https://govapps.wcsports.co.za/membership/payments/return`

The callback never claims success. The server checks raw-body HMAC SHA512 signatures, verifies transactions with Paystack, and matches success, reference, amount, currency, payment mode, payer email, transaction ID and paid-at before settlement. Settlement locks the approved invoice and commits one payment, one receipt record, active annual membership state and one payment audit event together. Duplicate events return the same receipt; conflicting payments and provider-ID reuse fail. Failed processing returns non-2xx for Paystack retry. Pending state after checkout/initialization failures must be reconciled against Paystack before another action; no fallback invents a second reference.

Receipt records and payment status are visible to Registry in AMS. Public receipt PDF downloads, client account/application submission, document storage wiring and organisation-interface feeds are not part of this invoice release. Active membership records are stored centrally; no notification to another interface is claimed without its own authenticated integration. Membership numbers are not generated or changed by this migration.

## Validation and go-live

`npm run test:payments` runs provider validation, actual PostgreSQL migration/permission/transaction tests with PGlite, and server API authorization/adapter checks. `npm run build` validates production compilation. Tests use isolated fixture keys and no live network payments.

After installing the schema and Registry grant, confirm setup status in your real deployment. Exercise isolated test mode and a separate test database/project for approval, checkout, duplicate events and settlement failure recovery before an authorised live payment. Test transactions remain separated by mode and cannot activate live membership records. A real live test charge must be explicitly authorised; configuring the keys does not authorise charging a user.

Official references: https://supabase.com/docs/guides/getting-started/api-keys , https://supabase.com/docs/guides/database/functions , https://paystack.com/docs/api/transaction/ , https://paystack.com/docs/payments/webhooks/ .

## PDF downloads

Membership application, organisation profile and annual plan buttons export paginated A4 PDFs with the existing portal header, dark-blue styling, embedded open-source Source Sans 3 and page numbers. Local drafts are explicitly unsubmitted; they are not official certificates, invoices or receipts. File contents and passwords are excluded.
