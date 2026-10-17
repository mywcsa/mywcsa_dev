import type { Metadata } from "next";
import "./globals.css";

const govAppsIconUrl = "/govapps-favicon.png?v=20261017";

export const metadata: Metadata = {
  title: "MyWCSA GovApps",
  description: "Western Cape Sports Association Government Applications Portal",
  icons: {
    icon: [{ url: govAppsIconUrl, type: "image/png" }],
    shortcut: [{ url: govAppsIconUrl, type: "image/png" }],
    apple: [{ url: govAppsIconUrl, type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}