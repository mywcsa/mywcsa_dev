# MyWCDA Events — Microsoft 365 integration (18 October 2026)

## Implemented in code (preview branch)

- /api/wcda-events/correspondence: authenticated staff compose, independent manager approval, deliberately triggered Microsoft Graph sendMail, and an official read-only case-message view for organisers.
- /api/wcda-events/archive: appointed WCDA records staff can copy verified source evidence from private Supabase Storage to an explicitly configured SharePoint drive and folder.
- User interfaces: Correspondence & Cases (staff); Messages & Support (organisers); Documents & Records offers SharePoint evidence archive controls only for eligible staff.
- New RLS-protected tables: wcda_ems_correspondence and wcda_ems_sharepoint_archives, with audited service-role-only action RPCs. Direct anonymous and authenticated table access is revoked.
- Mail flow: authorised employee prepares message for registered event applicant (not a browser-selected address), a different appointed manager approves, and the approving manager explicitly sends. The database reserves the send attempt before Microsoft Graph is called. Graph HTTP 202 is acceptance, not proof of recipient delivery. Unknown outcomes are marked uncertain and not retried automatically.
- Archive flow: verifies drive item is a folder and its webUrl host equals the approved SharePoint host. Verifies case access and original file size, reserves a unique archive record, uploads with If-None-Match: *, and audits Microsoft drive/item IDs, SHA-256 and archive timestamp. Ambiguous requests are held for human reconciliation. Archived evidence is not an issued certificate or endorsement.

## Microsoft 365 administrator prerequisites

1. Confirm the intended WCSA tenant. The connected delegated SharePoint search returned personal OneDrive files under jemresourcesza-my.sharepoint.com/personal/ebranch_wcsports_co_za, not an independently verified WCDA official document library. Do NOT silently archive official case records there.
2. Identify an approved WCDA SharePoint team site and private case-records library; create a restricted folder and agree on membership, retention, governance and legal document handling. Obtain Microsoft Graph drive ID, destination folder item ID, and approved *.sharepoint.com hostname.
3. Confirm an Entra app registration and narrowly consented Graph application permissions: Sites.Selected (write permission granted only to the designated WCDA site), and Mail.Send only if case mail is authorised. Restrict application sending to one designated WCSA mailbox using applicable Exchange Online application RBAC/scoping. Avoid granting tenant-wide unrestricted write/mail privileges.
4. Verify the official WCSA sender is a provisioned Exchange Online mailbox or has the required send-as rights. An address alone is not evidence of mailbox existence.
5. Configure secret values server-side in Vercel, never in NEXT_PUBLIC variables or GitHub code:
   * Existing production variable names: GOVAPPS_MAIL_TENANT_ID, GOVAPPS_MAIL_CLIENT_ID, GOVAPPS_MAIL_FROM.
   * Missing: GOVAPPS_MAIL_CLIENT_SECRET.
   * WCDA_SHAREPOINT_DRIVE_ID, WCDA_SHAREPOINT_FOLDER_ID, WCDA_SHAREPOINT_HOST.
   * Enable only after configuration/testing: WCDA_GRAPH_SEND_ENABLED=true and WCDA_GRAPH_ARCHIVE_ENABLED=true.
6. Test under a dedicated approved sandbox mailbox, site and app credentials before enabling production. Keep preview mail/archive flags disabled without separate test credentials.
7. Test event case isolation, organiser read-only messages, preparer/approver separation, denied permissions, Graph sender scoping, correct destination, file hash, mail timeout and duplicate prevention. Do not use this workflow to auto-issue approvals.
8. Treat accepted Graph emails as accepted for processing, not delivered. Bounce/delivery tracking requires separate reconciliation.

## Current deployment truth

- The Vercel production variable listing did NOT show a Graph client-secret key, a WCDA SharePoint destination, or either activation flag; this implementation is disabled by default until the admin supplies them.
- WCDA EMS appointed staff and event data registers had zero rows at last verification. No live emails or archives were created.
- Preview compilation success is not full Graph, SharePoint or user-acceptance testing.
- Connected Outlook/SharePoint user permissions are distinct from production app-only Graph service permissions.
- PR #28 remains a draft: no automatic merge or production release until the correctly scoped Microsoft configuration and acceptance tests are complete.
