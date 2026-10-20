# MyWCDA Events — Finance identity and permission review

Updated: 19 October 2026. The listed appointments were **user-authorised and inserted into the active WCDA Events staff register**. The payment feature is still in the draft pull request; real payments remain disabled.

## Identity checks (Microsoft 365 directory)

| Named official supplied for WCDA Events | Directory name | Individual work email | Proposed EMS application role | State |
|---|---|---|---|---|
| Mr Shedrick Obama Pietersen — Finance Director | Shedrick O. Pietersen | `shedrick@wcsports.co.za` | `manager` (independent invoice approval) | **Active** in EMS register |
| Ms Felicia Marais — Financial Analyst and Advisor | Felicia Marais | `felicia@wcsports.co.za` | `finance` (invoice preparation and controls) | **Active** in EMS register |
| Ms Selena Morgan (formerly Selena Leibrandt) — Events Head (ESD) **and** Financial Accountant & Administrator | Selena Leibrandt (directory still shows former surname) | `selena@wcsports.co.za` | `manager` (Events Head oversight; one person, one account and one role) | **Active** in EMS register |

**Identity clarification received:** Selena Morgan and Selena Leibrandt are **the same individual**. Morgan is her married surname; her existing Entra account still displays **Selena Leibrandt**. Do not create a second login, duplicate finance role, or assign an additional individual's approval rights to `selena@wcsports.co.za`. Any directory display-name change is a separate authorised Microsoft 365 HR/admin task, not required for account mapping.

Directory also returns `finances@wcsports.co.za` under the display name `Finance & Accounts`. **Treat as an official departmental mailbox, not as Shedrick's unique personal login or an independent human approver**. Do not create an EMS appointment for a shared/departmental address.

## Separation of duties

- An individual appointed `finance` prepares an invoice using an organisation-approved fee basis.
- An independently authenticated individual appointed `manager` or `executive` approves with a recorded justification.
- The database prevents the same actor or same individual email from preparing and approving the same invoice.
- The applicant/organiser pays their own approved invoice; no staff account should be used to impersonate the organiser.
- Payments and receipts are separately verified with Paystack; a checkout redirect is not proof of payment.

Recommended minimum pair *subject to formal approval*: Felicia Marais (`finance`, preparer) and Shedrick Pietersen (`manager`, approver). The Finance Director can also prepare an invoice, but cannot approve an invoice that he personally prepared. Keep every login assigned to one natural person, never a departmental mailbox.


## Technology administration

- **Christiaan De Villiers** — `ebranch@wcsports.co.za`: `super_admin`, **active** in the live EMS staff register. The user explicitly authorised the role on 19 October 2026. Directory display name matches Christiaan; however directory first-name/surname fields read Selina/Ngalo. A tenant administrator should confirm account control and correct stale directory profile fields. This is an EMS application-level role, **not** a tenant Global Administrator role.
- **Zaylin-Zyle Morris** — `zaylin@wcsports.co.za`: Microsoft directory identity confirmed. **`super_admin` ACTIVE in the EMS staff register**, explicitly user-authorised. Account is a separate individual from Christiaan, with no shared login or tenant-wide administrative entitlement.
- The new EMS `super_admin` role has its own database role constraint and is recognised by six governed RPCs and the application's feature-branch authorization rules. Independent financial approval, specific endorsement signing authority and disabled real-money checkout remain enforced.
- The official `finances@wcsports.co.za` mailbox is **not** a personal login or an independent human approver.

## Onboarding prerequisites — not yet complete

1. Review the five active, user-authorised EMS appointments and establish responsibility for approval records. Selena Morgan retains her existing account still labelled Leibrandt; confirm Christiaan's account control due to outdated/conflicting underlying directory fields.
2. Identify the approved, documented **event fee schedule** and payment fee/refund policy; do not charge arbitrary application fees.
3. Verify the five active EMS appointment rows and user-authorisation audit strings. `authorisedStaffApps()` derives the launcher permission directly from these appointments. Zaylin is appointed to `super_admin` using his individual Microsoft Entra account.
4. Confirm the user signs into MyWCSA GovApps via the associated Microsoft Entra account and their role appears in the Events finance dashboard.
5. Test prepare/approve denial for the same actor, a different verified approver, organiser-only checkout, Paystack signed webhook and idempotent settlement.
6. Resolve GitHub draft PR #28 conflicts, verify production payment mode and Paystack webhook, and obtain formal go-live approval before setting `WCDA_EVENTS_LIVE_PAYMENTS_ENABLED=true`.

## Verified current state

- Supabase `wcda_ems_staff_access`: **five active appointments** after user-authorised role provisioning: Felicia, Shedrick, Selena, Christiaan and Zaylin.
- Supabase `govapps_staff_app_grants`: **no active `wcda-events` grants** observed on 19 October 2026. The WCDA staff launcher instead derives permissions directly from active WCDA appointments.
- All five roles were provisioned as instructed; no sign-in tests have been executed on the officials' behalf.
- `WCDA_EVENTS_LIVE_PAYMENTS_ENABLED` remains **false** in Vercel production.

## Identity clarification resolved

User confirmed **Selena Morgan is the married name of Selena Leibrandt**. Both previously listed positions refer to a single person, and the existing account is `selena@wcsports.co.za`. The earlier two-person identity ambiguity is closed. Finance appointment rows are active, but actual staff sign-in tests, Paystack receipts and production launch are outstanding.
