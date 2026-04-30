import { getTranslations } from "next-intl/server";
import { DataTableCard, StatusBadge } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { calls } from "@/lib/mock-data";

export default async function CallsPage() {
  const t = await getTranslations("callsPage");

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={<Button variant="outline">{t("primaryAction")}</Button>}
      />

      <DataTableCard
        title={t("tableTitle")}
        description={t("tableDescription")}
        emptyText={t("empty")}
        rows={calls}
        columns={[
          { key: "leadName", label: t("columns.leadName") },
          { key: "status", label: t("columns.status"), render: (value) => <StatusBadge>{String(value)}</StatusBadge> },
          { key: "summary", label: t("columns.summary") },
          { key: "createdAt", label: t("columns.createdAt") }
        ]}
      />
    </div>
  );
}
