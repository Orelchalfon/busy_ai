import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-dashboard-glow px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row">
        <AppSidebar locale={locale} currentPath={`/${locale}/dashboard`} />
        <main className="flex-1 space-y-5">
          <Topbar />
          {children}
        </main>
      </div>
    </div>
  );
}
