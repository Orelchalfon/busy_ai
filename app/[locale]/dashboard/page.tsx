import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { CalendarClock, PhoneCall, Sparkles, UserRoundCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/server/db/data";

const leadStatusStyles: Record<string, string> = {
  חדש: "border-chart-3/25 bg-chart-3/10 text-chart-3",
  מעקב: "border-chart-5/25 bg-chart-5/10 text-chart-5",
  "נקבעה פגישה": "border-primary/20 bg-primary/10 text-primary"
};

export default async function DashboardPage() {
  await connection();

  const t = await getTranslations("dashboard");
  const { calls, dashboardStats, leads, slots } = await getDashboardData();

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={<Button>{t("primaryAction")}</Button>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-secondary/35">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>{t("leadOverviewTitle")}</CardTitle>
                <CardDescription>{t("leadOverviewDescription")}</CardDescription>
              </div>
              <Badge className="w-fit border border-primary/15 bg-primary/10 text-primary">
                <UserRoundCheck className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {t("activeLeadsBadge", { count: leads.length })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="grid gap-3 rounded-lg border border-border/70 bg-background/85 p-4 transition-colors hover:border-primary/25 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{lead.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <span dir="ltr">{lead.phone}</span>
                    <span aria-hidden="true">|</span>
                    <span>{lead.source}</span>
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      leadStatusStyles[lead.status] ?? "border-border bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {lead.status}
                  </span>
                  <span className="font-semibold tabular-nums">{lead.value}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-secondary/35">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>{t("activityTitle")}</CardTitle>
                <CardDescription>{t("activityDescription")}</CardDescription>
              </div>
              <Badge className="w-fit border border-chart-3/25 bg-chart-3/10 text-chart-3">
                <Sparkles className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {t("aiLiveBadge")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {calls.map((call) => (
              <div key={call.id} className="rounded-lg border border-border/70 bg-background/85 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 font-medium">
                    <PhoneCall className="h-4 w-4 text-primary" aria-hidden="true" />
                    {call.leadName}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">{call.createdAt}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{call.summary}</p>
              </div>
            ))}
            <div className="rounded-lg border border-primary/10 bg-gradient-to-br from-primary/10 via-accent/70 to-secondary/70 p-4">
              <p className="inline-flex items-center gap-2 font-medium">
                <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
                {t("calendarSnapshotTitle")}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {slots.slice(0, 2).map((slot) => (
                  <li key={slot.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium text-foreground">{slot.title}</span>
                    <span>{slot.window}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
