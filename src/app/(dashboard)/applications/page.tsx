"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Clock, 
  MessageCircle,
  Eye,
  Filter,
  Search
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ApplicationStatusLabels, EmploymentTypeLabels, ExperienceLevelLabels } from "@/types/company";
import { useApplications } from "@/hooks/useApplications";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { 
    applications, 
    isLoading, 
    error, 
    refetch 
  } = useApplications({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm || undefined
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "offered": return "default";
      case "shortlisted": return "secondary";
      case "rejected": return "destructive";
      case "reviewing": return "outline";
      case "interview": return "outline";
      case "applied": return "outline";
      case "withdrawn": return "outline";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "applied": return "Aplicado";
      case "reviewing": return "En Revisión";
      case "shortlisted": return "Pre-seleccionado";
      case "interview": return "Entrevista";
      case "offered": return "Oferta";
      case "rejected": return "Rechazado";
      case "withdrawn": return "Retirado";
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            Mis Aplicaciones
          </h1>
          <p className="text-muted-foreground">
            Gestiona y da seguimiento a tus aplicaciones de trabajo
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por trabajo o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Todas
              </Button>
              <Button
                variant={statusFilter === "applied" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("applied")}
              >
                Aplicadas
              </Button>
              <Button
                variant={statusFilter === "reviewing" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("reviewing")}
              >
                En Revisión
              </Button>
              <Button
                variant={statusFilter === "shortlisted" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("shortlisted")}
              >
                Pre-seleccionadas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando aplicaciones...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error al cargar aplicaciones</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => refetch()}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay aplicaciones</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "No se encontraron aplicaciones con los filtros seleccionados"
                  : "Aún no has aplicado a ningún trabajo"
                }
              </p>
              <Link href="/jobs">
                <Button>
                  Buscar Trabajos
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{application.jobTitle}</h3>
                        <p className="text-muted-foreground">{application.company}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{application.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{application.jobType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Aplicaste hace {formatDistanceToNow(new Date(application.appliedDate), { addSuffix: true, locale: es })}</span>
                      </div>
                    </div>

                    {application.salary && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Salario: </span>
                        <span className="text-muted-foreground">
                          {application.salary.min.toLocaleString()} - {application.salary.max.toLocaleString()} {application.salary.currency}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <Badge variant={getStatusColor(application.status)}>
                      {getStatusLabel(application.status)}
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Link href={`/jobs/${application.jobId}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Trabajo
                        </Button>
                      </Link>
                      
                      {application.communication && application.communication.some(msg => !msg.isRead) && (
                        <Link href={`/jobs/${application.jobId}/chat`}>
                          <Button size="sm" className="relative">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {application.communication.filter(msg => !msg.isRead).length}
                            </span>
                          </Button>
                        </Link>
                      )}
                      
                      {(!application.communication || application.communication.every(msg => msg.isRead)) && (
                        <Link href={`/jobs/${application.jobId}/chat`}>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}