# MyWCSA GovApps: notifications@govapps.wcsports.co.za — production provisioning

**Approved sender:** \`notifications@govapps.wcsports.co.za\`
**Production website:** \`https://govapps.wcsports.co.za\`
**Current DNS authority:** GoDaddy (\`ns01.domaincontrol.com\`, \`ns02.domaincontrol.com\`)
**Production Vercel app:** \`prj_JPar5gQfsaYADAxEqpY6C6airA8M\`

## Verified steps completed by ChatGPT, 17 October 2026

- Stored Vercel Production encrypted \`GOVAPPS_MAIL_FROM=notifications@govapps.wcsports.co.za\`.
- Stored Vercel Production encrypted \`GOVAPPS_MAIL_ENABLED=false\`.
- Neither the Entra mail app credentials nor a real mailbox has been provisioned/verified.
- The connected Outlook profile is \`ebranch@wcsports.co.za\`. Directory prefix search found no \`notifications\` user; a delegated/shared mailbox read returned \`ErrorInvalidUser\`. This cannot rule out every possible alias.
- Vercel domain config confirms \`govapps.wcsports.co.za\` currently uses a CNAME to Vercel. **Do not delete or overwrite that record casually.**

## 1. Resolve DNS WITHOUT taking the website offline

A CNAME at \`govapps.wcsports.co.za\` **cannot coexist with MX or TXT records at that same hostname** (RFC 1912). Incoming mail for a dedicated \`@govapps.wcsports.co.za\` mailbox requires MX for the mail subdomain, and SPF at the same DNS owner requires TXT.

On GoDaddy DNS for \`wcsports.co.za\`:

1. Use Vercel Project Settings → Domains to inspect the **current recommended A record address(es)** for \`govapps.wcsports.co.za\`; verify these against the latest Vercel domain config before making changes. Earlier inspection suggested values \`216.198.79.1\` and \`64.29.17.1\`, but **do not use stale addresses without reconfirmation**.
2. Plan a controlled change of the **\`govapps\` CNAME** to the supported **\`govapps\` A record(s)**. Keep the website domain association unchanged, verify HTTPS and sign-in after DNS propagation, and have rollback plans. Do not change the root-domain MX.
3. In Microsoft 365 Admin Center → Settings → Domains, add \`govapps.wcsports.co.za\` as a domain if not already added. Since the parent domain is already registered, Microsoft may use inherited verification; follow the actual admin portal and do not invent records.
4. Add the **MX record Microsoft shows for the verified mail subdomain** at DNS owner \`govapps\`. Do NOT guess the tenant's MX target.
5. Add SPF at owner \`govapps\`: \`v=spf1 include:spf.protection.outlook.com -all\` **only if Microsoft 365 is the sole authorised sender for this subdomain**. Preserve/merge any existing SPF correctly; there must be only one SPF TXT policy per name.
6. Add the two DKIM selector CNAME records with **exact tenant-specific target values** shown in Microsoft Defender/Exchange. These are at \`selector1._domainkey.govapps\` and \`selector2._domainkey.govapps\`, not the \`govapps\` record itself.
7. Add DMARC at \`_dmarc.govapps\`, initially with a monitoring policy if appropriate; adjust policy after testing and reviewing reports. Do not overwrite parent-domain DMARC.
8. Verify HTTPS website, DNS MX/TXT/DKIM and external message reception. Vercel DNS record tools are **not authoritative** for this GoDaddy-managed zone.

Sources:
https://www.rfc-editor.org/rfc/rfc1912
https://vercel.com/docs/domains/troubleshooting
https://learn.microsoft.com/en-us/microsoft-365/admin/setup/domains-faq
https://learn.microsoft.com/en-us/microsoft-365/admin/setup/add-domain/

## 2. Provision Exchange Online mailbox

Requires authorised Microsoft 365/Exchange admin session (not provided by the current Outlook plugin).

1. Go to Microsoft 365 Admin → Teams & groups → Shared mailboxes → Add shared mailbox.
2. Name: **MyWCSA GovApps Notifications**; email: **notifications@govapps.wcsports.co.za** (the subdomain must already be accepted). Add authorised people to manage replies, if required. Leave interactive sign-in blocked.
3. Verify its primary SMTP address in Exchange, and confirm mailbox status. Shared mailboxes usually do not require a separate licence below standard size/features limits; review tenant entitlements and compliance.
4. For incident tickets, use \`ServiceDesk@wcsports.co.za\` in the reply-to header, not the unmonitored shared mailbox address.

Source: https://learn.microsoft.com/en-us/microsoft-365/admin/email/create-a-shared-mailbox

## 3. Dedicated Entra app + mailbox-scoped Graph sender

Create a **single-tenant** Entra application named **MyWCSA GovApps · Notifications Sender**. Use a dedicated client credential held **only** in Vercel. Do not reuse \`AUTH_MICROSOFT_ENTRA_ID_SECRET\` or existing user tokens. Prefer certificate credentials / managed identities when possible; current implemented Next.js helper expects a client secret.

**Important least-privilege distinction:** Exchange Online **RBAC for Applications** supports a mailbox-scoped \`Application Mail.Send\` assignment. If using that path, **do not additionally grant unscoped Microsoft Graph Application \`Mail.Send\` admin consent in Entra**, because those permissions are additive and would bypass the Exchange scope. In this setup, the Exchange assignment grants the mail permission. This should be performed and verified by a tenant Exchange administrator.

Admin may run the following example in an authorised PowerShell session **after** creating the Entra app, the mailbox, and verifying the recipient scope. Replace placeholders with the **actual application ID** and **Enterprise Application's service principal object ID**. Do not share client secrets in PowerShell transcript or chat.

\`\`\`powershell
Connect-ExchangeOnline -UserPrincipalName "<EXCHANGE_ADMIN@wcsports.co.za>"

$Sender    = "notifications@govapps.wcsports.co.za"
$AppId     = "<DEDICATED_APP_CLIENT_ID>"
$ServiceId = "<ENTERPRISE_APPLICATION_SERVICE_PRINCIPAL_OBJECT_ID>"
$ScopeName = "MyWCSA GovApps Notifications Only"
$ScopeTag  = "WCSA-GOVAPPS-NOTIFICATIONS-2026"

# Guard: abort rather than accidentally creating a broad scope
Get-EXOMailbox -Identity $Sender -ErrorAction Stop
Set-Mailbox -Identity $Sender -CustomAttribute15 $ScopeTag

# Create a scope matching ONLY the tagged sender.
New-ManagementScope -Name $ScopeName -RecipientRestrictionFilter "CustomAttribute15 -eq '$ScopeTag'"

# IMPORTANT: Inspect preview and confirm EXACTLY ONE intended mailbox.
$sc = Get-ManagementScope -Identity $ScopeName
Get-Recipient -RecipientPreviewFilter $sc.RecipientFilter |
    Format-Table Name,PrimarySmtpAddress,CustomAttribute15

# Automatically abort if preview is not exactly the authorised sender.
$recipients = @(Get-Recipient -RecipientPreviewFilter $sc.RecipientFilter)
if ($recipients.Count -ne 1 -or $recipients[0].PrimarySmtpAddress.ToString().ToLower() -ne $Sender.ToLower()) {
    throw "Mailbox-scope verification failed. No Graph send permission has been assigned."
}
New-ServicePrincipal -AppId $AppId -ObjectId $ServiceId -DisplayName "MyWCSA GovApps Mail Sender"
New-ManagementRoleAssignment -App $ServiceId -Role "Application Mail.Send" -CustomResourceScope $ScopeName

# Confirm authorisation is IN SCOPE only for the sender.
Test-ServicePrincipalAuthorization -Identity $ServiceId -Resource $Sender |
    Format-Table RoleName,InScope,AllowedResourceScope
\`\`\`

Verify \`InScope=True\` for the sender and **False** for a different mailbox, plus verify the Entra app has no unwanted unscoped Graph \`Mail.Send\` grant.

Source: https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac

## 4. Save production variables directly into Vercel

Already stored, encrypted, Production:
- \`GOVAPPS_MAIL_FROM=notifications@govapps.wcsports.co.za\`
- \`GOVAPPS_MAIL_ENABLED=false\`

Still required (Production, encrypted/sensitive; input directly into Vercel project UI):
- \`GOVAPPS_MAIL_TENANT_ID\` — real tenant GUID
- \`GOVAPPS_MAIL_CLIENT_ID\` — dedicated app registration's Application (client) GUID
- \`GOVAPPS_MAIL_CLIENT_SECRET\` — newly created dedicated confidential client secret (**do not paste this into ChatGPT/GitHub/issues**).

Never use \`NEXT_PUBLIC_\` for these variables. Do not create dummy/fake client secrets, and do not use any other company's mailbox. Save changes and **redeploy production** to load environment variables.

## 5. Test FIRST, activate SECOND

1. Leave \`GOVAPPS_MAIL_ENABLED=false\`. This blocks automated ticket/appointment/request notifications.
2. Once the real credentials are present and the mailbox's Exchange permission scope is verified, visit \`https://govapps.wcsports.co.za/control/email\` with an authorised operator's Microsoft account.
3. Click **Send a test email to my account**. The application allows this dedicated test while production notifications are disabled.
4. Confirm Microsoft Graph returned **202 Accepted** *and* the recipient received the message in Outlook / Exchange message trace.
5. Test a request to send from a **different, unauthorised mailbox** is blocked by Exchange RBAC using authorisation simulation / admin diagnostics.
6. Only after the checks pass, change \`GOVAPPS_MAIL_ENABLED=true\` directly in Vercel Production and redeploy.
7. Issue a low-risk real ticket to check the notification type, sender and reply-to. Watch \`/control/email\` for real acceptance and errors.

Current implementation does **not** have inbound Outlook automation, email-template HTML design, recovery email links or mail queue retries; those are separate future features.
