# MyWCDA Events — Finance identity and permission review

Updated: 19 October 2026. This file is a **pending appointment proposal**, not evidence that anyone has been appointed or granted financial permissions.

## Identity checks (Microsoft 365 directory)

| Named official supplied for WCDA Events | Directory name | Individual work email | Proposed EMS application role | State |
|---|---|---|---|---|
| Mr Shedrick Obama Pietersen — Finance Director | Shedrick O. Pietersen | `shedrick@wcsports.co.za` | `manager` (independent invoice approval) | Directory-confirmed; formal appointment pending |
| Ms Felicia Marais — Financial Analyst and Advisor | Felicia Marais | `felicia@wcsports.co.za` | `finance` (invoice preparation and controls) | Directory-confirmed; formal appointment pending |
| Ms Selena Morgan — Events Head (ESD) | **Not found under Morgan**; user supplied `selena@wcsports.co.za`, which directory attributes to **Selena Leibrandt** | **UNRESOLVED** | `manager` only if separately authorised after identity confirmation | BLOCKED — conflicting identity |
| Miss Selena Leibrandt — Financial Accountant and Administrator | Selena Leibrandt | Directory returns `selena@wcsports.co.za`, but user separately assigned this address to Selena Morgan | `finance` only if user confirms account/person association | BLOCKED — conflicting identity |

Directory also returns `finances@wcsports.co.za` under the display name `Finance & Accounts`. **Treat as an official departmental mailbox, not as Shedrick's unique personal login or an independent human approver**. Do not create an EMS appointment for a shared/departmental address.

## Separation of duties

- An individual appointed `finance` prepares an invoice using an organisation-approved fee basis.
- An independently authenticated individual appointed `manager` or `executive` approves with a recorded justification.
- The database prevents the same actor or same individual email from preparing and approving the same invoice.
- The applicant/organiser pays their own approved invoice; no staff account should be used to impersonate the organiser.
- Payments and receipts are separately verified with Paystack; a checkout redirect is not proof of payment.

Recommended minimum pair *subject to formal approval*: Felicia Marais (`finance`, preparer) and Shedrick Pietersen (`manager`, approver). The Finance Director can also prepare an invoice, but cannot approve an invoice that he personally prepared. Keep every login assigned to one natural person, never a departmental mailbox.

## Onboarding prerequisites — not yet complete

1. An authorised WCDA/WCSA administrator confirms appointment authority, intended application scope, start date and each official's Microsoft identity (including any identity collision).
2. Identify the approved, documented **event fee schedule** and payment fee/refund policy; do not charge arbitrary application fees.
3. After independent authorisation, provision an active `wcda_ems_staff_access` row for each verified *individual* login, with an accurate named `appointed_by` audit value. `authorisedStaffApps()` derives the WCDA Events launcher grant from this live register, so do not add broad generic app grants merely to bypass it.
4. Confirm the user signs into MyWCSA GovApps via the associated Microsoft Entra account and their role appears in the Events finance dashboard.
5. Test prepare/approve denial for the same actor, a different verified approver, organiser-only checkout, Paystack signed webhook and idempotent settlement.
6. Resolve GitHub draft PR #28 conflicts, verify production payment mode and Paystack webhook, and obtain formal go-live approval before setting `WCDA_EVENTS_LIVE_PAYMENTS_ENABLED=true`.

## Verified current state

- Supabase `wcda_ems_staff_access`: **no active staff appointments** observed on 19 October 2026.
- Supabase `govapps_staff_app_grants`: **no active `wcda-events` grants** observed on 19 October 2026. The WCDA staff launcher instead derives permissions directly from active WCDA appointments.
- No finance access has been provisioned by this review.
- `WCDA_EVENTS_LIVE_PAYMENTS_ENABLED` remains **false** in Vercel production.

## One blocking clarification

Are **Selena Morgan** and **Selena Leibrandt** the same person, or two different people? If they are different, supply a separately verified work email for Ms Morgan rather than assigning both identities to `selena@wcsports.co.za`.
