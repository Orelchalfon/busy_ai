import type { MetadataRoute } from "next";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

const publicRoutes = ["/dashboard"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return siteConfig.locales.flatMap((locale) =>
    publicRoutes.map((route) => ({
      url: getAbsoluteUrl(`/${locale}${route}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: locale === siteConfig.defaultLocale ? 1 : 0.9,
      alternates: {
        languages: {
          he: getAbsoluteUrl(`/he${route}`),
          en: getAbsoluteUrl(`/en${route}`),
          "x-default": getAbsoluteUrl(`/he${route}`)
        }
      }
    }))
  );
}
