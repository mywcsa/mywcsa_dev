# MyWCDA Events — Microsoft 365 integration (18 October 2026)

## Implemented in code (preview branch)

- /api/wcda-events/correspondence: authenticated staff compose, independent manager approval, deliberately triggered Microsoft Graph sendMail, and an official read-only case-message view for organisers.
- /api/wcda-events/archive: appointed WCDA records staff can copy verified source evidence from private Supabase Storage to an explicitly configured SharePoint drive and folder.
- User interfaces: Correspondence & Cases (staff); Messages & Support (organisers); Documents & Records offers SharePoint evidence archive controls only for eligible staff.
- New RLS-protected tables: wcda_ems_correspondence and wcda_ems_sharepoint_archives, with audited service-role-only action RPCs. Direct anonymous and authenticated table access is revoked.
- Mail flow: authorised employee prepares message for registered event applicant (not a browser-selected address), a different appointed manager approves, and the approving manager explicitly sends. The database reserves the send attempt before Microsoft Graph is called. Graph HTTP 202 is acceptance, not proof of recipient delivery. Unknown outcomes are marked uncertain and not retried automatically.
- Archive flow: verifies drive item is a folder and its webUrl host equals the approved SharePoint host. Verifies case access and original file size, reserves a unique archive record, uploads with If-None-Match: *, and audits Microsoft drive/item IDs, SHA-256 and archive timestamp. Ambiguous requests are held for human reconciliation. Archived evidence is not an issued certificate or endorsement.

## Confirmed official archive destination (verified by Microsoft SharePoint, 18 October 2026)

- **SharePoint site display name:** MyWCSA GovApps.
- **Site URL:** https://jemresourcesza.sharepoint.com/sites/GovApps
- **Document library display name:** MyWCSA GovApps (NOT the default Documents library).
- **Library URL:** https://jemresourcesza.sharepoint.com/sites/GovApps/MyWCSA%20GovApps
- **Verified library Microsoft Graph drive ID:** `b!V7HPG-SA-ESa0JoRya8zx9Xi7JMzMm1Chp8aRzNCs2aiopHuYyf8Tq0E07fB2rVU`.
- **Existing folder display name:** `MyWCDA Events` — the user explicitly confirmed this, replacing the earlier mistaken name `MyWCSA Events`.
- **Folder URL:** https://jemresourcesza.sharepoint.com/sites/GovApps/MyWCSA%20GovApps/MyWCDA%20Events
- SharePoint lists confirmed the folder as a root-level folder of the correct library (list row id `1`, zero children as observed). This SharePoint **list row ID is NOT a Graph driveItem ID**; it must never be used as `folderId` in Graph upload calls.
- The archive adapter pins the verified SharePoint hostname, `/sites/GovApps` site path and verified library drive ID and resolves the existing `MyWCDA Events` folder **by exact Graph root-relative path at runtime**. It verifies site display name, library name/drive, folder name, drive, and exact web URL before any archive reservation or upload.
- Existing optional `WCDA_SHAREPOINT_HOST`, `WCDA_SHAREPOINT_SITE_PATH` or `WCDA_SHAREPOINT_DRIVE_ID` environment overrides cause a fail-closed error if different from the verified destination. `WCDA_SHAREPOINT_FOLDER_ID` is **not required** because the live Graph folder ID is discovered by exact path.
- The connected SharePoint permissions listing for this folder showed `MyWCSA GovApps Owners` (owner), `MyWCSA GovApps Members` (write) and `MyWCSA GovApps Visitors` (read). This does **not** by itself establish compliance with confidentiality requirements for personal and sensitive organiser documents. The actual membership, inherited permissions, retention, and document classification must be reviewed before activating archiving.
- Accordingly, archiving requires **both** `WCDA_GRAPH_ARCHIVE_ENABLED=true` and `WCDA_SHAREPOINT_ACCESS_REVIEWED=true`, as well as authorised Graph credentials/site-scoped consent. Both remain **off**. No files were uploaded, moved or permission-modified as part of these checks.

