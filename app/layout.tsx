import type { Metadata } from "next";
import "./globals.css";

const govAppsIconUrl = "/govapps-favicon.png?v=20261017";

export const metadata: Metadata = {
  metadataBase: new URL("https://govapps.wcsports.co.za"),
  title: "MyWCSA GovApps | WCSA Digital Services Portal",
  description: "MyWCSA GovApps is the secure digital services portal for Western Cape Sports Association NPC staff, business partners and community participants.",
  applicationName: "MyWCSA GovApps",
  creator: "Western Cape Sports Association NPC",
  publisher: "Western Cape Sports Association NPC",
  icons: {
    icon: [{ url: govAppsIconUrl, type: "image/png" }],
    shortcut: [{ url: govAppsIconUrl, type: "image/png" }],
    apple: [{ url: govAppsIconUrl, type: "image/png" }],
  },
  // Inherit noindex across operational, account and sign-in routes.
  // Public pages opt in explicitly at page level; access control is enforced separately.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA">
      <body>{children}</body>
    </html>
  );
}
