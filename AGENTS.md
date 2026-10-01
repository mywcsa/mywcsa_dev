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
- **Secrets (in `/run/base44/app.env`):** `AUTH_SECRET` (generated dev value), `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET` (must be the secret *Value*, not the Secret ID), `AUTH_MICROSOFT_ENTRA_ID_ISSUER`. `auth.ts` accepts the issuer as either a bare tenant ID or the full `https://login.microsoftonline.com/<tenant>/v2.0` URL; the staff login page hides the sign-in button (`isMicrosoftEntraConfigured()`) until these are valid.
- **Auth.js public URL:** compose sets `AUTH_URL=https://3000-${BASE44_PUBLIC_HOST_SUFFIX}`. Without it Auth.js derives the callback URL from the internal host (`0.0.0.0:3000`). The Azure app registration must list `<AUTH_URL>/api/auth/callback/microsoft-entra-id` as a Web redirect URI.
- **Next.js origin:** `allowedDevOrigins` in `next.config.ts` is wired to `BASE44_PUBLIC_HOST_SUFFIX` so the preview origin can load dev assets/HMR. Do not hardcode the host.
- **Server Actions CSRF:** the preview proxy forwards a different `x-forwarded-host` than the browser's `origin`, so Next.js would reject Server Action POSTs (e.g. the staff login form). `experimental.serverActions.allowedOrigins` in `next.config.ts` is wired to the same preview origin to allowlist it.
