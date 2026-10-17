# MyWCSA GovApps — Microsoft 365 Outbound Email

**Current official sender: communications@wcsports.co.za.**
This existing WCSA Microsoft 365 account and Exchange mailbox were confirmed through the connected Outlook tools.

The previous proposed \`notifications@govapps.wcsports.co.za\` sender is **cancelled**. No additional GovApps email subdomain, new mailbox, or DNS change is needed for the existing Communications account.

## Current production variables

- \`GOVAPPS_MAIL_FROM=communications@wcsports.co.za\` — configured/encrypted in Vercel Production
- \`GOVAPPS_MAIL_ENABLED=false\` — configured/encrypted, outbound transactional notifications OFF until the test succeeds
- \`GOVAPPS_MAIL_TENANT_ID\` — not yet configured
- \`GOVAPPS_MAIL_CLIENT_ID\` — not yet configured
- \`GOVAPPS_MAIL_CLIENT_SECRET\` — not yet configured

The sender in \`lib/govapps/email.ts\` is deliberately restricted to **communications@wcsports.co.za**. A signed-in Outlook connection is not a server-side Graph \`Mail.Send\` grant.

## Authenticated Email Centre

- https://govapps.wcsports.co.za/control/email — configuration status, privacy-safe send log, controlled test.
- \`/api/control/email\` — only a Command Centre operator may request a test, limited to that operator's own WCSA email and three attempts in ten minutes.
- \`lib/govapps/email.ts\` — sends plain-text transactional mail with Microsoft Graph application-only token, when configured.

## Events currently wired

- Acknowledgements for ServiceDesk email intake tickets.
- Ticket resolved notices.
- Appointment booking notices.
- External User app approval and decline notices.

Delivery record statuses are \`accepted\` (Graph HTTP 202, not guaranteed delivery), \`failed\`, or \`unconfigured\`. Logs contain only hashed recipient identifiers and non-sensitive delivery metadata.

## Provisioning and least privilege

An authorised Microsoft 365 admin must create a separate single-tenant Entra mail application, grant only mailbox-scoped \`Application Mail.Send\` through Exchange Online RBAC for Applications, then securely add the three missing Production environment values. Avoid additional Entra tenant-wide Graph Application \`Mail.Send\` consent when using the scoped RBAC assignment; privileges are additive.

After a production redeploy, use **Send a test email to my account** and confirm the message really arrives from Communications. Only then set \`GOVAPPS_MAIL_ENABLED=true\` and redeploy.

**Detailed authoritative runbook:** [GovApps Communications sender provisioning](./govapps-sender-communications-20261017.md)

Docs:
https://learn.microsoft.com/en-us/graph/api/user-sendmail
https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac
