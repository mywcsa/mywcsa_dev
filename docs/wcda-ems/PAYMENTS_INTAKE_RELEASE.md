# MyWCDA Events — Intake, finance and document integration (18 October 2026)

## Implemented on implementation/wcda-ems-governance-20261016

- Redesigned, responsive WCDA gateway retained from prior work.
- Organiser 4-step intake: identity, event/venue, safety/operations, final declarations.
- Event intake persists contact, descriptive and planning details atomically under the official EMS reference through \`wcda_ems_submit_detailed_event\`; server validates fields and declarations.
- Finance workspace available to appointed EMS finance, managers and executives; organiser invoices appear in "Payments & Invoices".
- An authenticated appointed finance officer prepares an invoice using documented amount/fee basis. A different appointed manager/executive explicitly approves with a reason. Organisers cannot set their own price. No fee is assessed automatically, and the paid status never means endorsement.
- The already-configured \`PAYSTACK_SECRET_KEY\`, \`PAYSTACK_MODE\`, and \`MEMBERSHIP_PUBLIC_ORIGIN\` settings are read server-side; no new production key is created and no key is sent to the browser.
- Paystack checkout amount/reference/email/currency are derived from persisted WCDA invoice data. Checkout URL is accepted only from \`https://checkout.paystack.com\`. The shared membership webhook is still \`/api/membership/payments/webhook\`, extended to dispatch \`wcda-...\` references to the WCDA settlement service without changing the existing \`wcsa-...\` dispatch.
- Payment callback re-verifies with Paystack. Webhook signatures are HMAC-SHA512 verified before dispatch. Settlement verifies the provider transaction ID, status, mode, amount, currency, customer email and timestamp, then records a unique receipt in an atomic database transaction. Both webhook retries and user callback are idempotent. Payment acknowledgement PDF is not a tax invoice, permit, licence or endorsement.
- Supporting evidence upload/read/download available to organisers and authorised employees. Private Supabase storage bucket \`wcda-ems-documents\`; restrictive RLS storage policy, private metadata table and atomic document audit RPC. PDF/PNG/JPEG only, maximum 10 MiB. Auditors are read-only.

## Existing systems left unchanged

- Membership's 2027 school fee policy, invoice numbering and MyWCSA Membership checkout logic.
- PERSAL, WorkHub, Careers, existing GovApps sign-in and per-app permissions.
- WCDA endorsement/signatory restrictions and documents marked DRAFT. Payment cannot issue any endorsement automatically.
- Current \`main\` branch / production deployment is unchanged until controlled launch.

## Database migrations applied to Supabase project dqcthutnrjylswwlvftx

1. \`20261018_wcda_ems_billing.sql\`
2. \`20261018_wcda_ems_detailed_intake.sql\`
3. \`20261018_wcda_ems_documents.sql\`
4. \`20261018_wcda_ems_document_rpc.sql\`
5. \`20261018_wcda_ems_storage_policy.sql\`

All EMS invoice, payment receipt and document metadata tables have RLS enabled; direct access from \`anon\` and \`authenticated\` is revoked. Private evidence is not exposed through direct storage access.

## Release blockers — must be resolved before live money is processed

- **No EMS staff appointments exist in the live EMS staff access register.** An organisation-appointed administrator must provision verified personnel and roles; no fictitious appointments were added.
- **No current delegated signatories exist.** Certificate issuance and endorsement decisions remain blocked.
- Paystack variables exist for **production** Vercel environment only. This does not prove that the merchant is activated or that successful real checkout/settlement has been tested. Keep test keys in a test/preview environment; never copy live secrets into public previews.
- Confirm the actual Paystack dashboard webhook target is **\`https://govapps.wcsports.co.za/api/membership/payments/webhook\`**, for the appropriate environment. Paystack's webhook configuration is managed separately from the source code.
- Complete a controlled **test-mode** end-to-end scenario with two different appointed staff identities (finance prepares, manager independently approves), one authenticated organiser, one test invoice and test transaction. Verify payment success, callback, webhook delivery, duplicate webhook retries, amount mismatch rejection, duplicate invoice prevention and membership webhook regression.
- Test uploads/downloads/failed uploads with both authorised organiser and unauthorised staff session. Verify RLS read protection and retention behaviour.
- Configure verified official WCDA rates/fee basis, invoice numbering/tax invoice policy and finance reconciliation procedures before applying charges. Do not infer statutory or VAT obligations from the app UI.
- Office-captured events remain associated with their capturing staff account; an approved organiser claim/invitation flow is still required before the paper-applicant can pay directly online.
- Microsoft Graph message delivery, SharePoint official archive, real statutory certification, external agency approvals, Ozow checkout and production user acceptance are not implemented by this change.
- Production remains unmodified while these conditions are pending.

## QA notes

- Vercel preview has compiled and passed TypeScript. This confirms build validity only, not a successful live payment.
- The EMS staff, event, invoice, receipt and document registers are empty as of implementation time; no actual payments or endorsements were created.
- **Never mark a payment paid from client callback URL query parameters alone**. All statuses must come from verified Paystack responses and the atomic WCDA settlement ledger.
