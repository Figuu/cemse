"use client";

import { useSession } from "next-auth/react";
import { YouthApplicationBrowser } from "@/components/companies/YouthApplicationBrowser";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Briefcase, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useCompanyByUser } from "@/hooks/useCompanies";

export default function TalentPage() {
  const { data: session } = useSession();
  const { data: company, isLoading: companyLoading } = useCompanyByUser(session?.user?.id || "");

  // Show loading state while fetching company data
  if (companyLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p>Cargando información de la empresa...</p>
        </div>
      </div>
    );
  }

  // Show error if no company found
  if (!company) {
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

  if (session?.user?.role !== "COMPANIES") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
          <p className="text-muted-foreground">
            Solo las empresas pueden acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Trabajos
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Descubre Talento</h1>
          <p className="text-muted-foreground">
            Explora aplicaciones de jóvenes talentosos y encuentra el candidato perfecto
          </p>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/candidates">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Todos los Candidatos
          </Button>
        </Link>
        <Link href="/jobs">
          <Button variant="outline">
            <Briefcase className="h-4 w-4 mr-2" />
            Mis Ofertas de Trabajo
          </Button>
        </Link>
        <Link href="/analytics">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics de Contratación
          </Button>
        </Link>
      </div>

      {/* Youth Application Browser */}
      <YouthApplicationBrowser companyId={company.id} />
    </div>
  );
}
