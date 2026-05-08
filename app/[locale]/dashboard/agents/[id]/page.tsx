import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Bot } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { VapiSalesAgentPanel } from "@/components/dashboard/vapi-sales-agent-panel";
import { ConnectionsPlaceholder } from "../connections-placeholder";
import { getAgent } from "@/server/agents/store";
import { getCurrentBusinessId } from "@/server/auth/session";

type Props = { params: Promise<{ id: string; locale: string }> };

export default async function AgentDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("agents.detail");

  const businessId = await getCurrentBusinessId();
  if (!businessId) notFound();

  const agent = await getAgent(id, businessId);
  if (!agent) notFound();

  return (
    <div className="space-y-5">
      <PageHeader
        title={agent.name}
        description={agent.persona}
        action={
          <Badge
            className={
              agent.isActive
                ? "border border-primary/20 bg-primary/10 text-primary"
                : "border border-border bg-secondary text-secondary-foreground"
            }
          >
            {agent.isActive ? t("active") : t("inactive")}
          </Badge>
        }
      />

      <section className="grid gap-5 lg:grid-cols-[1fr_minmax(280px,360px)]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
                {t("servicesTitle")}
              </CardTitle>
              <CardDescription>{t("servicesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {agent.servicesText || t("emptyServices")}
              </p>
            </CardContent>
          </Card>

          <VapiSalesAgentPanel agentId={agent.id} />
        </div>

        <ConnectionsPlaceholder />
      </section>
    </div>
  );
}
