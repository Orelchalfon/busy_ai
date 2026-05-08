import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { NewAgentForm } from "./new-agent-form";
import { ConnectionsPlaceholder } from "../connections-placeholder";

export default async function NewAgentPage() {
  const t = await getTranslations("agents.new");

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(280px,360px)]">
        <NewAgentForm />
        <ConnectionsPlaceholder />
      </div>
    </div>
  );
}
