<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## MyWCSA typography

Use Source Sans 3 for all new and updated system interfaces. It is bundled in `app/fonts/` and loaded by `app/fonts.ts`; inherit the body default or use `var(--font-system)` for explicit font declarations. Keep form controls in the surrounding font.

Preserve the existing fonts and appearance of the main GovApps login (`app/page.tsx` and its gateway styles), staff authentication gateway (`app/login/staff/page.tsx`), and app launcher (`app/my-apps/page.tsx`). Do not apply Source Sans 3 overrides to those pages.