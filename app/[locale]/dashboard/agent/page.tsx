import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { ElevenLabsSalesAgentPanel } from "@/components/dashboard/elevenlabs-sales-agent-panel";
import { listSalesCalls } from "@/server/calls/store";
import {
  getElevenLabsAgentId,
  getElevenLabsConfigStatus,
  getElevenLabsPhoneConfig
} from "@/server/elevenlabs/client";

const statusLabels: Record<string, string> = {
  queued: "בתור",
  ringing: "מצלצל",
  "in-progress": "בשיחה",
  ended: "הסתיימה",
  failed: "נכשלה"
};

export default async function AgentPage() {
  const t = await getTranslations("agentPage");
  const calls = await listSalesCalls();
  const config = getElevenLabsConfigStatus();
  const isConfigured = config.hasApiKey;
  const agentId = getElevenLabsAgentId();
  const phoneConfig = getElevenLabsPhoneConfig();

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Badge className={isConfigured ? "border border-primary/20 bg-primary/10 text-primary" : "border border-border bg-secondary text-secondary-foreground"}>
            {isConfigured ? t("configured") : t("missingConfig")}
          </Badge>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <ElevenLabsSalesAgentPanel />

        <Card>
          <CardHeader>
            <CardTitle>{t("setupTitle")}</CardTitle>
            <CardDescription>{t("setupDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>ELEVENLABS_API_KEY: {config.hasApiKey ? "OK" : t("missingValue")}</p>
            <p>ELEVENLABS_PHONE_NUMBER_ID: {config.hasPhoneNumberId ? "OK" : t("missingValue")}</p>
            <div className="rounded-lg border border-border/70 bg-background/80 p-4">
              <p className="font-medium text-foreground">{t("agentIdTitle")}</p>
              <p className="mt-2 break-all" dir="ltr">
                {agentId}
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/80 p-4">
              <p className="font-medium text-foreground">{t("phoneTitle")}</p>
              <p className="mt-2 break-all" dir="ltr">
                {phoneConfig.phoneNumber}
              </p>
              <p className="mt-1 break-all" dir="ltr">
                {phoneConfig.phoneNumberId}
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/80 p-4">
              <p className="font-medium text-foreground">{t("tokenRouteTitle")}</p>
              <p className="mt-2 break-all" dir="ltr">
                /api/elevenlabs/conversation-token
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/80 p-4">
              <p className="font-medium text-foreground">{t("outboundRouteTitle")}</p>
              <p className="mt-2 break-all" dir="ltr">
                /api/elevenlabs/outbound-call
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t("historyTitle")}</CardTitle>
          <CardDescription>{t("historyDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <div className="space-y-3">
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="rounded-lg border border-border/70 bg-background/80 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium">{call.leadName}</p>
                      <p className="text-sm text-muted-foreground" dir="ltr">
                        {call.phone}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{call.interest}</p>
                    </div>
                    <Badge>{statusLabels[call.status] ?? call.status}</Badge>
                  </div>
                  {call.summary ? (
                    <p className="mt-3 text-sm text-muted-foreground">{call.summary}</p>
                  ) : null}
                  {call.transcript ? (
                    <details className="mt-3 text-sm text-muted-foreground">
                      <summary className="cursor-pointer font-medium text-foreground">
                        {t("transcript")}
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap">{call.transcript}</p>
                    </details>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
