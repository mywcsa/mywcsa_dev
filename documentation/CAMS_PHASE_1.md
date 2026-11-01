# MyWCSA CAMS — Phase 1 Foundation

Owner: Western Cape Sports Association NPC  
Environment: MyWCSA GovApps  
Development branch: feature/cams-phase-1  
Classification: Internal staff administration

## Scope delivered
- Staff-only sign-in interface with no public registration.
- Cape Town weather, South African date and live time on login.
- Protected staff dashboard.
- Initial institutional navigation and staff workspace.
- Supabase-backed staff allowlist and role/permission foundation.
- Organisation, directorate and department master tables.
- Audit event foundation.
- Branch-scoped Vercel preview configuration.
- Additive Supabase migration; existing GovApps tables are not altered.

## Architecture
- Next.js App Router in the existing WCSA-owned mywcsa/mywcsa_dev repository.
- Supabase Auth for password authentication.
- cams_staff_access is the CAMS allowlist. A valid Supabase Auth account alone does not grant CAMS access.
- Supabase Row Level Security is enabled on all Phase 1 CAMS tables.
- HttpOnly, SameSite=Lax cookies hold access and refresh tokens.
- Weather is read from Open-Meteo for Cape Town. Weather is informational and is not used for access decisions.
- The existing MyWCSA GovApps Supabase project is reused with additive cams_ tables only.
- Vercel preview environment variables are scoped to feature/cams-phase-1.
- Production deployment remains unchanged.

## Required environment variables
- SUPABASE_URL
- SUPABASE_ANON_KEY

The publishable/anon key is used only as the public Supabase API key. No service-role key is used by the frontend or login flow.

## Initial staff onboarding
1. Create or verify the employee's Supabase Auth account through the approved administrator process.
2. Obtain the Auth user UUID from the Supabase dashboard.
3. Confirm the employee's identity and institutional appointment outside the application.
4. Insert an active cams_staff_access row with the correct organisation and placement.
5. Assign only the approved role in cams_staff_roles.
6. Add role permissions through cams_role_permissions.
7. Test login and confirm an account without an active allowlist record is denied.

No default administrator is seeded. Do not put a service-role key in frontend code or public Vercel environment variables.

## Security notes
- Login is allowlist-gated after Supabase password authentication.
- No self-registration endpoint is provided.
- RLS is enabled for all CAMS tables.
- Existing GovApps tables and policies are not modified by the CAMS migration.
- Staff access must be suspended or revoked when employment or authorisation ends.
- Sensitive learner, employee, health, disciplinary and financial data are out of scope for Phase 1 and require separate access classifications before their modules are introduced.

## Acceptance tests
- Unauthenticated access to /cams/dashboard returns to /cams.
- A valid Auth user without an active cams_staff_access row is denied.
- An active staff user can sign in and refresh a session.
- Logout clears both session cookies.
- Staff can read only their own access record unless they hold an approved permission.
- Staff without access.manage cannot assign roles.
- No public registration is displayed or exposed.
- Weather failure does not prevent login.
- Date and time use Africa/Johannesburg.
- Dashboard labels unimplemented modules as planned and does not fabricate operational statistics.

## Deployment
Deploy the feature branch only to a Vercel preview environment after successful build and review. Keep the production branch and GovApps production deployment unchanged until formal approval.
