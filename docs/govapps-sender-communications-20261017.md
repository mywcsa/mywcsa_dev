# MyWCSA GovApps — official Microsoft 365 sender (17 October 2026)

## Approved sender

**communications@wcsports.co.za** — existing Microsoft 365 directory account and accessible Exchange mailbox, verified using the connected Outlook account.

The superseded proposal **notifications@govapps.wcsports.co.za is cancelled**. Do **not** create that mailbox, add the govapps subdomain as an email domain, or alter the production website CNAME/MX/TXT records to support it.

**Vercel Production configuration already changed:**
- \`GOVAPPS_MAIL_FROM=communications@wcsports.co.za\` (encrypted)
- \`GOVAPPS_MAIL_ENABLED=false\` (encrypted; deliberate fail-closed default)

## Remaining provisioning: dedicated Microsoft Graph application

The accessible Communications mailbox does **not** mean that deployed GovApps has permission to send as it.

1. In the **WCSA** Microsoft Entra admin center, register a **single-tenant** confidential application named **MyWCSA GovApps | Outbound Mail**. Record its actual **Directory (tenant) ID** and **Application (client) ID**. Do not reuse the staff-login application or its secret.
2. Configure an application-only way for the app to send as **communications@wcsports.co.za only**. Prefer **Exchange Online RBAC for Applications** assigning \`Application Mail.Send\` to a verified recipient scope containing exactly this mailbox.
3. **Do not also add a separate tenant-wide Microsoft Graph \`Mail.Send\` application consent** to this app when using Exchange RBAC-scoped \`Application Mail.Send\`. Grants are additive, potentially defeating mailbox restriction.
4. Create a dedicated secret or certificate for this app (current GovApps email helper expects **client ID + client secret**). Store the secret directly in Vercel as an encrypted Production environment variable; never paste it in chat, documentation, GitHub or an issue.
5. Verify, using Exchange admin tools, that the app is in scope for Communications and *not* in scope for other WCSA mailboxes.

Microsoft's official guide:
https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac
https://learn.microsoft.com/en-us/graph/api/user-sendmail

### Exchange PowerShell example (to be run by authorised Exchange administrator)

Use the actual Entra application/client ID and its **enterprise service principal object ID**. The tag is just an example: first confirm it doesn't collide with existing \`CustomAttribute15\` usage; do not overwrite production metadata without checking.

\`\`\`powershell
Connect-ExchangeOnline -UserPrincipalName "<EXCHANGE_ADMIN_UPN>"
$Sender    = "communications@wcsports.co.za"
$AppId     = "<DEDICATED_MAIL_APP_CLIENT_ID>"
$ServiceId = "<ENTERPRISE_APP_SERVICE_PRINCIPAL_OBJECT_ID>"
$Tag       = "WCSA-GOVAPPS-COMMUNICATIONS-2026"
$Scope     = "MyWCSA GovApps Communications Mail Only"

Get-EXOMailbox -Identity $Sender -ErrorAction Stop
# Check existing CustomAttribute15 before editing; stop if it is used by another workflow.
Get-Recipient -Identity $Sender | Format-List PrimarySmtpAddress,CustomAttribute15

Set-Mailbox -Identity $Sender -CustomAttribute15 $Tag
New-ManagementScope -Name $Scope -RecipientRestrictionFilter "CustomAttribute15 -eq '$Tag'"
$sc = Get-ManagementScope -Identity $Scope
$recipients = @(Get-Recipient -RecipientPreviewFilter $sc.RecipientFilter)
if ($recipients.Count -ne 1 -or $recipients[0].PrimarySmtpAddress.ToString().ToLower() -ne $Sender) {
    throw "Sender scope is not exactly the intended mailbox. Stopping."
}
New-ServicePrincipal -AppId $AppId -ObjectId $ServiceId -DisplayName "MyWCSA GovApps Outbound Mail"
New-ManagementRoleAssignment -App $ServiceId -Role "Application Mail.Send" -CustomResourceScope $Scope
Test-ServicePrincipalAuthorization -Identity $ServiceId -Resource $Sender |
    Format-Table RoleName,InScope,AllowedResourceScope
\`\`\`

Afterward test \`Test-ServicePrincipalAuthorization\` with another existing WCSA mailbox and verify its sending role is **not** in scope.

## Add remaining Vercel Production variables

Only these three variables are missing:

- \`GOVAPPS_MAIL_TENANT_ID\` — actual tenant GUID
- \`GOVAPPS_MAIL_CLIENT_ID\` — dedicated mail app GUID
- \`GOVAPPS_MAIL_CLIENT_SECRET\` — dedicated app secret (encrypted; don't disclose)

\`GOVAPPS_MAIL_FROM\` and \`GOVAPPS_MAIL_ENABLED\` are already set. The mail service is strict: it accepts no sender other than \`communications@wcsports.co.za\`.

### Controlled delivery acceptance test

1. Redeploy the Vercel Production project to load the new Graph credentials.
2. Keep \`GOVAPPS_MAIL_ENABLED=false\`; only the authenticated Command Centre operator's explicit *test* message is allowed while disabled.
3. Sign in at https://govapps.wcsports.co.za/control/email and click **Send a test email to my account**.
4. Confirm Microsoft Graph responds HTTP **202 Accepted** AND the test reaches the operator's Outlook inbox or Exchange message trace.
5. Check actual sender shown is \`communications@wcsports.co.za\`.
6. Only after mailbox-scope checks and delivery confirmation, set \`GOVAPPS_MAIL_ENABLED=true\` in Vercel Production and redeploy. This activates notifications for support tickets, resolutions, appointments and external app decisions.
7. Check Email Centre acceptance/audit status; Microsoft Graph 202 is *not* recipient delivery proof.

The connected Outlook plugin can read the existing Communications mailbox; it does **not** have authority to create Entra applications, grant Exchange roles, or provide Vercel's app-only token credentials.

**DNS:** No GoDaddy or Vercel DNS changes are required solely to reuse the already-working \`@wcsports.co.za\` mailbox. Do not edit MX, SPF, DKIM or the \`govapps\` CNAME as part of this change.
