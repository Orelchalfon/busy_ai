import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBusinessSettings } from "@/server/db/data";

export default async function SettingsPage() {
  await connection();

  const t = await getTranslations("settingsPage");
  const settings = await getBusinessSettings();

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
            <p>{settings.business.name}</p>
            <p>תעשייה: {settings.business.industry}</p>
            <p>טלפון: {settings.business.phone}</p>
            <p>WhatsApp: {settings.business.whatsapp}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("automationTitle")}</CardTitle>
            <CardDescription>{t("automationDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {settings.automationItems.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
