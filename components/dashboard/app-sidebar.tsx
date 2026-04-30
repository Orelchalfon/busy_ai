"use client";

import { BarChart3, Bot, CalendarDays, LayoutDashboard, PhoneCall, Settings2, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  locale: string;
};

const items = [
  { href: "/dashboard", icon: LayoutDashboard, labels: { he: "סקירה", en: "Overview" } },
  { href: "/dashboard/agent", icon: Bot, labels: { he: "סוכן AI", en: "AI Agent" } },
  { href: "/dashboard/leads", icon: BarChart3, labels: { he: "לידים", en: "Leads" } },
  { href: "/dashboard/calls", icon: PhoneCall, labels: { he: "שיחות", en: "Calls" } },
  { href: "/dashboard/calendar", icon: CalendarDays, labels: { he: "יומן", en: "Calendar" } },
  { href: "/dashboard/products", icon: ShoppingBag, labels: { he: "מוצרים", en: "Products" } },
  { href: "/dashboard/settings", icon: Settings2, labels: { he: "הגדרות", en: "Settings" } }
];

export function AppSidebar({ locale }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col gap-4 rounded-lg border border-sidebar-border bg-sidebar/90 p-4 text-sidebar-foreground shadow-sm backdrop-blur lg:sticky lg:top-5 lg:w-72 lg:self-start">
      <div className="space-y-2">
        <div className="inline-flex rounded-full bg-sidebar-primary/10 px-3 py-1 text-xs font-semibold text-sidebar-primary">
          LeadPilot AI
        </div>
        <div>
          <h1 className="text-xl font-semibold text-sidebar-foreground">{t("brand.title")}</h1>
          <p className="max-w-60 text-sm leading-6 text-muted-foreground">{t("brand.subtitle")}</p>
        </div>
      </div>

      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {items.map((item) => {
          const href = `/${locale}${item.href}`;
          const active = pathname === href;

          return (
            <Link
              key={item.href}
              href={item.href}
              locale={locale}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{locale === "en" ? item.labels.en : item.labels.he}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/70 p-4">
        <p className="text-sm font-semibold text-sidebar-accent-foreground">{t("sidebar.quickStatusTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("sidebar.quickStatusBody")}</p>
      </div>
    </aside>
  );
}
