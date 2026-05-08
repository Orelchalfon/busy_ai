import { getTranslations } from "next-intl/server";
import { Bot, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { listAgents } from "@/server/agents/store";
import { getCurrentBusinessId } from "@/server/auth/session";
import { getVapiConfigStatus } from "@/server/vapi/client";

export default async function AgentsListPage() {
  const t = await getTranslations("agents");
  const businessId = await getCurrentBusinessId();
  const agents = businessId ? await listAgents(businessId) : [];
  const vapi = getVapiConfigStatus();
  const vapiConfigured =
    vapi.hasApiKey && vapi.hasAssistantId && vapi.hasPhoneNumberId && vapi.hasAppBaseUrl;

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("listTitle")}
        description={t("listDescription")}
        action={
          <Link href="/dashboard/agents/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("newAgentCta")}
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>{t("vapiStatusTitle")}</CardTitle>
            <CardDescription>{t("vapiStatusDescription")}</CardDescription>
          </div>
          <Badge
            className={
              vapiConfigured
                ? "border border-primary/20 bg-primary/10 text-primary"
                : "border border-border bg-secondary text-secondary-foreground"
            }
          >
            {vapiConfigured ? t("vapiConfigured") : t("vapiMissing")}
          </Badge>
        </CardHeader>
      </Card>

      {agents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Bot className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-base font-medium">{t("emptyTitle")}</p>
            <p className="max-w-md text-sm text-muted-foreground">{t("emptyDescription")}</p>
            <Link href="/dashboard/agents/new" className="mt-2">
              <Button className="gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("newAgentCta")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/dashboard/agents/${agent.id}`}
              className="block focus-visible:outline-none"
            >
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
                      {agent.name}
                    </CardTitle>
                    <Badge
                      className={
                        agent.isActive
                          ? "border border-primary/20 bg-primary/10 text-primary"
                          : "border border-border bg-secondary text-secondary-foreground"
                      }
                    >
                      {agent.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {agent.persona || t("noPersona")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {agent.servicesText || t("noServices")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
