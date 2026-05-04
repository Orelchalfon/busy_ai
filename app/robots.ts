import type { MetadataRoute } from "next";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/", "/trpc/"]
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
    host: siteConfig.url.origin
  };
}
