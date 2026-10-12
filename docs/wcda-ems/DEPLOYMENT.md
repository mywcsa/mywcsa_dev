# MyWCDA Events (EMS) — controlled route rollout

Fixed production URL: **https://GovApps.wcsports.co.za/WCDA-Events**.
Preserve the exact capitalisation of the `/WCDA-Events` path.

## Integration decisions verified on 12 October 2026
- Existing application: `mywcsa/mywcsa_dev`, Next.js 16 and NextAuth.
- Current Vercel project: `mywcsa-dev` with domain `govapps.wcsports.co.za`.
- Current production deployment branch (at inspection): `implementation/secure-personnel-20261012`.
- Existing Supabase project: `dqcthutnrjylswwlvftx`.
- The route is implemented within the existing Next.js app; no DNS cutover or second domain is required.
- Existing root GovApps login, the launcher and other applications are not removed.
- Staff access uses a verified Microsoft Entra session plus an explicitly provisioned EMS role.
- Business partners and external users use existing GovApps credential authentication.
- The EMS registration and list endpoints are protected server-side, not trusted to the client.

## Official mail routing (transport integration not yet enabled)
- Billing: `finances@wcsports.co.za`
- Certificates: `WCDA.Certificates@wcsports.co.za`
- System: `WCDAEms@govapps.wcsports.co.za`
- Support: `ServiceDesk@wcsports.co.za`

## Do not treat this foundation as a live authorisation system
The initial route, dashboard, application intake endpoint and database migration are first-release foundations. Only events returned by the connected database are displayed. Letters, payments, approval decisions, certificate issuance, Microsoft Graph two-way email syncing, live operations, external vendor functions and certificate verification are deliberately not presented as functional.

## Controlled rollout checklist
1. Verify GitHub/Vercel build and route manifests for `/WCDA-Events` and `/api/wcda-events/events`.
2. Validate the additive SQL in an approved staging database. Do not run against production without the change approval process.
3. Confirm WCDA legal entity, authorised signatories, Registrar, fee schedule and formal delegations.
4. Provision `wcda_ems_staff_access` only for approved officials; no seed users are provided.
5. Verify that internal staff credentials have `authProvider=microsoft-entra-id` and external credentials have their correct provider values.
6. Test anonymous login gateway, Microsoft staff sign-in, business partner and external user sign-in.
7. Verify role and event-ownership isolation, invalid input rejection, CSRF origin checks and event reference generation.
8. Verify 2026 reference continuity: do not reset sequence if existing verifiable EMS references have been issued.
9. Test restored sessions, logout, HTTP caching, assets and all redirects under the **exact** case-sensitive path.
10. Run end-to-end tests against the **target** production hostname over HTTPS only after authorised promotion. Confirm `https://GovApps.wcsports.co.za/WCDA-Events` loads and all GovApps routes are still functional.
11. Keep production deployment status **INCOMPLETE** until exact URL and target environment tests pass.

## Reference policy
`EMS YY/NNNNN` (example `EMS 26/00231`); atomic annual allocation using South African local-year boundaries. Historical certificate `PMJ327109` and finance `ESC327109` are not EMS master references and must be preserved separately after verification.

## Correspondence policy
Incoming Microsoft 365 replies will require message ID/thread ID plus case matching and authorisation checks. No mailbox has been connected by this branch; do not claim email sent or received.
