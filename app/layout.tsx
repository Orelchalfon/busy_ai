import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadPilot AI",
  description: "Hebrew-first CRM and AI sales dashboard for Israeli businesses.",
};

const themeBootScript = `
(() => {
  try {
    const storageKey = "leadpilot-theme";
    const theme = localStorage.getItem(storageKey) || "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
    document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
