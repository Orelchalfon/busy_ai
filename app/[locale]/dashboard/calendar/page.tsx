import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCalendarSlots } from "@/server/db/data";

export default async function CalendarPage() {
  await connection();

  const t = await getTranslations("calendarPage");
  const slots = await getCalendarSlots();

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={<Button>{t("primaryAction")}</Button>}
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("agendaTitle")}</CardTitle>
            <CardDescription>{t("agendaDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="rounded-lg border border-border/70 bg-background/80 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{slot.title}</p>
                    <p className="text-sm text-muted-foreground">{slot.window}</p>
                  </div>
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {slot.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{slot.owner}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("summaryTitle")}</CardTitle>
            <CardDescription>{t("summaryDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-border/70 bg-secondary/70 p-4">
              <p className="font-medium text-foreground">{t("summaryAvailable")}</p>
              <p className="mt-2">4 סלוטים פתוחים לשבוע הקרוב.</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/80 p-4">
              <p className="font-medium text-foreground">{t("summaryReserved")}</p>
              <p className="mt-2">2 התקנות כבר שוריינו מול לקוחות.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
