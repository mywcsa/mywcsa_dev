# MyWCDA Events — Governance and Operations phase (16 October 2026)

## Existing production target
- Canonical URL: https://GovApps.wcsports.co.za/WCDA-Events (case-sensitive).
- Source: mywcsa/mywcsa_dev; Next.js on the existing mywcsa-dev Vercel project.
- Supabase: existing MyWCSA GovApps project.
- These changes are additive to the existing Events registry, staff console, office capture, task queues, checklists and audits.
- Unrelated GovApps apps, account sessions, domains and launcher privileges are not changed.

## Newly implemented
1. Secured event-linked registers for safety, inspections, vendors, staffing, logistics, accreditation, operations, incidents, correspondence, finance follow-up and scheduling.
2. Document draft register covering endorsement/approval letters, certificate drafts and memoranda. Every stored document is explicitly DRAFT / NOT ISSUED. There is no fake PDF issue, digital signing or dispatch.
3. Evidence-based endorsement recommendation submitted by an appointed review role.
4. Independent endorsement decision workflow. Only active appointed managers/executives with a separate recorded signing delegation can decide, never the recommending officer. Required checklists, risk classification, valid event status, an evidence-based decision reason and an audit entry are enforced in the database.
5. Server-only HTTP APIs verify a current GovApps session, an active WCDA role, event access, allowed actions, same-origin writes and size limits. Database operations are atomic, and user-provided text is validated.
6. Glassmorphic in-case UI in Poppins, with Western Cape Government blue #001484.

## Access model and production safety
- Staff membership is not inferred from Microsoft login or name. Only separately appointed members of wcda_ems_staff_access can use employee data.
- No role or signing delegation was seeded by this migration.
- Only a documented, approved governance delegation should populate wcda_ems_signing_authority.
- New tables have RLS enabled and revoke direct anon/authenticated permissions; the governance RPC can be executed only through the server-side service role.
- Approval means an internal WCDA endorsement only, **never** municipal permission, statutory event authorisation, a police signoff or safety certificate.
- Financial register tracks follow-ups, **not** invoices or actual payments. Correspondence entries are **not** sent emails. Draft documents are **not** issued certificates.
- Microsoft Graph mail, SharePoint binary storage, actual payment processing and real-time vendor/incident dispatch are separate integrations not claimed here.

## Test and rollout requirements
- Vercel preview build must report READY at the latest commit.
- Confirm migration success, table RLS and no direct anon/authenticated RPC execution.
- Staff and signing authority counts must be checked; a count of zero is a launch blocker for the role-restricted approval feature, not a reason to bypass security.
- Exercise an authenticated staff session and case ownership checks, assessment recommendation, independent approval and rejection, and non-privileged denials before production release.
- Verify canonical production URL and GovApps staff, external organiser and business-partner sign-in unaffected.
- Do not merge or promote until the approved signatory, staff appointments and live acceptance checks are complete.
