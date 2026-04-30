import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border/70 bg-card/85 p-4 shadow-sm backdrop-blur md:p-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="self-start lg:self-auto">{action}</div> : null}
    </div>
  );
}
