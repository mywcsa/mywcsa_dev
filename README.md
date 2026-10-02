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

Source Sans 3 is the default font for MyWCSA system screens, including the membership portal and AMS. The official Adobe variable upright and italic WOFF2 files are bundled in `app/fonts/`, loaded through `next/font/local` in `app/fonts.ts`, and licensed under the included SIL Open Font License (`app/fonts/OFL.txt`). No external font service is required.

New screens should inherit the default body font. Where an explicit font is necessary, use `var(--font-system)` in CSS or inline styles; controls should inherit their surrounding font. Avoid adding page-specific font families.

Exceptions: preserve the existing typography and appearance of the main GovApps login (`app/page.tsx` and its gateway styles), the staff authentication gateway (`app/login/staff/page.tsx`), and the app-selection page (`app/my-apps/page.tsx`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
