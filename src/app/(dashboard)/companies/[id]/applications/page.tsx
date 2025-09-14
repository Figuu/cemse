"use client";

import { useParams } from "next/navigation";
import { ApplicationReviewDashboard } from "@/components/companies/ApplicationReviewDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Briefcase } from "lucide-react";
import Link from "next/link";

export default function CompanyApplicationsPage() {
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
          <h1 className="text-3xl font-bold">Gestión de Aplicaciones</h1>
          <p className="text-muted-foreground">
            Administra todas las aplicaciones de trabajo de tu empresa
          </p>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href={`/companies/${companyId}/jobs`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Mis Trabajos</h3>
                  <p className="text-sm text-muted-foreground">Gestionar ofertas de trabajo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/companies/${companyId}/employees`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Empleados</h3>
                  <p className="text-sm text-muted-foreground">Administrar equipo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/companies/${companyId}/analytics`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Ver métricas y reportes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Application Review Dashboard */}
      <ApplicationReviewDashboard companyId={companyId} />
    </div>
  );
}
