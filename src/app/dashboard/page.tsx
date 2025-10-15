"use client";

import { useSession } from "next-auth/react";
import { YouthDashboard } from "@/components/dashboard/YouthDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { InstitutionDashboard } from "@/components/dashboard/InstitutionDashboard";
import { CompanyDashboard } from "@/components/dashboard/CompanyDashboard";

export default function DashboardPage() {
  const { data: session } = useSession();

  // Render role-specific dashboard components
  const renderDashboard = () => {
    switch (session?.user?.role) {
      case "YOUTH":
        return <YouthDashboard />;
      case "COMPANIES":
        return <CompanyDashboard />;
      case "INSTITUTION":
        return <InstitutionDashboard />;
      case "SUPERADMIN":
        return <AdminDashboard />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Bienvenido a Emplea y Emprende
              </h2>
              <p className="text-muted-foreground">
                Configurando tu panel personalizado...
              </p>
            </div>
          </div>
        );
    }
  };

  return renderDashboard();
}

