import { ThemeProvider } from "@/components/theme-provider";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  applicationName: siteConfig.name,
  title: {
    default: "BusyAI - Hebrew CRM and AI Sales Dashboard",
    template: "%s | BusyAI"
  },
  description: siteConfig.description,
  keywords: [
    "CRM",
    "AI Sales Dashboard",
    "Hebrew-first",
    "Israeli Businesses",
    "Lead Management",
    "Sales Automation",
    "Customer Insights",
    "Business Growth"
  ],
  authors: [{ name: "BusyAI Team", url: siteConfig.url.toString() }],
  alternates: {
    canonical: "/he/dashboard",
    languages: {
      he: "/he/dashboard",
      en: "/en/dashboard",
      "x-default": "/he/dashboard"
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    type: "website",
    url: "/he/dashboard",
    siteName: siteConfig.name,
    title: "BusyAI - Hebrew CRM and AI Sales Dashboard",
    description: siteConfig.description,
    locale: "he_IL",
    alternateLocale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "BusyAI - Hebrew CRM and AI Sales Dashboard",
    description: siteConfig.description
  },
  category: "business"
};

const themeBootScript = `(()=>{try{const e=localStorage.getItem("leadpilot-theme")||"system",t=matchMedia("(prefers-color-scheme: dark)").matches,o=e==="dark"||e==="system"&&t;document.documentElement.classList.toggle("dark",o),document.documentElement.style.colorScheme=o?"dark":"light"}catch{}})();`;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: getAbsoluteUrl(),
  description: siteConfig.description,
  inLanguage: ["he-IL", "en-US"],
  sameAs: []
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='he'
      className='h-full antialiased'
      data-scroll-behavior='smooth'
      suppressHydrationWarning>
      <body className='min-h-full'>
        <Script
          id="theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeBootScript }}
        />
        <Script
          id="organization-json-ld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
