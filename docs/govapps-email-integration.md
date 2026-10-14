# MyWCSA GovApps — official email integration

## Implementation scope
The central `lib/mail/govapps.ts` service prepares branded, Poppins-first HTML notices and sends using **Microsoft Graph / Microsoft 365** from exactly one explicitly configured and Exchange-authorised sender. The service currently integrates into **membership application submission** and **AMS Registry invoice issuance**. Registered users may be internal or external; recipient addresses come from a server-authenticated workflow and a committed invoice/application operation, never an unauthenticated send-any-email form.

**Status:** Source integration is implemented on a review branch. It is **not operational** until the Exchange mailbox, Entra app identity and Vercel secrets are provisioned, scoped, tested and deployed. A Graph HTTP 202 means the service accepted a message, not that it reached the recipient.

No email is sent for account creation, password reset, activation, payment receipts, sensitive PERSAL/HR data, or mass newsletters in this change. Account registrations are currently stored through custom `govapps_create_account` RPC, NOT a Supabase Auth email verification flow. Do not claim verification exists. Payment receipts must only be added after designing an idempotent, durable mail outbox and proof of settlement.

## Existing official WCSA contact addresses and routing
| Workflow | Reply-to / escalation | Outbound sending mailbox |
| --- | --- | --- |
| Main GovApps account support | ServiceDesk@wcsports.co.za | `WCSA_MAIL_SENDER` (verified mailbox) |
| Membership submissions | ServiceDesk@wcsports.co.za | `WCSA_MAIL_SENDER` |
| Membership invoices and financial support | Finances@wcsports.co.za | `WCSA_MAIL_SENDER` |
| Personnel / employee questions (future) | personnel@wcsports.co.za | Not enabled in this change |
| Official communications (future) | communications@wcsports.co.za | Not enabled in this change |

**Suggested** platform mailbox names such as `GovApps@govapps.wcsports.co.za`, `Membership@govapps.wcsports.co.za`, `WorkHub@govapps.wcsports.co.za`, and `PERSAL@govapps.wcsports.co.za` are only naming proposals, not verified active accounts. Do not use them as From addresses until they exist in Exchange and are approved to send. A subdomain DNS record or Microsoft 365 tenant connection alone does not provision a mailbox.

## Setup — action by WCSA Microsoft 365 administrator
1. Confirm the Exchange Online tenant is active and healthy. Resolve any `TenantAccessBlockedException` / service suspension before enabling production mail.
2. Create or identify a dedicated **licensed or supported shared mailbox** under an authorised `wcsports.co.za` domain, e.g. `govapps@wcsports.co.za`, and confirm it can send and receive. If WCSA chooses `govapps.wcsports.co.za` as a mail domain, first verify and configure the accepted domain and required mail DNS in Microsoft 365.
3. Register an Entra ID application solely for GovApps email. Grant the minimum needed **Microsoft Graph application Mail.Send** permission with tenant admin consent. **Crucially, apply Exchange Online Application RBAC** (or Microsoft's current supported mailbox-scoping control) so the app can send **only** as the approved GovApps mailbox, not as any tenant user. Prefer certificate-based credentials in the next iteration when platform support is implemented.
4. Store the following **server-only** variables in Vercel for the relevant approved environments. Never prefix any of these with `NEXT_PUBLIC_`:
   - `WCSA_MAIL_TENANT_ID` — Entra tenant GUID
   - `WCSA_MAIL_CLIENT_ID` — dedicated mail application GUID
   - `WCSA_MAIL_CLIENT_SECRET` — secret from the Entra application (not the existing SSO secret)
   - `WCSA_MAIL_SENDER` — fully qualified, existing authorised Exchange mailbox.
5. Configure SPF, DKIM and DMARC for the actual sender domain. Keep the production web domain `https://govapps.wcsports.co.za` as a link destination; this is not automatically an email-sending domain.
6. Deploy a **preview** build with test mailbox and approved credentials, then run `node --test tests/mail.test.cjs` and controlled real delivery tests (including spam-folder checks and replies) before production promotion. Verify only approved workflows can generate notices.
7. Monitor non-sensitive logs for `[govapps-mail]` outcome messages. When credentials are absent, outcome is `not_configured`. When Graph rejects a call, outcome is `failed`. The business operation still commits and returns successfully; message acceptance is not promised in the UI.

## Required follow-up for production-grade reliability
Implement a durable, access-controlled email outbox with unique event keys, retry, dead-letter review, rate limiting, audit trails and provider status callbacks. Add email verification and password reset **only together with** secure signed tokens and verified identity ownership. Do not email learner DOB, passwords, identity numbers, salary/payroll details, or documents. Gate staff/PERSAL messages using verified employee role and authorised personnel workflows. Add per-module sender aliases only after Exchange setup and documented approval.

The Supabase Auth built-in SMTP server is development-only and does not apply to the custom `govapps_accounts` credential RPC. If in the future the portal migrates to Supabase Auth, configure a production SMTP provider separately for that service.
