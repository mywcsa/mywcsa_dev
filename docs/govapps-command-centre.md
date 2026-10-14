# MyWCSA Command & Control Centre

Route: \`/control\`. Staff-only operational workspace for ServiceDesk, e-Innovation, BiT, ICT and designated executive directors.

## Access control
- Requires a successful **Microsoft Entra** GovApps staff session using an \`@wcsports.co.za\` email.
- Requires \`govapps_control_operators.active=true\` and a separately approved role.
- **No default operators or directors are created** by the schema migration. A verified initial director must be formally authorised and assigned by a database administrator following executive sign-off.
- Operators may thereafter be added/deactivated by a designated director inside the Command Centre, with audit events.
- Roles: director (all teams, operator grants and approvals), einnovation (cross-team operation and approvals), servicedesk (request intake and triage), bit (software team and allocations), ict (device team and allocations), viewer (read-only).
- **PERSAL is separate**. This console does not grant access to PERSAL or change its exclusive approved-access list.

## Live features
- Central queue with request kinds: support, staff account, Business Partner account, access, device, software, other.
- Automatic routing: devices to ICT; software to BiT; identity/onboarding/access to e-Innovation; other intake to ServiceDesk.
- Status, assignee, team and priority tracking; staff email validation.
- Verified allocations register (devices, software, licences, access). Allocation records are bookkeeping of real fulfilment, not automatic deployment.
- Existing Business Partner accounts and WorkHub employee profiles are displayed read-only for authorised teams. **No passwords, DOB or hash fields are queried.**
- Immutable append-only audit event table with operator, action, reference and time.
- Role updates require director authority. Completing identity requests also requires an actual external fulfilment reference.

## Current integration boundaries
- **Staff account request != Entra account creation.** Creating or closing a ticket does not automatically create/delete Microsoft identities, licences or mailboxes. Entra write permissions, Personnel approval and approved provisioning workflow must be configured before adding that functionality.
- **Business Partner request != account creation.** Business Partners must complete the existing self-registration and WCSA ID checks; no default passwords or bypass of Registry checks.
- **Device / licence allocation record != remote issuance.** Assigned items must genuinely exist and be delivered/provisioned before recording.
- Supabase is the source of truth for command cases and audit; Dataverse sync is not turned on without an approved enterprise model.
- SharePoint document libraries and email notifications are not presented as wired until verified.
- This is not an HR/PERSAL administrator; no protected employee pay data is available.

## Operational verification
1. Vercel build passes Next.js compilation and TypeScript.
2. Database tables all have RLS; all command RPC functions reject \`anon\` and \`authenticated\`, and are callable by server-only service role.
3. Confirm the first director has a valid Entra login and written executive authorisation before bootstrapping the operator row.
4. Test real create, routing, update and allocation flows with an approved non-production/test staff operator account after bootstrap. Do not create production staff or partner identities solely to test.
5. Ensure personnel records and Microsoft/Dataverse write access are reviewed separately prior to enabling real provisioning.

## Future modules
- Entra ID + Personnel-approved account provisioning with independent approvals, least privilege, and idempotent reconciliation.
- Partner invitations using expiring, bound self-registration links and Registry verification.
- Real ServiceDesk email/ticket ingress and two-way replies, escalation SLAs and change controls.
- ICT asset inventory, custody/sign-off, return checklists, and software/licence reconciliation.
- Approved Dataverse and SharePoint integrations with retention and least-privilege permissions.
