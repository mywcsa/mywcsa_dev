# MyWCSA GovApps | PERSAL — implementation specification

Canonical production URL: https://govapps.wcsports.co.za/persal
Official application title: MyWCSA GovApps | PERSAL

## UI
WCG dark blue (lightened for readability), modern glassmorphism, Helvetica, responsive and accessible dashboards, genuine functional modules, charts and meaningful hierarchy. No placeholder links. Preserve GovApps authentication and branding.

## Routing
PERSAL launcher links to /persal. /persal and its subroutes are protected; do not redirect to /personnel. Update app metadata, menus, links, breadcrumbs, and deep links. Keep /personnel separate if used by existing WorkHub features. Deny unauthorized users at the server, not only in the UI.

## Exclusive access
Follow docs/security/persal-access-policy-2026-10-12.md. Supabase migration persal_exclusive_access_registry creates public.persal_access_register (18 named entries, all initially disabled), RLS and public.persal_has_access(). Match each person to verified auth.users.id through documented executive-authorized process; never authorize by name, email, or mutable user metadata. All requests must check access, including APIs, exports and document links. No automatic access via other apps.

## Platform ownership
Base44: visual iteration; GitHub: reviewed source, migrations and tests; Supabase: primary source of truth, least privilege and RLS; Dataverse: approved scoped enterprise sync; SharePoint: authorised document libraries, retention, version control; Vercel: build/deploy and production domain; licensed external visual assets only.

## Required checks before production sign-off
Build and route smoke tests, 18 identity mappings, anonymous and unlisted-user denial, protected API/record/export tests, salary least-privilege, audit logs, SharePoint and Dataverse ACL tests, live production domain check. Never mark integrations complete without verification.
