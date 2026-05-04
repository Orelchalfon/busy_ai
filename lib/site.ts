export const siteConfig = {
  name: "BusyAI",
  url: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://busy.ai"),
  description: "Hebrew-first CRM and AI sales dashboard for Israeli businesses.",
  locales: ["he", "en"] as const,
  defaultLocale: "he"
};

export function getAbsoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
