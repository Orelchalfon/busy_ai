import type { ReactNode } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = hasLocale(routing.locales, rawLocale)
    ? rawLocale
    : routing.defaultLocale;
  const isHebrew = locale === "he";
  const title = isHebrew
    ? "דשבורד CRM ומכירות AI בעברית"
    : "Hebrew CRM and AI Sales Dashboard";
  const description = isHebrew
    ? "מערכת BusyAI לניהול לידים, שיחות AI, יומן מכירות וקטלוג מוצרים לעסקים בישראל."
    : siteConfig.description;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/dashboard`,
      languages: {
        he: "/he/dashboard",
        en: "/en/dashboard",
        "x-default": "/he/dashboard"
      }
    },
    openGraph: {
      title,
      description,
      url: getAbsoluteUrl(`/${locale}/dashboard`),
      locale: isHebrew ? "he_IL" : "en_US"
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <div lang={locale} dir={locale === "he" ? "rtl" : "ltr"}>
      <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
    </div>
  );
}
