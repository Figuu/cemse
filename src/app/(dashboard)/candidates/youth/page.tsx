"use client";

import { YouthApplicationBrowser } from "@/components/companies/YouthApplicationBrowser";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Briefcase, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function YouthCandidatesPage() {
  // In a real app, this would come from auth context
  const companyId = "company-1"; // Mock company ID

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/candidates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Candidatos
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Candidatos Jóvenes</h1>
          <p className="text-muted-foreground">
            Descubre talento joven disponible para oportunidades laborales
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
      <YouthApplicationBrowser companyId={companyId} />
    </div>
  );
}
