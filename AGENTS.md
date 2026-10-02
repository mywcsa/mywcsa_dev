<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## MyWCSA typography

Use Segoe UI for all new and updated system interfaces, through the shared `var(--font-system)` stack in `app/globals.css`. The stack uses locally installed Segoe UI on Windows and native system fonts elsewhere; do not redistribute Microsoft font files. Use 14px body/field text, 13–14px navigation and table text, and 18–20px section headings. Controls should inherit their surrounding font.

Preserve the existing typography and appearance of the main GovApps login (`app/page.tsx` and its gateway styles) and staff authentication gateway (`app/login/staff/page.tsx`). The app launcher (`app/my-apps/page.tsx`) keeps its existing font; its cards must be accessible links to real routes.

Membership screens are disconnected previews until explicitly authorised for integration. Never present simulated verification, payments, Registry approval, WCSA ID lookup or file selection as live operations. Staff/player registration belongs to the separate organisation interfaces, not the membership application. Do not add newsletters.

Paystack integration is authorised. Keep live checkout dependent on a trusted Registry-approved AMS invoice, server-controlled fees and durable AMS settlement. Never expose secret keys or charge from a local preview draft. See `docs/membership-payments.md` for the required backend contract and environment settings.
