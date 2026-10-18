import type { MetadataRoute } from "next";

const site = "https://govapps.wcsports.co.za";

export default function sitemap(): MetadataRoute.Sitemap {
  // List only confirmed public, independently useful landing pages.
  return [
    { url: site + "/", changeFrequency: "monthly", priority: 1 },
    { url: site + "/membership", changeFrequency: "monthly", priority: 0.8 },
  ];
}
