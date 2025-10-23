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
          {/* Mobile sidebar overlay */}
          <div className={`fixed inset-0 z-50 xl:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div 
              className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            
            {/* Sidebar container - slides from top */}
            <div 
              className={`fixed top-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-gray-900 shadow-2xl border-b border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-y-0' : '-translate-y-full'}`}
            >
              {/* Header section */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Emplea y Emprende</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Plataforma de Empleabilidad</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {/* User info section */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                      {session?.user?.profile?.firstName?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {session?.user?.profile?.firstName || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Scrollable Navigation content */}
              <div className="max-h-[calc(85vh-140px)] overflow-y-auto">
                <div className="p-4">
                  <RoleBasedNavigation 
                    role={session.user.role} 
                    institutionType={session.user.institutionType}
                    onItemClick={() => setSidebarOpen(false)}
                    className="space-y-1"
                  />
                </div>
              </div>
              
              {/* Footer section */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  © 2024 Emplea y Emprende Platform
                </div>
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Desktop sidebar - Fixed position */}
            <div className="hidden xl:block xl:fixed xl:inset-y-0 xl:left-0 xl:z-40">
              <div className="flex flex-col w-64 h-full">
                <div className="flex flex-col h-full border-r border-border bg-card">
                  <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-4">
                      <h1 className="text-xl font-bold text-foreground">Emplea y Emprende</h1>
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
            <div className="flex flex-col flex-1 min-w-0 xl:ml-64 min-h-screen">
              {/* Header - Full width */}
              <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

              {/* Page content */}
              <main className="flex-1 overflow-y-auto">
                <div className="py-6">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    {/* Breadcrumb Navigation */}
                    <div className="mb-6 overflow-hidden">
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
