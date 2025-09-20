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
import { JobApplicationChat } from "@/components/jobs/JobApplicationChat";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

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

  const handleOpenChat = (application: any) => {
    setSelectedApplication(application);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedApplication(null);
  };

  return (
    <div className={`flex min-h-screen bg-gray-50 ${showChat ? 'mr-96' : ''}`}>
      <div className="flex-1 transition-all duration-300">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Mis Aplicaciones
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestiona y da seguimiento a tus aplicaciones de trabajo
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por trabajo o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className="text-xs sm:text-sm"
              >
                Todas
              </Button>
              <Button
                variant={statusFilter === "applied" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("applied")}
                className="text-xs sm:text-sm"
              >
                Aplicadas
              </Button>
              <Button
                variant={statusFilter === "reviewing" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("reviewing")}
                className="text-xs sm:text-sm"
              >
                En Revisión
              </Button>
              <Button
                variant={statusFilter === "shortlisted" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("shortlisted")}
                className="text-xs sm:text-sm"
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
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-muted-foreground">Cargando aplicaciones...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Error al cargar aplicaciones</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => refetch()} size="sm">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No hay aplicaciones</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "No se encontraron aplicaciones con los filtros seleccionados"
                  : "Aún no has aplicado a ningún trabajo"
                }
              </p>
              <Link href="/jobs">
                <Button size="sm">
                  Buscar Trabajos
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{application.jobTitle}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground truncate">{application.company}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{application.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{application.jobType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground sm:col-span-2 lg:col-span-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">Hace {formatDistanceToNow(new Date(application.appliedDate), { addSuffix: true, locale: es })}</span>
                      </div>
                    </div>

                    {application.salary && (
                      <div className="mt-3 text-xs sm:text-sm">
                        <span className="font-medium">Salario: </span>
                        <span className="text-muted-foreground">
                          {application.salary.min.toLocaleString()} - {application.salary.max.toLocaleString()} {application.salary.currency}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <div className="flex justify-between items-center lg:justify-end">
                      <Badge variant={getStatusColor(application.status)} className="text-xs sm:text-sm">
                        {getStatusLabel(application.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 w-full lg:w-auto">
                      <Link href={`/applications/${application.id}`} className="w-full">
                        <Button variant="default" size="sm" className="w-full text-xs sm:text-sm">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Ver Aplicación
                        </Button>
                      </Link>
                      
                      <Link href={`/jobs/${application.jobId}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Ver Trabajo
                        </Button>
                      </Link>
                      
                      {application.communication && application.communication.some(msg => !msg.isRead) && (
                        <Button 
                          size="sm" 
                          className="relative w-full text-xs sm:text-sm"
                          onClick={() => handleOpenChat(application)}
                        >
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Chat
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                            {application.communication.filter(msg => !msg.isRead).length}
                          </span>
                        </Button>
                      )}
                      
                      {(!application.communication || application.communication.every(msg => msg.isRead)) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenChat(application)}
                          className="w-full text-xs sm:text-sm"
                        >
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Chat
                        </Button>
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
      </div>

      {/* Chat Sidebar */}
      {showChat && selectedApplication && (
        <JobApplicationChat
          jobId={selectedApplication.jobId}
          applicationId={selectedApplication.id}
          applicant={{
            id: selectedApplication.companyOwnerId || "company-1",
            firstName: selectedApplication.company,
            lastName: "",
            avatarUrl: "/placeholder-company.png",
            email: "company@example.com"
          }}
          application={{
            id: selectedApplication.id,
            status: selectedApplication.status,
            appliedAt: selectedApplication.appliedDate,
            coverLetter: selectedApplication.coverLetter,
            cvFile: selectedApplication.cvFile,
            cvUrl: selectedApplication.cvUrl,
            coverLetterFile: selectedApplication.coverLetterFile,
            coverLetterUrl: selectedApplication.coverLetterUrl
          }}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
}