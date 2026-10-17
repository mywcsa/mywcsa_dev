# MyWCSA GovApps — Outbound Microsoft 365 Email

## Current integration

Outbound email is implemented through **Microsoft Graph application-to-application client credentials**. Application-level \`Mail.Send\` requires tenant admin approval and the app should be scoped to a dedicated sender mailbox using Exchange Online **RBAC for Applications**. A user connection to the ChatGPT Outlook plugin is *not* an authorisation for the deployed Next.js server.

The following Vercel **Production** environment variables are required, kept server-only and not prefixed with \`NEXT_PUBLIC_\`:

- \`GOVAPPS_MAIL_TENANT_ID\` — Entra tenant GUID
- \`GOVAPPS_MAIL_CLIENT_ID\` — dedicated mail application (client) GUID
- \`GOVAPPS_MAIL_CLIENT_SECRET\` — dedicated confidential app credential
- \`GOVAPPS_MAIL_FROM\` — verified Exchange Online mailbox, e.g. a registered \`@wcsports.co.za\` address or provisioned \`@govapps.wcsports.co.za\` mailbox

**Do not fabricate the sending mailbox or merely create a DNS alias.** For an address such as \`notifications@govapps.wcsports.co.za\` to send via Exchange, the subdomain must be an accepted domain and the sending address must be attached to a permitted Exchange mailbox. Confirm that mailbox can actually send, configure the Graph application's access only to the authorised mailbox, and verify SPF/DKIM/DMARC for the sending domain. Never share the secret in a chat or client UI.

## App paths

- \`/control/email\` — restricted Email Centre; configuration diagnostics, send an authenticated test to the current operator's own mailbox, last 100 attempts.
- \`/api/control/email\` — server-only operator endpoint. POST \`{"action":"send_test"}\`; operator can only test their own work address; max 3 attempts per 10-minute window.
- \`lib/govapps/email.ts\` — common server-only send helper; no public arbitrary-recipient mail endpoint.

## Notifications currently wired

1. Service ticket created from a received email manually entered by an operator → acknowledgment with ticket reference to the sender, reply to ServiceDesk.
2. Service ticket resolved → update to known requester's email where present.
3. Appointment booked → appointment summary including the South African local appointment time.
4. External User app request approved or declined → status update with a link to their personal GovApps launcher.

Outgoing messages are **transactional**, plain-text and do **not** include private ID numbers, passwords, Graph tokens or raw error payloads. Message status audit stores only a SHA-256 recipient fingerprint, category, reference, error category, server acceptance status and operator/date. Mailbox secrets and message bodies are never persisted in the mail audit.

## Status semantics

- \`accepted\`: Graph returned **202**: message accepted for processing, not delivery proof.
- \`unconfigured\`: environment missing/incomplete; no send attempted.
- \`failed\`: Graph rejected or network unavailable; main business operation remains saved, no user should be told their email arrived.
- The app does not automatically retry ambiguous failures (avoids duplicate transactional messages). It has no inbound mailbox ingestion or reset-link token flow in this change.

## Deployment checklist

1. Provision the sending mailbox in Microsoft 365; verify the mailbox's licence and domain. Do not assume \`*@govapps.wcsports.co.za\` addresses exist.
2. Create a **dedicated** Microsoft Entra application, approve Graph **Application Mail.Send**, and apply Exchange mailbox scoping. Avoid granting Mail.Read/Mail.ReadWrite or unscoped multi-mailbox send where not required.
3. Save the four variables in Vercel Production → redeploy.
4. Sign in as an authorised Command Centre operator, go to \`/control/email\` and click **Send a test email to my account**.
5. Verify acceptance is recorded AND the mail arrives (or inspect Exchange message trace); only then describe production email delivery as operational.

Microsoft references: https://learn.microsoft.com/en-us/graph/api/user-sendmail , https://learn.microsoft.com/en-us/graph/permissions-reference and https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac.
