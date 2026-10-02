import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyWCSA GovApps",
  description: "Western Cape Sports Association Government Applications Portal",
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