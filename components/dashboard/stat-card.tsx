import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  change: string;
};

export function StatCard({ label, value, change }: StatCardProps) {
  return (
    <Card className="transition-colors hover:border-primary/25">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm leading-6 text-muted-foreground">{label}</p>
          <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {change}
          </span>
        </div>
        <p className="text-3xl font-semibold text-foreground tabular-nums">{value}</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
