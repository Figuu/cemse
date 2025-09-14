"use client";

import { useParams } from "next/navigation";
import { EmployeeManagementDashboard } from "@/components/companies/EmployeeManagementDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Briefcase, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function CompanyEmployeesPage() {
  const params = useParams();
  const companyId = params.id as string;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/companies/${companyId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Perfil
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
          <p className="text-muted-foreground">
            Administra tu equipo de trabajo
          </p>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href={`/companies/${companyId}/applications`}>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Ver Aplicaciones
          </Button>
        </Link>
        <Link href={`/companies/${companyId}/jobs`}>
          <Button variant="outline">
            <Briefcase className="h-4 w-4 mr-2" />
            Gestionar Trabajos
          </Button>
        </Link>
        <Link href={`/companies/${companyId}/analytics`}>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Analytics
          </Button>
        </Link>
      </div>

      {/* Employee Management Dashboard */}
      <EmployeeManagementDashboard companyId={companyId} />
    </div>
  );
}