## Microsoft 365 administrator prerequisites

1. The intended GovApps site and library are now independently verified (details above). Confirm the Microsoft Entra application belongs to the tenant that owns that site and that its production permissions are scoped to this site. Do NOT use the delegated user's personal OneDrive for official records.
2. Review the existing `MyWCDA Events` folder's inherited Owners/Members/Visitors access and agree on membership, retention, POPIA handling, and official records classification. Restrict access for sensitive evidence if required. Do not create or rename the folder; it already exists.
3. Confirm an Entra app registration and narrowly consented Graph application permissions: Sites.Selected (write permission granted only to the designated WCDA site), and Mail.Send only if case mail is authorised. Restrict application sending to one designated WCSA mailbox using applicable Exchange Online application RBAC/scoping. Avoid granting tenant-wide unrestricted write/mail privileges.
4. Verify the official WCSA sender is a provisioned Exchange Online mailbox or has the required send-as rights. An address alone is not evidence of mailbox existence.
5. Configure secret values server-side in Vercel, never in NEXT_PUBLIC variables or GitHub code:
   * Existing production variable names: GOVAPPS_MAIL_TENANT_ID, GOVAPPS_MAIL_CLIENT_ID, GOVAPPS_MAIL_FROM.
   * Missing: GOVAPPS_MAIL_CLIENT_SECRET.
   * The verified SharePoint site, drive and folder path are pinned in server code; no additional destination identifiers or folder ID are required. Existing override values must match exactly, or archive requests are rejected.
   * Enable only after configuration/testing: `WCDA_GRAPH_SEND_ENABLED=true` for email; `WCDA_GRAPH_ARCHIVE_ENABLED=true` **and** `WCDA_SHAREPOINT_ACCESS_REVIEWED=true` for SharePoint. These are intentionally separate approvals.
6. Test under a dedicated approved sandbox mailbox, site and app credentials before enabling production. Keep preview mail/archive flags disabled without separate test credentials.
7. Test event case isolation, organiser read-only messages, preparer/approver separation, denied permissions, Graph sender scoping, correct destination, file hash, mail timeout and duplicate prevention. Do not use this workflow to auto-issue approvals.
8. Treat accepted Graph emails as accepted for processing, not delivered. Bounce/delivery tracking requires separate reconciliation.

## Current deployment truth

- The Vercel production variable listing did NOT show the Graph client-secret key, activation flags or the SharePoint access-review flag. The verified SharePoint destination is now pinned in code, but the Graph application credentials and access-review acceptance remain outstanding. Both capabilities are disabled by default.
- WCDA EMS appointed staff and event data registers had zero rows at last verification. No live emails or archives were created.
- Preview compilation success is not full Graph, SharePoint or user-acceptance testing.
- Connected Outlook/SharePoint user permissions are distinct from production app-only Graph service permissions.
- PR #28 remains a draft: no automatic merge or production release until the correctly scoped Microsoft configuration and acceptance tests are complete.

## Archive-only Microsoft Entra application and activation

The archival code now requires a **dedicated** Microsoft Entra application rather than reusing the GOVAPPS_MAIL_* identity. Vercel production already contains the verified SharePoint host, site path and library drive ID. New required credentials are `WCDA_SHAREPOINT_TENANT_ID`, `WCDA_SHAREPOINT_CLIENT_ID`, and sensitive `WCDA_SHAREPOINT_CLIENT_SECRET` (not yet present). The Vercel flags `WCDA_GRAPH_ARCHIVE_ENABLED=false` and `WCDA_SHAREPOINT_ACCESS_REVIEWED=false` are explicitly configured, and remain disabled until both approval gates are satisfied.

See **[SHAREPOINT_ARCHIVE_ACTIVATION.md](SHAREPOINT_ARCHIVE_ACTIVATION.md)** for the up-to-date verified target, current Owners/Members/Visitors ACL findings, admin dry-run PowerShell script, the Entra `Sites.Selected` consent and site grant, and staging/UAT sign-off. This supersedes earlier instructions to use the mail app's client secret for SharePoint.
