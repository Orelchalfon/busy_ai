import { Bell, Languages, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-soft md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span>{t("topbar.searchPlaceholder")}</span>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          {t("topbar.localeToggle")}
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Bell className="h-4 w-4" />
          {t("topbar.notifications")}
        </Button>
        <div className="rounded-2xl bg-secondary px-4 py-2 text-sm">
          <p className="font-medium">{t("topbar.userName")}</p>
          <p className="text-xs text-muted-foreground">{t("topbar.userRole")}</p>
        </div>
      </div>
    </div>
  );
}
