"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RoleBasedNavigation } from "@/components/dashboard/RoleBasedNavigation";
import { BreadcrumbNavigation } from "@/components/dashboard/BreadcrumbNavigation";
import { ErrorBoundary } from "@/components/dashboard/ErrorBoundary";
import { PageLoading } from "@/components/dashboard/LoadingStates";
import { ThemeProvider } from "@/components/dashboard/ThemeProvider";
import { X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/sign-in");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <PageLoading />;
  }

  if (!session) {
    return null;
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          {/* Mobile sidebar */}
          <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <h1 className="text-xl font-bold text-foreground">CEMSE</h1>
                </div>
                <div className="mt-5 px-2">
                  <RoleBasedNavigation 
                    role={session.user.role} 
                    institutionType={session.user.institutionType}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Desktop sidebar - Fixed position */}
            <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-40">
              <div className="flex flex-col w-64 h-full">
                <div className="flex flex-col h-full border-r border-border bg-card">
                  <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-4">
                      <h1 className="text-xl font-bold text-foreground">CEMSE</h1>
                    </div>
                    <div className="mt-5 flex-1 px-2">
                      <RoleBasedNavigation 
                        role={session.user.role} 
                        institutionType={session.user.institutionType}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex flex-col flex-1 min-w-0 lg:ml-64 min-h-screen">
              {/* Header - Full width */}
              <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

              {/* Page content */}
              <main className="flex-1 overflow-y-auto">
                <div className="py-6">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    {/* Breadcrumb Navigation */}
                    <div className="mb-6">
                      <BreadcrumbNavigation />
                    </div>
                    
                    {/* Page Content */}
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
