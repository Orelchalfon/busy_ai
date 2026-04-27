import { BarChart3, CalendarDays, LayoutDashboard, PhoneCall, Settings2, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  locale: string;
  currentPath: string;
};

const items = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { href: "/dashboard/leads", icon: BarChart3, labelKey: "nav.leads" },
  { href: "/dashboard/calls", icon: PhoneCall, labelKey: "nav.calls" },
  { href: "/dashboard/calendar", icon: CalendarDays, labelKey: "nav.calendar" },
  { href: "/dashboard/products", icon: ShoppingBag, labelKey: "nav.products" },
  { href: "/dashboard/settings", icon: Settings2, labelKey: "nav.settings" }
];

export function AppSidebar({ locale, currentPath }: SidebarProps) {
  const t = useTranslations();

  return (
    <aside className="flex w-full flex-col gap-6 rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-soft lg:w-72">
      <div className="space-y-2">
        <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          LeadPilot AI
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("brand.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("brand.subtitle")}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const href = `/${locale}${item.href}`;
          const active = currentPath === href;

          return (
            <Link
              key={item.href}
              href={item.href}
              locale={locale}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(21,128,61,0.12),rgba(251,191,36,0.18))] p-4">
        <p className="text-sm font-semibold">{t("sidebar.quickStatusTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("sidebar.quickStatusBody")}</p>
      </div>
    </aside>
  );
}
