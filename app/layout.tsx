import type { Metadata } from "next";
import "./globals.css";

const govAppsIconUrl = "https://static.vecteezy.com/system/resources/previews/055/818/131/non_2x/goverment-icon-design-vector.jpg";

export const metadata: Metadata = {
  title: "MyWCSA GovApps",
  description: "Western Cape Sports Association Government Applications Portal",
  icons: {
    icon: [{ url: govAppsIconUrl, type: "image/jpeg" }],
    shortcut: [{ url: govAppsIconUrl, type: "image/jpeg" }],
    apple: [{ url: govAppsIconUrl, type: "image/jpeg" }],
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