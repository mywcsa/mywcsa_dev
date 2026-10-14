# MyWCSA GovApps launcher — implementation & enterprise integration

## Implemented 14 October 2026
- Responsive Poppins application launcher with WCG-inspired navy `#001489`, frosted-glass panels, navigation rail, hero, search, functional `/` shortcut, category filtering, personal browser favourites, keyboard focus states, reduced-motion support.
- Authenticated staff-only launcher route `/my-apps`. NextAuth credentials-based business partners and external accounts cannot use the staff launcher.
- Eight approved navigation entries with existing destinations. Modules that are previews are labelled **Preview**; PERSAL is labelled **Restricted** and is not linked from the launcher until approved identity-based authorisation is implemented.
- Supabase `public.govapps_launcher_apps` contains non-sensitive app metadata, with RLS enabled and no read privileges for `anon` or `authenticated`; only a server credential is granted read access. Server page reads approved metadata via Supabase with fallback entries. Database text cannot alter approved URLs or grant app access.
- Source: `app/my-apps/page.tsx`, `app/my-apps/LauncherDashboard.tsx`, `app/my-apps/launcher.module.css`.
- Migration: `supabase/migrations/20261014_001_govapps_launcher_apps.sql`.

## Microsoft Dataverse (enterprise integration)
A **server-only connectivity adapter** is available in `lib/enterprise/govapps-microsoft.ts`. `dataverseWhoAmI()` tests the approved environment's service identity. This does **not** establish a data sync or grant access. Before enabling synchronisation:
1. Confirm WCSA-approved Dataverse environment URL, table names and ownership of each field.
2. Register and secure an Entra application, with only the approved Dataverse application permissions.
3. Set `GOVAPPS_ENTERPRISE_TENANT_ID`, `GOVAPPS_ENTERPRISE_CLIENT_ID`, `GOVAPPS_ENTERPRISE_CLIENT_SECRET` and `GOVAPPS_DATAVERSE_URL` as encrypted server-side deployment variables (not NEXT_PUBLIC).
4. Define mapping and conflict rules between the Supabase primary database and Dataverse enterprise records; do not bidirectionally sync all employee records by default.
5. Create authorised queue-based synchronisation with retries, idempotency, audit events, and least-privilege scopes after the schema is approved.

## Microsoft SharePoint (document management)
The **server-only** `listApprovedSharePointDocuments()` adapter supports a specifically approved document-library drive when supplied `GOVAPPS_SHAREPOINT_DRIVE_ID` and an authorised Entra application with Graph application permissions. This helper reads library metadata only. It does **not** upload, copy or archive documents.

Create or identify an official WCSA SharePoint site/document library; do not route official organisation documents into an employee's personal OneDrive without express approval. Before enabling managed document copy and archiving, agree:
- Which document classes and versions are authoritative in Supabase and which are archived in SharePoint
- Access groups and least privilege; SharePoint site-scoped access where feasible
- Retention, legal holds, naming and metadata; audit trail and rollback
- User-facing functionality only after permission testing and confirmation of the official drive ID.

## Security / known gaps
- **PERSAL**: The existing `/persal` route redirects to `/personnel`. This launcher redesign does not alter that existing endpoint or claim it has complete identity enforcement. Do not grant personnel access based solely on navigation visibility, names or app-catalog metadata.
- MyWCSA Applications, CSD and MSuite currently open planned-app pages; membership is a preview. These are not represented as finished enterprise systems.
- The Dataverse and SharePoint adapters are preparatory code, not live integrations, until the approved Entra registration, destination IDs, permissions, environment variables and workflows are configured and tested.
- Do not expose server credentials, Graph tokens, PERSAL records or personnel information to client/browser code.

## Rollout
Build and smoke-test a Vercel preview first; merge only after verification. Changes to the Base44 builder app are managed separately from this GitHub/Next.js deployment and are not automatically synchronised.
