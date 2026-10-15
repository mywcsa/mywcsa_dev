# MyWCSA Command Centre: Staff Access and Notices (15 Oct 2026)

Paths: /login/staff (Microsoft or separate GovApps staff password), /staff/password (mandatory first-password replacement), /my-apps/notices (notice board after each login), /control/administration (operator administration).

## Password login
- Only authorised Command Centre directors/e-Innovation operators may create an account.
- A strong one-time temporary password is shown to the creator once. It is stored only as a bcrypt hash.
- A staff member must change it before accessing GovApps; password failures trigger a temporary lockout.
- Account suspension and the global staff-password switch deny subsequent protected app access.
- A GovApps account does not create or reset any Microsoft Entra identity, mailbox or Microsoft password.
- PERSAL remains Microsoft Entra-only, enforced by its separate verified identity and workspace register.

## Application allocations
The general allocation console controls only Membership, CSD, and Applications. Command Centre, PERSAL, AMS, and WCDA Events use their own authoritative approval/appointment registers. Never use the general allocation grant as a substitute for their approvals.

## Notice board
Directors can publish and unpublish Information, Important and Urgent notices. An employee sees the notice board following each new recognised staff sign-in and clicks Proceed to reach their own filtered launcher. With no notices it displays a welcome message. Directors can disable the board using the configuration tab.

## Release and security
- All writes use audited database functions restricted to the server service role.
- No fallback accounts, notices, or application allocations were seeded.
- Preview build and SQL permissions must be checked before production merge.
- Real employee SSO/password end-to-end cannot be tested without an authorised test identity.
- Password fallback does not yet include a separate MFA factor. Do not present it as equivalent to Microsoft Entra MFA for high-risk tenant administration.
