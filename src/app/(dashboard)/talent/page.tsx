"use client";

import { useSession } from "next-auth/react";
import { YouthApplicationBrowser } from "@/components/companies/YouthApplicationBrowser";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useCompanyByUser } from "@/hooks/useCompanies";
import { RoleGuard } from "@/components/auth/RoleGuard";

function TalentPageContent() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "SUPERADMIN";
  const isCompany = session?.user?.role === "COMPANIES";
  
  const { data: company, isLoading: companyLoading } = useCompanyByUser(session?.user?.id || "");

  // Show loading state while fetching company data (only for companies)
  if (isCompany && companyLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p>Cargando información de la empresa...</p>
        </div>
      </div>
    );
  }

  // Show error if no company found (only for companies)
  if (isCompany && !company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Empresa no encontrada</h3>
          <p className="text-muted-foreground">
            No se pudo encontrar la información de tu empresa. Por favor, contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
        <Link href="/jobs">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Trabajos
          </Button>
        </Link>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {isAdmin ? "Gestión de Candidatos" : "Descubre Talento"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {isAdmin 
              ? "Gestiona todas las aplicaciones y candidatos del sistema"
              : "Explora aplicaciones de jóvenes talentosos y encuentra el candidato perfecto"
            }
          </p>
        </div>
      </div>

      {/* Quick Navigation */}
      {isCompany && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Link href="/analytics" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Analytics de Contratación</span>
              <span className="sm:hidden">Analytics</span>
            </Button>
          </Link>
        </div>
      )}

      {/* Youth Application Browser */}
      <YouthApplicationBrowser companyId={isAdmin ? undefined : company?.id} />
    </div>
  );
}

export default function TalentPage() {
  return (
    <RoleGuard allowedRoles={["COMPANIES", "SUPERADMIN"]}>
      <TalentPageContent />
    </RoleGuard>
  );
}
