import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Column<T> = {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

type DataTableCardProps<T extends { id: string }> = {
  title: string;
  description: string;
  columns: Column<T>[];
  rows: T[];
  emptyText: string;
};

export function DataTableCard<T extends { id: string }>({
  title,
  description,
  columns,
  rows,
  emptyText
}: DataTableCardProps<T>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((column) => (
                  <th key={String(column.key)} className="px-3 py-3 font-medium text-muted-foreground">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/70 last:border-0">
                  {columns.map((column) => {
                    const rawValue = row[column.key];
                    const value = column.render ? column.render(rawValue, row) : String(rawValue);

                    return (
                      <td key={String(column.key)} className="px-3 py-4 align-top text-foreground">
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ children }: { children: React.ReactNode }) {
  return <Badge className="bg-primary/10 text-primary">{children}</Badge>;
}
