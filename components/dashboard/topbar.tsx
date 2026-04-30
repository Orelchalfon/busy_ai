"use client";

import { Bell, Languages, Monitor, Moon, Search, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const t = useTranslations();
  const { theme, cycleTheme } = useTheme();
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card/85 p-3 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
      <div
        role="search"
        aria-label={t("topbar.searchPlaceholder")}
        className="flex min-h-11 flex-1 items-center gap-3 rounded-lg border border-border/60 bg-background px-4 py-3 text-sm text-muted-foreground"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{t("topbar.searchPlaceholder")}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 self-start md:flex-nowrap md:self-auto">
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" aria-hidden="true" />
          {t("topbar.localeToggle")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          aria-label={t("topbar.themeToggleLabel", { theme: t(`topbar.theme.${theme}`) })}
          onClick={cycleTheme}
          suppressHydrationWarning
        >
          <ThemeIcon className="h-4 w-4" aria-hidden="true" />
          <span suppressHydrationWarning>{t(`topbar.theme.${theme}`)}</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Bell className="h-4 w-4" aria-hidden="true" />
          {t("topbar.notifications")}
        </Button>
        <div className="min-h-11 rounded-lg bg-secondary px-4 py-2 text-sm">
          <p className="font-medium">{t("topbar.userName")}</p>
          <p className="text-xs text-muted-foreground">{t("topbar.userRole")}</p>
        </div>
      </div>
    </div>
  );
}
