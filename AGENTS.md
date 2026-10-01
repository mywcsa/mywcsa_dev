<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Base44 dev environment

- **Stack:** Next.js 16.3.5 (Turbopack) + React 19 + Tailwind v4 + NextAuth v5 (Microsoft Entra ID provider).
- **Run:** `docker compose -f docker-compose.base44.yml up -d`. The `web` service bind-mounts the repo, runs `npm ci` then `next dev --hostname 0.0.0.0 -p 3000`. Live reload is active.
- **Port:** 3000 (host). Healthcheck probes `http://localhost:3000` via Node fetch.
- **Public page:** `/` is a client-side login landing page — renders without any credentials.
- **Auth-gated routes:** `/login/staff` → `/my-apps` and `/apps/ams/*` call `auth()` server-side and redirect to `/login/staff` when unauthenticated. Sign-in requires the Microsoft Entra ID credentials below.
- **Secrets (in `/run/base44/app.env`):** `AUTH_SECRET`, `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`, `AUTH_MICROSOFT_ENTRA_ID_ISSUER`. Dev placeholders are generated so the app boots; replace the Microsoft ones with real Azure AD app-registration values to enable sign-in.
- **Next.js origin:** `allowedDevOrigins` in `next.config.ts` is wired to `BASE44_PUBLIC_HOST_SUFFIX` so the preview origin can load dev assets/HMR. Do not hardcode the host.
