import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { DataTableCard, StatusBadge } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { getLeads } from "@/server/db/data";

export default async function LeadsPage() {
  await connection();

  const t = await getTranslations("leadsPage");
  const leads = await getLeads();

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={<Button>{t("primaryAction")}</Button>}
      />

      <DataTableCard
        title={t("tableTitle")}
        description={t("tableDescription")}
        emptyText={t("empty")}
        rows={leads}
        columns={[
          { key: "name", label: t("columns.name") },
          { key: "phone", label: t("columns.phone") },
          { key: "source", label: t("columns.source") },
          { key: "status", label: t("columns.status"), render: (value) => <StatusBadge>{String(value)}</StatusBadge> },
          { key: "value", label: t("columns.value") }
        ]}
      />
    </div>
  );
}
