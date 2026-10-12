# MyWCSA PERSAL — exclusive access policy (2026-10-12)

Status: APPROVED POLICY; NOT EVIDENCE OF DEPLOYED ACCESS CONTROLS.

## Approved named individuals (18)
1. Selina Ngalo
2. Lungiswa Ngalo
3. Zillindile Lucas Jantjies
4. Tyson Williams
5. Chloe Williams
6. Manette Leibrandt
7. Pieter Marais
8. Christiaan De Villiers
9. Zaylin-Zyle Morris
10. Felicia Marais
11. Selena Leibrandt
12. Adriaan Barnard
13. Stefan Petersen
14. Leandra Neff
15. Monique Abrahams
16. Gerhard October
17. Shedrick Pietersen — Director: Finances & Billing; Manager of PERSAL
18. Lisakhanya Boxoza — Personnel Administrator; Head of PERSAL

## Mandatory enforcement
- Default deny: only these individuals may see the MyWCSA PERSAL GovApps launcher tile or access /persal, subroutes, APIs, exports or protected records.
- Bind approval to verified immutable identity IDs, not names, emails, job titles or mutable user metadata. No identity should be granted access solely from this document; reconcile all 18 people to their existing identity-provider accounts with an authorised administrator.
- Authorisation must be enforced server-side on every request, not merely by hiding the tile.
- Enforce least-privilege roles; entry to PERSAL is not permission to read every salary, bank account or personnel record.
- Segregate payroll preparation, approval and release. Technical administrators must not automatically have payroll data access.
- Enable row-level security and scoped grants on sensitive database resources. Do not expose service-role keys to clients.
- No inherited access from WorkHub, AMS, Careers, Microsoft 365 or business-partner accounts.
- Record all access attempts, grants, revocations, changes, approvals and exports in tamper-resistant audit logs.
- Only authorised executive approval can amend the named register; immediate revocation for compromised or terminated accounts.
- Any Dataverse mirror must enforce the same restrictions independently. Never sync personnel records into an unprotected table.

## Deployment acceptance tests
1. Each of the 18 mapped user IDs can see the launcher tile and reach only permitted PERSAL functions.
2. Unlisted authenticated user cannot see tile, and receives 403 for direct route, API, export and record requests.
3. Anonymous users and public/learner/business-partner sessions are denied.
4. Payroll data is inaccessible to technical-only or restricted roles.
5. Cross-application integrations use scoped service credentials, with auditable access.
6. A revoked user immediately loses access; attempts are logged.

Do not mark deployed until GitHub changes, Base44 build, Supabase RLS, Vercel production deployment and Dataverse controls are independently verified.
