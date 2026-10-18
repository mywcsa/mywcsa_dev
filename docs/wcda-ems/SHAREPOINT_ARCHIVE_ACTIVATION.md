# MyWCDA Events — official SharePoint archiving activation

18 October 2026 — administrator-run procedure. **Default: offline/not enabled.**

## Verified SharePoint destination

| Property | Verified value |
|---|---|
| Tenant SharePoint host | `jemresourcesza.sharepoint.com` |
| Official site | `https://jemresourcesza.sharepoint.com/sites/GovApps` (display **MyWCSA GovApps**) |
| Microsoft Graph site ID | `jemresourcesza.sharepoint.com,1bcfb157-80e4-44f8-9ad0-9a11c9af33c7,93ece2d5-3233-426d-869f-1a473342b366` |
| Official document library | **MyWCSA GovApps**, NOT the default `Documents` |
| Document library Graph drive ID | `b!V7HPG-SA-ESa0JoRya8zx9Xi7JMzMm1Chp8aRzNCs2aiopHuYyf8Tq0E07fB2rVU` |
| Exact folder | `https://jemresourcesza.sharepoint.com/sites/GovApps/MyWCSA%20GovApps/MyWCDA%20Events` |

The folder exists in the document library (observed SharePoint list item ID `1`; this is *not* a Graph driveItem ID). The EMS backend resolves the Graph driveItem by exact folder path on each archive operation and refuses a mismatched site/library/folder.

## Verified permissions: REVIEW REQUIRED

SharePoint currently advertises the following permission principals for the `MyWCDA Events` folder:

- `MyWCSA GovApps Owners` — owner.
- `MyWCSA GovApps Members` — write.
- `MyWCSA GovApps Visitors` — read.

These permissions must be assessed by the owner. **Do not equate a group name with an approved membership list.** An EMS application may contain contact details, ID records, medical and safety information, contracts and financial attachments. Under a least-privilege/POPIA approach, consider a distinct restricted archive folder with unique permissions. **Keep the exact existing folder path**; do not create a new library or rename it.

On an authorised admin account, open the verified `MyWCDA Events` folder → **Manage access** / **Advanced**. If broad inherited permissions are present, an owner can **Stop inheriting permissions** on *this folder only* and grant only approved event records staff and authorised oversight. Review and, if policy allows, remove broad Members/Visitors **from this folder only**. Preserve legitimate Owners/administrative recovery access. Do not edit the GovApps site's general membership or its other libraries. Re-open Manage access, inspect effective access and groups, and document the approval decision. No automation will mark the access review as passed; the administrator must do this deliberately.

Official Microsoft guidance: https://support.microsoft.com/en-us/sharepoint/lists/sharepoint-sharing-and-permissions/customize-permissions-for-a-sharepoint-list-or-library

## Dedicated Microsoft Entra application

An authorised tenant administrator, not the ChatGPT delegated SharePoint connector, must:

1. Open https://entra.microsoft.com → **Identity → Applications → App registrations → New registration**. Create a single-tenant application named `MyWCDA Events Archives`, with **no browser redirect needed** for the service-only Graph client credential workflow. Do not reuse the Microsoft mail sender app.
2. On **API permissions** add **Microsoft Graph → Application permissions → Sites.Selected**. Choose **Grant admin consent** and verify the consent in the correct tenant. Avoid granting `Sites.ReadWrite.All` to this service.
3. Record the application's **Directory (tenant) ID** and **Application (client) ID** (GUIDs). Do not share a password/client secret through chat or GitHub.
4. Create a short-lived client credential under **Certificates & secrets** (production may use a certificate-based implementation in a later hardening iteration). Copy the secret **value**, not its ID, directly to Vercel as an encrypted or sensitive server-side variable. Establish rotation dates and ownership.
5. Install `Microsoft.Graph.Authentication` from the PowerShell Gallery on an approved administrator workstation, inspect `scripts/wcda/sharepoint-grant-site-selected.ps1` and run **without** `-Apply` as a dry run, supplying the tenant and application GUIDs. It signs in interactively using a SharePoint/Global admin with delegated `Sites.FullControl.All` and checks the exact live site. Then run with `-Apply` and confirm the site permission grant. The script assigns the app `write` **only on this site**; no tenant-wide Graph write consent is needed.
6. Review the resulting site permission via Graph: `GET https://graph.microsoft.com/v1.0/sites/<site-id>/permissions`. Verify that its application ID matches the dedicated archive app with role `write` and that no other site or mail privilege was inadvertently granted.

