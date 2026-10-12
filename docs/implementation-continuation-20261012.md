# WCSA implementation continuation — 2026-10-12

## Completed on branch
- PERSAL server layout uses tenant-scoped Entra object IDs with fail-closed environment allowlist. An authorised administrator must reconcile all 18 approved identities; no names or email-based grants.
- Auth JWT/session now carries Entra oid/tid claims and corresponding NextAuth types.
- Added migration `20261012_003_careers_foundation.sql` for vacancies, applicant profiles, documents, vacancy-specific questions, applications, answers, audit events and atomic numbering.
- Reference numbers: WCSA{YYMMDD}-{daily number}; tracking: {organisation code} {annual number}/{YYYY}.
- RLS enabled without permissive policies. Tables are deliberately inaccessible to unprivileged clients until identity mapping and per-record policies are implemented.

## Not done / next actions
1. Validate TypeScript and SQL migration in an isolated preview; fix failures.
2. Define applicant identity-to-profile ownership and Personnel admin access policies, then apply migration to preview Supabase.
3. Build server-side candidate APIs with authorisation, file validation, document storage, draft submission and question answers.
4. Build grey glassmorphic Poppins Careers registration, profile, vacancy listing, step-by-step application, applicant dashboard, and Personnel pipeline.
5. Add screening review with human decisions, waitlist/shortlist, interview and offer workflows.
6. Add integration tests and validate applicant cross-account isolation, PERSAL unauthorised denial and numbering concurrency.
7. Integrate WorkHub/PERSAL onboarding after approved appointment, then extend to remaining GovApps modules.
8. Verify preview deployment and obtain production-release approval before production promotion.

No claims of deployed functionality, passing tests or production completion are warranted yet.
