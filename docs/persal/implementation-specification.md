# MyWCSA GovApps | PERSAL — implementation specification

Canonical production URL: https://govapps.wcsports.co.za/persal
Official application title: MyWCSA GovApps | PERSAL

## UI
WCG dark blue (lightened for readability), modern glassmorphism, Poppins, responsive and accessible dashboards, genuine functional modules, charts and meaningful hierarchy. No placeholder links. Preserve GovApps authentication and branding.

## Routing
PERSAL launcher links to /persal. /persal and its subroutes are protected; do not redirect to /personnel. Update app metadata, menus, links, breadcrumbs, and deep links. Keep /personnel separate if used by existing WorkHub features. Deny unauthorized users at the server, not only in the UI.

## Exclusive access
Follow docs/security/persal-access-policy-2026-10-14.md. Supabase contains public.persal_access_register (19 named entries, all initially disabled), workspace memberships, RLS-protected employee/task/event tables, and a gated Entra identity mapping. Only a manually verified, immutable Microsoft Entra subject and issuer, with an enabled named register row, may gain access. Authorization cannot rely on name, email, or mutable metadata; deny unverified principals on all pages and APIs. See migration 20261014_003_persal_secure_foundation.sql.

## Platform ownership
Base44: visual iteration; GitHub: reviewed source, migrations and tests; Supabase: primary source of truth, least privilege and RLS; Dataverse: approved scoped enterprise sync; SharePoint: authorised document libraries, retention, version control; Vercel: build/deploy and production domain; licensed external visual assets only.

## Required checks before production sign-off
Build and route smoke tests, 19 identity mappings, anonymous and unlisted-user denial, protected API/record/export tests, salary least-privilege, audit logs, SharePoint and Dataverse ACL tests, live production domain check. Never mark integrations complete without verification.

## Initial implementation status (2026-10-14)
The secure Home workspace, 8 main modules, role-specific dashboard switcher, combined/department inbox, employee lookup and event-outbox schema are implemented on a review branch, not promoted to production. Employee/payroll write flows and downstream event consumers are not yet available for live processing. Do not represent this implementation as a government-certified PERSAL installation.
