# MyWCSA GovApps implementation inventory

Audit date: 2026-10-12. Repository: `mywcsa/mywcsa_dev`, branch `main`. Statuses below are evidence-limited: **UNTESTED does not mean complete**. No financial or personnel records have been altered.

## Verified infrastructure

- GitHub: Next.js 16 application; 194 repository tree entries at audit snapshot.
- Supabase: `dqcthutnrjylswwlvftx`, 23 public tables, 39 applied migrations; all 23 tables report RLS enabled. Policy behaviour is not yet tested.
- Vercel: project `mywcsa-dev`, domain `govapps.wcsports.co.za`; production deployments exist. Exact route behaviour and end-to-end workflows remain to be verified.
- Base44: `mywcsa_dev` design workspace; do not treat Base44 as authoritative production backend.

## Route-by-route inventory

| Source file | Status / next verification |
|---|---|
| `app/api/ams/membership-invoices/route.ts` | UNTESTED — API exists; inspect validation, authorization, persistence and tests |
| `app/api/ams/setup-status/route.ts` | UNTESTED — API exists; inspect validation, authorization, persistence and tests |
| `app/api/auth/[...nextauth]/route.ts` | UNTESTED — API exists; inspect validation, authorization, persistence and tests |
| `app/api/membership/applications/route.ts` | UNTESTED — API exists; inspect validation, authorization, persistence and tests |
| `app/api/membership/documents/[type]/[id]/route.ts` | UNTESTED — API exists; inspect validation, authorization, persistence and tests |
| `app/api/membership/documents/membership_card/[id]/route.ts` | UNTESTED — API exists; inspect validation, authorization, persistence and tests |
| `app/api/membership/payments/checkout/route.ts` | UNTESTED — API exists; inspect validation, authorization, persistence and tests |
| `app/api/membership/payments/member-checkout/route.ts` | UNTESTED — API exists; inspect validation, authorization, persistence and tests |
| `app/api/membership/payments/webhook/route.ts` | UNTESTED — API exists; inspect validation, authorization, persistence and tests |
| `app/api/membership/status/route.ts` | UNTESTED — API exists; inspect validation, authorization, persistence and tests |
| `app/api/workhub/calendar/route.ts` | UNTESTED — API exists; inspect validation, authorization, persistence and tests |
| `app/apps/[appId]/page.tsx` | INCOMPLETE — explicitly planned-only app |
| `app/apps/ams/membership-invoices/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/apps/ams/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/apps/ams/participants/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/apps/ams/participants/register/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/apps/ams/schools/[schoolId]/affiliations/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/apps/ams/schools/[schoolId]/certificates/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/apps/ams/schools/[schoolId]/documents/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/apps/ams/schools/[schoolId]/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/apps/ams/schools/[schoolId]/participants/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/apps/ams/schools/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/apps/ams/schools/register/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/login/business-partner/page.tsx` | UNTESTED — route exists; verify auth and navigation |
| `app/login/business-partner/register/page.tsx` | UNTESTED — route exists; verify auth and navigation |
| `app/login/external-user/page.tsx` | UNTESTED — route exists; verify auth and navigation |
| `app/login/external-user/register/page.tsx` | UNTESTED — route exists; verify auth and navigation |
| `app/login/staff/page.tsx` | UNTESTED — route exists; verify auth and navigation |
| `app/membership/(portal)/[section]/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/membership/(portal)/apply/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/membership/(portal)/certificates/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/membership/login/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/membership/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/membership/payments/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/membership/payments/return/page.tsx` | UNTESTED — implemented interface; verify live data and workflow |
| `app/my-apps/page.tsx` | UNTESTED — route exists; verify auth and navigation |
| `app/page.tsx` | UNTESTED — route exists; inspect controls and backing services |
| `app/persal/page.tsx` | INCOMPLETE — UI/route foundation; authorisation not verified |
| `app/personnel/employees/page.tsx` | INCOMPLETE — UI/route foundation; authorisation not verified |
| `app/personnel/page.tsx` | INCOMPLETE — UI/route foundation; authorisation not verified |
| `app/workhub/[section]/page.tsx` | INCOMPLETE — multiple pending integrations explicitly documented |
| `app/workhub/employment/letters/page.tsx` | UNTESTED — route exists; inspect controls and backing services |
| `app/workhub/employment/page.tsx` | UNTESTED — route exists; inspect controls and backing services |
| `app/workhub/page.tsx` | UNTESTED — route exists; inspect controls and backing services |
| `app/workhub/team/page.tsx` | UNTESTED — route exists; inspect controls and backing services |

## Confirmed implementation gaps

1. `app/apps/[appId]/page.tsx` explicitly labels Applications, CSD, Payroll and MSuite as planned, without operational workflows.
2. `app/workhub/[section]/page.tsx` explicitly marks leave, documents, HR requests, tickets, work, learning and applications integrations as pending.
3. `app/personnel/layout.tsx` checks only whether a user is signed in, not the exclusive approved PERSAL access roster; restrict before exposing sensitive data.
4. `app/personnel/page.tsx` shows navigation and service cards, but the visual search field is not an input. It is not an operational search engine.
5. `app/workhub/page.tsx` deliberately displays dashes for unverified metrics; no synthetic records should replace them.
6. `auth.ts` has Microsoft Entra ID plus business-partner and external credentials providers. Server-side role checks and cross-application identity boundaries need further audit.
7. Existing tests: `tests/payments.test.cjs`, `tests/membership-database.test.cjs`, `tests/supabase-api.test.cjs`. No comprehensive E2E or full ecosystem test suite found in repository tree.

## Dependency-ordered backlog

| Priority | Work item | State |
|---|---|---|
| P0 | Verify tenant-backed staff identity and enforce PERSAL role-based access | INCOMPLETE |
| P0 | Review RLS policies, RPC grants and server-only secrets for all exposed tables | UNTESTED |
| P0 | Verify existing membership payment settlement and webhooks without mutating production transactions | UNTESTED |
| P1 | Add repeatable route, API and permissions tests; enforce checks before release | INCOMPLETE |
| P1 | Complete WorkHub HR requests, tickets, leave and private employee data flows | INCOMPLETE |
| P1 | Build PERSAL registry, appointments, onboarding and audited approvals | INCOMPLETE |
| P1 | Complete AMS organisation workflows and membership portal lifecycle | UNTESTED |
| P2 | Implement Careers, CSD, Applications and MSuite beyond placeholder routes | INCOMPLETE |
| P2 | Implement payroll only after finance-approved rules and restricted access are confirmed | BLOCKED — policy/financial approval required |
| P2 | Integrate notifications, document verification, reports and secure cross-app events | INCOMPLETE |
| P2 | Perform preview E2E and controlled production promotion per module | UNTESTED |

## Resume instructions

1. Review `auth.ts`, `app/personnel/layout.tsx`, the existing PERSAL approved access policy and Supabase staff identity schema. Add fail-closed server-side authorisation with tests; avoid assuming display names equal trusted identities.
2. Run `npm run lint`, `npx tsc --noEmit`, `npm run test:payments`, and `npm run build` in an isolated checkout or CI; record exact results.
3. Continue module-by-module, updating this inventory with verified evidence (source path, test, commit, preview URL). Do not label a feature COMPLETE without the user's definition-of-done checks.
