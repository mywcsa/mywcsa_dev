# Superseded: Do not provision notifications@govapps.wcsports.co.za

**CANCELLED on 17 October 2026.** The official GovApps sender has been changed to **communications@wcsports.co.za**, an existing Microsoft 365 mailbox.

**Do not follow this document's former instructions** to create a \`notifications@govapps.wcsports.co.za\` mailbox, convert the production GovApps CNAME, or change GoDaddy MX/SPF/DKIM records.

Use the current provisioning and security runbook instead:

[MyWCSA GovApps — Communications Mail Sender](./govapps-sender-communications-20261017.md)

Vercel Production now stores encrypted \`GOVAPPS_MAIL_FROM=communications@wcsports.co.za\` and \`GOVAPPS_MAIL_ENABLED=false\`. Separate Microsoft Graph app-only credentials and a mailbox-scoped permission are still required before sending any real notifications.
