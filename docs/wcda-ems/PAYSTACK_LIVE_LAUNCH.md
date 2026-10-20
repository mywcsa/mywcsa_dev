# MyWCDA Events — Paystack live activation

## R1 internal office payment pilot — automatic readiness (20 October 2026)

The user requested **no second-person approval for the R1 internal Paystack connectivity test**. This applies only to Christiaan's own office-captured application and a single invoice of exactly **R1.00**.

- `wcda_ems_prepare_r1_pilot` now returns an invoice already in `approved_for_payment` once its **individual staff identity, active EMS Super Admin appointment, own office event, unique pilot invoice and R1 amount** are verified.
- There is **no manager approval or simulated approver**. `approved_by_email` and `approved_by_id` stay null. The machine eligibility rule is recorded in `approval_reason`, `approved_at` and the audit trail.
- The existing R1 invoice originally created through the ordinary fee form was narrowly reclassified as the same internal connectivity pilot, only after matching the trusted Christiaan login, office capture, exact R1 amount and pending/no-checkout state. No other fees or invoices are reclassified.
- Both the dedicated **Create R1 pilot invoice** button and the ordinary **R1.00** invoice form now route to this same restricted database function, so the old waiting-for-manager message cannot recur for that tester's own R1 office test.
- A pending Paystack checkout can be retried after the database's initialization-lease period; this does not authorise duplicate settlement.
- Existing official tariffs, invoice approvals and general public checkout remain unchanged. The two general checkout gates are still **false**. Only `WCDA_EVENTS_R1_PILOT_ENABLED` is enabled.
- Executable HTTP API regression checks and an actual Supabase rollback-only transaction were run. **Neither proves successful card settlement.** The authenticated user must run the final R1 Paystack payment and confirm the provider webhook and stored receipt.


Release checklist, 19 October 2026. This document does **not** authorise taking real money.

## Verified status

- Paystack Events code exists on `implementation/wcda-ems-governance-20261016`, not on the production `main` release.
- Existing production Vercel project lists `PAYSTACK_SECRET_KEY`, `PAYSTACK_MODE`, `MEMBERSHIP_PUBLIC_ORIGIN`. They are protected; availability of variable names **does not confirm** live/test mode, validity of their secret values, merchant activation, webhook delivery or settlement.
- Current Supabase ledger: **5 active EMS staff appointments (2 Super Admins, 2 Managers, 1 Finance)**, **0 events, 0 invoices, 0 receipts** at the last query. Staff assignments alone do not authorise an official tariff or represent an end-to-end transaction test.
- GitHub PR #28 is currently **DRAFT**. The earlier merge conflicts were resolved and the branch incorporates the upstream GovApps changes. Payment regression tests and review must pass before a production merge. A Vercel READY build is not a bank/payment gateway test.
- Paystack's site/dashboard integration is not connected to the available tools; its dashboard configuration has not been independently verified.
- Membership payments currently share the global Paystack environment and the signed webhook; **do not change `PAYSTACK_MODE` or `PAYSTACK_SECRET_KEY` globally to activate Events**, as that may interrupt or invalidate Membership payments.

## Implemented additional real-money protection

- Both `WCDA_EVENTS_CHECKOUT_ENABLED` and `WCDA_EVENTS_LIVE_PAYMENTS_ENABLED` are explicit, **Events-only server-side gates**, each configured as encrypted `false` in Vercel production. The first blocks any *new* Event checkout (test and live). The second additionally blocks live-money Event checkout unless explicitly authorised.
- The Events checkout route requires `WCDA_EVENTS_CHECKOUT_ENABLED=true` **before** claiming an invoice checkout, and in live mode also requires `WCDA_EVENTS_LIVE_PAYMENTS_ENABLED=true`. Live callback origin is restricted to `https://govapps.wcsports.co.za`.
- This flag blocks *starting* live WCDA checkout when disabled. **It does not block verified Paystack callbacks/webhooks or settlement of charges already initiated**. Existing Membership checkout is unaffected.
- Every official event invoice requires appointed staff preparation and a different manager/executive approval. Only the linked authenticated organiser may start checkout. Do not bypass those roles to create a test charge.

## Required release sign-offs

1. **Finance policy:** record authorised event fee schedule, waiver/exemption conditions, whether fees include taxes, refund/chargeback policy, official invoicing and reconciliation rules, and authorised owner/approvers. Events staff must not invent event fees.
2. **Staff allocation:** five EMS appointments were provisioned from explicit user authorisations and verified against directory identities. Confirm Felicia prepares, Shedrick or Selena independently approves, and an actual authenticated, app-allocated organiser test account is available. Verify account sign-in/role and fallback restrictions; no test organiser is yet provisioned.
3. **Merchant:** in the Paystack Dashboard, independently verify merchant legal entity, South African ZAR settlements, production account activation, banking and authorised finance contacts. Keep the live key in Vercel production only and test key in an isolated testing environment. Never paste secrets into chats, docs or issue trackers.
4. **Webhook:** configure the Paystack webhook endpoint exactly `https://govapps.wcsports.co.za/api/membership/payments/webhook` using the correct merchant account/environment, HTTPS and signature verification. Confirm live transactions arrive at this webhook. Preserve `wcsa-...` Membership dispatch and confirm `wcda-...` Events dispatch.
5. **Controlled test-mode UAT:** approved official test EMS event, one staff prepared invoice with documented approved amount, another manager's explicit invoice approval, organiser checkout, successful Paystack test payment. Verify signed webhook + return page + provider verify, paid ledger, exactly one receipt, replay behaviour, wrong amount/mode/email rejection and no phantom success.
6. **Membership regression:** existing 2027 WCSSA school membership (R350) still checks out and settles once, or in a sandbox equivalent. Events integration must not change Membership policy.
7. **Production dry run:** run and pass automated Membership + WCDA payment regressions, complete focused code review of PR #28, publish reviewed application code only with **both checkout gates false**, confirm endpoint routes and official origin, then obtain named finance + technical launch approval.
8. **Controlled live test:** only after a duly authorised approver agrees a **real, documented approved charge** and refund/reconciliation path, verify `PAYSTACK_MODE=live` with a matching live secret and verified merchant dashboard, turn **both** WCDA Events gates on for a planned test window, run one authorised real transaction, and inspect Paystack dashboard, bank settlement status (asynchronously), signed webhook and EMS ledger. Do not invent a fee. Stop if any mismatch.
9. **Go/no-go:** only continue general availability once settlement, logs, refund escalation and customer support procedures are verified. On incident set **`WCDA_EVENTS_CHECKOUT_ENABLED=false`** (and the live-only flag false) to prevent new checkouts, while keeping provider verification and settlement of existing payments operational.

## Prerequisites outside the repository

- Paystack merchant dashboard access and authorised approval.
- A verified production live key/mode and callback origin; the available account connection redacts the values.
- Finance-approved official event fee schedule and refund policies; five named appointments exist, but real sign-ins and user acceptance still require testing.
- PR #28 payment test suite/independent code review and guarded production deployment authorisation.
- A full E2E Paystack test and callback reconciliation.

## Scope of proof

A Vercel `READY` deployment proves code compiles and deploys, not that a live payment or merchant bank settlement works. The assistant must not present this as a launched real-money service without the transaction evidence described above.
