import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const t = await getTranslations("settingsPage");

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={<Button variant="outline">{t("primaryAction")}</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("businessTitle")}</CardTitle>
            <CardDescription>{t("businessDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>LeadPilot Furniture</p>
            <p>תעשייה: ריהוט והתקנות</p>
            <p>טלפון: 03-5551234</p>
            <p>WhatsApp: 050-1234567</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("automationTitle")}</CardTitle>
            <CardDescription>{t("automationDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t("automationItemOne")}</p>
            <p>{t("automationItemTwo")}</p>
            <p>{t("automationItemThree")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
