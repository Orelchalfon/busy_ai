import { getTranslations } from "next-intl/server";
import { Calendar, Facebook, Mail, MessageCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CONNECTOR_DEFS = [
  { key: "whatsapp", icon: MessageCircle },
  { key: "meta", icon: Facebook },
  { key: "gmail", icon: Mail },
  { key: "googleCalendar", icon: Calendar }
] as const;

export async function ConnectionsPlaceholder() {
  const t = await getTranslations("agents.connections");

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {CONNECTOR_DEFS.map(({ key, icon: Icon }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 opacity-70"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">
                {t(`connectors.${key}`)}
              </span>
            </div>
            <Badge className="border border-border bg-background text-xs text-muted-foreground">
              {t("comingSoon")}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
