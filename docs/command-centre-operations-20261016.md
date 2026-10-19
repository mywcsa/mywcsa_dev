# MyWCSA Command Centre — Operations Suite (16 October 2026)

## Route
- /control/operations — authenticated Command Centre operator only. Reachable from the existing /control dashboard.
- /partner — Business Partner membership + approved WCDA Events app allocation.

## Modules
1. Live Operations: auto-refreshing 30-second Supabase snapshots of real tickets, bookings, equipment and recorded incidents. **Not** Vercel live runtime logs, network telemetry or Microsoft sign-in monitoring.
2. Walk-in Users: record office visitors; Directors/e-Innovation may create separate GovApps staff password accounts, external user accounts or Registry-validated Business Partner accounts. Random 32-character-plus passwords are displayed once, never logged or stored plaintext. Staff Microsoft Entra identities **are not created**. External minors require operator acknowledgment of guardian authorisation where applicable. DOB is passed to the existing registration RPC, not copied into visitor logs.
3. App Allocations: staff Membership/CSD/Applications grants via existing staff grant RPC. External User requests are submitted for separate review through the existing Command Centre external approvals queue. Business Partner WCDA Events grants require director/e-Innovation authorisation and a verified WCSA ID. Access to WCDA Events as a Business Partner is checked on *direct* routes too.
4. Ticket Resolution: case worklogs and atomic resolution function, requiring at least 10 characters of meaningful solution text. Identity and access requests retain their separate authorisation/fulfilment process.
5. Appointments: 15/30/45/60/90/120 minute bookings for active WCSA Command Centre operators, real conflict detection via PostgreSQL transaction advisory lock. Staff-only booking workflow; no calendar or email invitations integrated.
6. Equipment: asset tag register, location, custodian and condition updates. Formal device requests use the existing ICT service queue.
7. Requests: displays outstanding requests and links to the existing Command Centre request submission flow.
8. Documents: PDF/PNG/JPEG/TXT, up to 5MB each; private Supabase Storage bucket, authenticated server download relay; file metadata and audit history. Not a fully synchronised SharePoint document library, no document version history or office suite editing.
9. Error Monitor: actual command-operation failures and manually entered incidents; status updates. **Does not yet pull Vercel logs**, Microsoft admin logs or app-wide exceptions.
10. Reports: CSV extracts of recent permitted tickets, visits, equipment, bookings and incidents with spreadsheet-formula escaping; counts show the retrieved window, not an unbounded total.

## Security and operations
- Only active Command Centre operators may use /control/operations; role checks are repeated on each API route. The read-only role receives no ticket, asset or incident details.
- Staff authentication, PERSAL exclusive access and protected staff app allocation registers are unchanged; none is granted through external/partner workflows.
- Walk-in account creation is Director/e-Innovation only and preserves Registry verification for partner IDs.
- New private operational tables use row-level security and reject browser/anon/ordinary authenticated Supabase database access. The server service role performs scoped reads and writes after validating the staff session.
- Every operative action is audited where implemented; sensitive passwords and birth dates are excluded from audit payloads.
- The Vercel preview Next.js/TypeScript build must report READY before merge. Real authenticated operator E2E tests remain necessary; don't claim they were run.
- No user, appointment, ticket, asset, document or app allocation is seeded by migrations.

## Remaining integration work
- First-party Microsoft Graph Entra staff creation, licence assignment, Exchange email and Teams/calendar scheduling (needs tenant-scoped permissions).
- SharePoint document sync and version control (needs approved libraries and retention rules).
- Vercel runtime error/observability streaming and application-wide request tracing.
- Full E2E integration testing using authorised test accounts and secure walk-in verification procedure.
