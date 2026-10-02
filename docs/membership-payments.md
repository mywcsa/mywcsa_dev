# Membership PDF downloads and Paystack activation

Application, organisation profile and annual plan buttons now download paginated A4 PDFs with the portal header, dark blue section bars, embedded open-source Source Sans 3 and page numbers. Local drafts are explicitly labelled unsubmitted; they are not official certificates, invoices or receipts. Uploaded file contents and passwords are never included. Interface typography remains unchanged.

## Deployment configuration

The payment integration is implemented, but deliberately returns 503 until **all** secure settings and the AMS invoice API are configured. It does not create invoices from the public preview. No live payment has been made during implementation.

Set these in Vercel **Production**, then redeploy:

- `PAYSTACK_MODE=live`
- `PAYSTACK_SECRET_KEY`: the merchant's live `sk_live_…` key, obtained in Paystack. Never put it in a client/public variable, GitHub, or chat.
- `MEMBERSHIP_PUBLIC_ORIGIN=https://govapps.wcsports.co.za`
- `WCSA_AMS_API_URL`: HTTPS base URL of the staff-controlled persistent AMS invoice service.
- `WCSA_AMS_API_KEY`: dedicated server-to-server credential restricted to invoice claims, lookups and settlements.

No public Paystack key is necessary for hosted redirect checkout. For staging only, use `PAYSTACK_MODE=test`, an `sk_test_…` key, a staging origin and a staging AMS service. Production and preview settings should stay separate.

Configure the live Paystack webhook:
`https://govapps.wcsports.co.za/api/membership/payments/webhook`

Callback set by the server:
`https://govapps.wcsports.co.za/membership/payments/return`

Clients open `https://govapps.wcsports.co.za/membership/payments` and enter their Registry-issued private code. Tokens never appear in URLs or browser storage. The callback shows pending verification, never fabricated success.

## AMS contract (must be implemented in the real AMS backend)

All endpoints require the dedicated Bearer credential. They return no-store JSON, never redirects. Approval is controlled by Registry, not the membership preview. A school invoice uses 2027, WCSSA, School, 35000 cents, ZAR. Other years/categories are intentionally not enabled.

`POST /payment-invoices/claim` body `{ "token": "32-to-256-character-base64url-private-code" }`

Atomically validate a high-entropy, expiring payment token (minimum 256 bits), Registry approval and unpaid status. Rate-limit failed claims. Persist a globally unique `wcsa-<uuid>` reference before replying. Concurrent/repeated claims must return the same reference to prevent duplicate charges; never create a fresh invoice on retry. Return a flat invoice:

```json
{
  "reference": "wcsa-550e8400-e29b-41d4-a716-446655440000",
  "status": "approved_for_payment",
  "initiative": "WCSSA", "category": "School", "year": "2027",
  "amount": 35000, "currency": "ZAR",
  "email": "authorised-payer@example.org",
  "organisationName": "School official name",
  "expiresAt": "2027-12-31T23:59:59Z"
}
```

`GET /payment-invoices/by-reference/<reference>` returns the same persistent invoice (including paid invoices). Missing/unapproved records must fail; no synthetic sample invoice.

`POST /payment-invoices/<reference>/settle` body `{ "reference", "provider":"paystack", "transactionId", "amount", "currency", "mode", "paidAt" }`.

Atomically match the reserved reference and approved amount/currency, enforce unique provider transaction ID/reference, persist payment, issue the official receipt and publish the resulting membership state to the separate organisation interfaces. Repeated identical events return `{ "status":"paid" }` without duplicating a receipt or membership. Contradictory events must fail. Keep an audit trail and reconcile pending payments. Expiration prevents new checkout but must not discard a payment already made against a reserved approved invoice. Return paid only after durable commit. Do not acknowledge a failed settlement.

The portal initializes on the server, controls the R350 amount, enforces the configured origin, validates Paystack's checkout host, checks raw-body HMAC SHA512 webhook signatures using timing-safe comparison, verifies transactions server-side, and matches status, reference, amount, currency, mode, payer email and transaction ID before calling settlement. Invalid or mismatched events never activate membership. Unknown unrelated events are acknowledged; processing failures return non-2xx so Paystack can retry. AMS must enforce durable idempotency and token rate limits; serverless process memory is never a payment ledger.

## Activation check

Implement and test the AMS contract against a persistent database before setting live credentials. Test approved/unapproved/expired/already-paid claims, simultaneous retries, callback without webhook, duplicate events, signature failures, verification mismatches and settlement outage using isolated test mode. Confirm the live merchant supports ZAR. Then configure the live settings and webhook. The public draft portal still has no live registration, document storage or Registry submission backend; payment code does not connect those unrelated previews automatically.

Official API references: https://paystack.com/docs/api/transaction/ and https://paystack.com/docs/payments/webhooks/ .
