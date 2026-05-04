import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProducts } from "@/server/db/data";

export default async function ProductsPage() {
  const t = await getTranslations("productsPage");
  const products = await getProducts();

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={<Button>{t("primaryAction")}</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="h-36 border-b border-border/60 bg-gradient-to-br from-primary/15 via-accent to-secondary/80" />
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.price}</CardDescription>
                </div>
                <Badge>{product.tag}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("stockLabel", { count: product.stock })}
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  {t("cardPrimary")}
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  {t("cardSecondary")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
