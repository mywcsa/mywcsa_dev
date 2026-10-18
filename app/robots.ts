import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: "https://govapps.wcsports.co.za/sitemap.xml",
    host: "https://govapps.wcsports.co.za",
  };
}
