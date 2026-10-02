import type { Metadata } from "next";
import "./globals.css";
import { sourceSans3 } from "./fonts";

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
    <html lang="en" className={sourceSans3.variable}>
      <body>{children}</body>
    </html>
  );
}