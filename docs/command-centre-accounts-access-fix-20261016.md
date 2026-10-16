# Command Centre — Unified Operator Access & Express Add Accounts (16 October 2026)

## Entry points
- `/control/accounts` — dedicated **Add Accounts** page available to every signed-in, active Command Centre operator. Visible from the Command Centre header, Accounts tab and Operations sidebar.
- `/control/operations` → **Ticket Resolution** includes **Create a ticket from an email**: enter sender, subject, details, priority, category and optional email reference. Creates a real routed request in the original ticket register.
- `/control/administration/external` — existing external app review queue, now available to all authorised Command Centre operators.

## Rules
- The **active Command Centre operator register** is the operational access boundary. There are **no additional ServiceDesk / ICT / BiT / viewer department gates** on new walk-in, ticket, app allocation, appointment, equipment, document, incidents or report workflows.
- Add Accounts: **Staff** creates an independent GovApps fallback password login for a `@wcsports.co.za` email. Does **not** provision a Microsoft Entra user, mailbox or licence. **External User** creates the standard personal GovApps login using existing validation. **Business Partner** must have an existing approved Registry WCSA ID.
- Temporary passwords are cryptographically random, returned only on creation and not stored in plaintext. Staff fallback password rotation is required. No accounts are seeded by this release.
- Existing Command Centre operator emails cannot be assigned new fallback passwords through walk-in registration or the express Add Accounts screen. A separately verified recovery path is required to prevent impersonation.\n- PERSAL membership, Microsoft Entra tenant controls, registration verification and app-scoped allocations remain separate. New users do not automatically gain apps.
- Identity/access tickets still keep their independent confirmation/reference checks. This is separate from ordinary ticket creation and resolution.
- **Email helpdesk intake is manual**. No Outlook mailbox sync, email notifications or automatic threading is claimed.
- Supabase RPC functions enforce an active authorised operator; they are callable only with service-role server credentials, not public or ordinary authenticated database clients. Updated role checks have been applied live.
- Base44 visual redesign was requested in the existing `mywcsa_dev` Base44 app editor. Its builder workspace and the GitHub/Vercel production source are not automatically the same deployment; the live Next.js interface includes the new glassmorphic Add Accounts screen and existing WCG blue styling.

## Verification
- Next.js/TypeScript build and Vercel preview READY required before merging.
- Database permission/role checks inspected; no production test accounts or help tickets created.
- Authenticated end-to-end creation and ticket work still require authorised test sessions; do not claim them tested merely because the deployment built.
