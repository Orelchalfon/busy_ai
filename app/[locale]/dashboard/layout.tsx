import type { ReactNode } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
  params
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <div className="min-h-dvh px-4 py-4 md:px-6 md:py-5 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row">
        <AppSidebar locale={locale} />
        <main className="flex-1 space-y-5">
          <Topbar />
          {children}
        </main>
      </div>
    </div>
  );
}
