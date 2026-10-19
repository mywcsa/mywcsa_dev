# MyWCDA Events — Paystack live activation

Release checklist, 19 October 2026. This document does **not** authorise taking real money.

## Verified status

- Paystack Events code exists on `implementation/wcda-ems-governance-20261016`, not on the production `main` release.
- Existing production Vercel project lists `PAYSTACK_SECRET_KEY`, `PAYSTACK_MODE`, `MEMBERSHIP_PUBLIC_ORIGIN`. They are protected; availability of variable names **does not confirm** live/test mode, validity of their secret values, merchant activation, webhook delivery or settlement.
- Current Supabase ledger: **0 active EMS staff appointments, 0 events, 0 invoices and 0 receipts** at the last query. Do not invent test staff, official fees, approvals, applications or successful charges.
- GitHub PR #28 is currently DRAFT and has merge conflicts (`mergeable_state: dirty`); do not merge this branch without resolving conflicts, code review and regression testing.
- Paystack's site/dashboard integration is not connected to the available tools; its dashboard configuration has not been independently verified.
- Membership payments currently share the global Paystack environment and the signed webhook; **do not change `PAYSTACK_MODE` or `PAYSTACK_SECRET_KEY` globally to activate Events**, as that may interrupt or invalidate Membership payments.

## Implemented additional real-money protection

- `WCDA_EVENTS_LIVE_PAYMENTS_ENABLED` is an explicit **Events-only server-side gate**. The new production Vercel encrypted variable is currently set to `false`.
- The Events checkout route checks that live payments are authorised **before** claiming invoice checkout. It also restricts live callback origin to exactly `https://govapps.wcsports.co.za`.
- This flag blocks *starting* live WCDA checkout when disabled. **It does not block verified Paystack callbacks/webhooks or settlement of charges already initiated**. Existing Membership checkout is unaffected.
- Every official event invoice requires appointed staff preparation and a different manager/executive approval. Only the linked authenticated organiser may start checkout. Do not bypass those roles to create a test charge.

## Required release sign-offs

1. **Finance policy:** record authorised event fee schedule, waiver/exemption conditions, whether fees include taxes, refund/chargeback policy, official invoicing and reconciliation rules, and authorised owner/approvers. Events staff must not invent event fees.
2. **Staff allocation:** create at least two verified staff EMS appointments: finance preparer and separate manager/executive approver, plus one authenticated, authorised organiser test account. Confirm no fallback staff sign-in bypass.
3. **Merchant:** in the Paystack Dashboard, independently verify merchant legal entity, South African ZAR settlements, production account activation, banking and authorised finance contacts. Keep the live key in Vercel production only and test key in an isolated testing environment. Never paste secrets into chats, docs or issue trackers.
4. **Webhook:** configure the Paystack webhook endpoint exactly `https://govapps.wcsports.co.za/api/membership/payments/webhook` using the correct merchant account/environment, HTTPS and signature verification. Confirm live transactions arrive at this webhook. Preserve `wcsa-...` Membership dispatch and confirm `wcda-...` Events dispatch.
5. **Controlled test-mode UAT:** approved official test EMS event, one staff prepared invoice with documented approved amount, another manager's explicit invoice approval, organiser checkout, successful Paystack test payment. Verify signed webhook + return page + provider verify, paid ledger, exactly one receipt, replay behaviour, wrong amount/mode/email rejection and no phantom success.
6. **Membership regression:** existing 2027 WCSSA school membership (R350) still checks out and settles once, or in a sandbox equivalent. Events integration must not change Membership policy.
7. **Production dry run:** resolve PR #28 merge conflicts, redeploy reviewed changes with Events live gate **false**, confirm new endpoint routes and official origin, then obtain named finance + technical launch approval.
8. **Controlled live test:** only after a duly authorised approver agrees a *real*, documented permitted charge and refund/reconciliation path, turn Events gate on with a planned window, run one low-value approved real transaction and inspect Paystack dashboard, bank settlement status (asynchronously), signed webhook and EMS ledger. Stop and investigate if any mismatch.
9. **Go/no-go:** only continue general availability once settlement, logs, refund escalation and customer support procedures are verified. On incident set `WCDA_EVENTS_LIVE_PAYMENTS_ENABLED=false` to prevent new checkouts, while keeping settlement verification online.

## Prerequisites outside the repository

- Paystack merchant dashboard access and authorised approval.
- A verified production live key/mode and callback origin; the available account connection redacts the values.
- Finance-approved event fees and real named appointments.
- PR #28 conflict resolution and production deployment authorisation.
- A full E2E Paystack test and callback reconciliation.

## Scope of proof

A Vercel `READY` deployment proves code compiles and deploys, not that a live payment or merchant bank settlement works. The assistant must not present this as a launched real-money service without the transaction evidence described above.
