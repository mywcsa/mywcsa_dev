This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Typography

Segoe UI is the default for MyWCSA system screens through `var(--font-system)` in `app/globals.css`. Windows devices use their installed Segoe UI; other devices use their native system font. No Microsoft font files or external font requests are used. The earlier Adobe Source Sans 3 files remain available but are no longer loaded.

New screens inherit the body default. Use 14px body/fields, 13–14px menus/tables, and 18–20px section headings. Preserve the original GovApps and staff login typography and the launcher font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Membership preview

Open `/membership/dashboard` or use the MyWCSA Membership card on `/my-apps`. The login screen at `/membership/login` links to the dashboard preview and the application wizard at `/membership/apply`. The membership dashboard includes profile, membership/payments, participants, programmes, teams, fixtures, calendar, documents, messages, support and settings routes.

This is a disconnected browser prototype. Account verification and the renewal lookup are labelled simulations; WCSA ID `0547071626` loads a single sample school and opens the confirmation wizard before Step 4. New applications use all six steps. Only the school fee is confirmed at R350/year; other fees are shown as to be confirmed. No IDs are allocated, files uploaded, official documents issued, applications submitted, payments taken, emails sent or accounts/access created. No API, database or browser-persistent storage is used. Drafts remain in React memory while navigating the membership layout and clear on refresh or leaving it. Passwords are never placed in draft state or downloads.

The illustrated address map is a placeholder, not live geocoding. Learners, players and staff are registered later in the organisation interfaces. No newsletters are collected.

All staff launcher cards are links. AMS opens its existing interface; Applications, CSD, Payroll and MSuite open authenticated information pages labelled as planned apps, rather than broken routes. The membership card opens the public preview.
