<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MyWCSA GovApps — Development Guide

## Stack
- Next.js 16.3.5 + Auth.js v5 (next-auth beta) + Tailwind CSS 4 + TypeScript
- PostgreSQL 16 via Docker Compose (`docker-compose.base44.yml`)
- Prisma ORM for database access (`prisma/schema.prisma`)
- bcryptjs for password hashing, nodemailer for magic link emails

## Running the app
```
docker compose -f docker-compose.base44.yml up -d --build
```
The compose installs npm deps, runs `prisma generate` + `prisma db push`, then starts `next dev -H 0.0.0.0` on port 3000.

## Auth providers (auth.ts)
1. **Microsoft Entra ID** — staff OAuth login → `/my-apps`
2. **Credentials** (member-credentials) — members log in with WCSA ID or email + password → `/membership/dashboard`
3. **Email** — magic link login (development logs link to console)

Session strategy: JWT. The Prisma adapter manages users/accounts/verification-tokens.

## Route protection (middleware.ts)
- `/membership/*` — requires `role: "member"` (redirects to `/login/member`)
- `/my-apps`, `/apps/*` — requires `role: "staff"` (redirects to `/login/staff`)

## Membership portal routes
- `/login/member` — tabbed login (WCSA ID/email + password, or magic link)
- `/register` — 4-step member registration (public, outside auth-protected layout)
- `/membership/dashboard` — member status, info, quick actions
- `/membership/profile` — editable personal/sport/emergency details
- `/membership/card` — printable digital membership card

## Membership tiers (lib/membership-tiers.ts)
Athlete, Coach, Official, Associate, Life Member

## WCSA ID format
Auto-generated on registration: `WCSA-YYYY-NNNN` (sequential per year)

## WCG design standard
- Deep blue #001489, white panels
- Century Gothic for public pages (login, register), inherited from layout for portal pages
- Poppins for internal app launcher (`/my-apps`)
- Cape Town header image on all staff/member layouts