PowerShell commands (replace placeholders with GUIDs; do not paste placeholders literally):

```powershell
Install-Module Microsoft.Graph.Authentication -Scope CurrentUser
.\scripts\wcda\sharepoint-grant-site-selected.ps1 -TenantId <YOUR-TENANT-ID> -ApplicationClientId <ARCHIVE-APP-CLIENT-ID>
.\scripts\wcda\sharepoint-grant-site-selected.ps1 -TenantId <YOUR-TENANT-ID> -ApplicationClientId <ARCHIVE-APP-CLIENT-ID> -Apply
```

Selected permission overview: https://learn.microsoft.com/en-us/graph/permissions-selected-overview
Microsoft Graph site grant contract: https://learn.microsoft.com/en-us/graph/api/site-post-permissions?view=graph-rest-1.0

## Vercel settings

Project: `mywcsa-dev` (team's existing project). These production variables were already written as **encrypted** with verified values:

- `WCDA_SHAREPOINT_HOST=jemresourcesza.sharepoint.com`
- `WCDA_SHAREPOINT_SITE_PATH=/sites/GovApps`
- `WCDA_SHAREPOINT_DRIVE_ID=<VERIFIED_MY WCSA GOVAPPS_LIBRARY_DRIVE_ID>` (exact verified ID above)
- `WCDA_GRAPH_ARCHIVE_ENABLED=false`
- `WCDA_SHAREPOINT_ACCESS_REVIEWED=false`

The app now uses a **dedicated** archive-only Graph app. After the administrator creates it, place these secrets directly in Vercel **production** (not `NEXT_PUBLIC_*`; do not paste into chat or commit to GitHub):

- `WCDA_SHAREPOINT_TENANT_ID` — tenant GUID
- `WCDA_SHAREPOINT_CLIENT_ID` — dedicated archive app GUID
- `WCDA_SHAREPOINT_CLIENT_SECRET` — dedicated app credential (sensitive/encrypted)

Do not set either activation flag to `true` until all acceptance checks pass. `GOVAPPS_MAIL_*` variables remain separate for the Outlook module.

## Acceptance before a controlled launch

1. Confirm the correct (nonsecret) app GUID, Graph Sites.Selected application consent, grant to only the correct GovApps site, and effective folder ACL.
2. Have authorised WCDA staff appointments in EMS. Confirm an authorised manager/records role sees only its permitted cases; organiser and unauthorised staff cannot write SharePoint archives.
3. Use a **clearly identified non-sensitive test PDF** tied to an explicitly authorised test EMS event, and run one upload after the administrator has approved testing and the feature flags are set in an isolated authorised test environment.
4. Validate the uploaded Graph item really resides inside **MyWCSA GovApps / MyWCDA Events**, with expected hash and immutable audit record. Confirm a repeat attempt fails without creating a second copy.
5. Confirm failed permission/site/folder, Graph timeout, or ambiguous upload leaves archiving blocked or marked for human reconciliation and cannot silently choose another SharePoint drive.
6. Only once approved, set `WCDA_SHAREPOINT_ACCESS_REVIEWED=true` and `WCDA_GRAPH_ARCHIVE_ENABLED=true` in production, redeploy and record authorised go-live approval. Production release is separately gated by the parent PR and end-to-end GovApps testing.

## Current truth

Selected Graph app consent is **not** confirmed. No service credential for the dedicated archive app is installed. Broad Owners/Members/Visitors access has **not** been changed and membership not inspected. No live archive is executed; feature flags stay false. Building the PR preview is not an end-to-end authorised Graph write test.
