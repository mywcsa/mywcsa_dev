import type { Metadata } from "next";
import GatewayClient from "./gateway-client";

const baseUrl = "https://govapps.wcsports.co.za";
const description =
  "Access MyWCSA GovApps, the secure digital gateway for Western Cape Sports Association NPC services, business partners, staff and community participants.";

export const metadata: Metadata = {
  title: "MyWCSA GovApps | WCSA Digital Services Portal",
  description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "/",
    siteName: "MyWCSA GovApps",
    title: "MyWCSA GovApps | WCSA Digital Services Portal",
    description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "MyWCSA GovApps – People, Services, Progress" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyWCSA GovApps | WCSA Digital Services Portal",
    description,
    images: ["/opengraph-image"],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": baseUrl + "/#organization",
      name: "Western Cape Sports Association NPC",
      url: "https://wcsports.co.za",
      logo: baseUrl + "/govapps-favicon.png",
    },
    {
      "@type": "WebSite",
      "@id": baseUrl + "/#website",
      name: "MyWCSA GovApps",
      url: baseUrl + "/",
      description,
      inLanguage: "en-ZA",
      publisher: { "@id": baseUrl + "/#organization" },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <GatewayClient />
    </>
  );
}
