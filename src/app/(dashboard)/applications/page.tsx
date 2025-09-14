"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { 
  Search, 
  Eye, 
  MessageCircle, 
  Calendar,
  MapPin,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Star,
  TrendingUp,
  Briefcase
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useApplications } from "@/hooks/useApplications";
import { ApplicationTimeline } from "@/components/jobs/ApplicationTimeline";
import { ApplicationAnalytics } from "@/components/jobs/ApplicationAnalytics";


const statusConfig = {
  applied: { label: "Aplicado", color: "bg-blue-100 text-blue-800", icon: FileText },
  reviewing: { label: "En Revisión", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  shortlisted: { label: "Preseleccionado", color: "bg-purple-100 text-purple-800", icon: Star },
  interview: { label: "Entrevista", color: "bg-orange-100 text-orange-800", icon: Calendar },
  offered: { label: "Oferta", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rechazado", color: "bg-red-100 text-red-800", icon: XCircle },
  withdrawn: { label: "Retirado", color: "bg-gray-100 text-gray-800", icon: AlertCircle }
};

const priorityConfig = {
  low: { label: "Baja", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Media", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "Alta", color: "bg-red-100 text-red-800" }
};

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("appliedDate");
  const [activeTab, setActiveTab] = useState("all");

  const { 
    applications, 
    isLoading, 
    error, 
    refetch 
  } = useApplications({
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    search: searchTerm || undefined,
  });

  const filteredApplications = applications.filter(app => {
    const matchesTab = activeTab === "all" || 
                      (activeTab === "active" && !["rejected", "withdrawn", "offered"].includes(app.status)) ||
                      (activeTab === "offers" && app.status === "offered") ||
                      (activeTab === "rejected" && app.status === "rejected");

    return matchesTab;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case "appliedDate":
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      case "company":
        return a.company.localeCompare(b.company);
      case "status":
        return a.status.localeCompare(b.status);
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      default:
        return 0;
    }
  });

  const getStatusStats = () => {
    const stats = {
      total: applications.length,
      active: applications.filter(app => !["rejected", "withdrawn", "offered"].includes(app.status)).length,
      offers: applications.filter(app => app.status === "offered").length,
      rejected: applications.filter(app => app.status === "rejected").length
    };
    return stats;
  };

  const stats = getStatusStats();

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["YOUTH"]}>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard allowedRoles={["YOUTH"]}>
        <div className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error al cargar aplicaciones</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refetch}>Reintentar</Button>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["YOUTH"]}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Aplicaciones</h1>
          <p className="text-muted-foreground">
            Rastrea el estado de tus aplicaciones de trabajo
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activas</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ofertas</p>
                <p className="text-2xl font-bold">{stats.offers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rechazadas</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título o empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="applied">Aplicado</SelectItem>
                  <SelectItem value="reviewing">En Revisión</SelectItem>
                  <SelectItem value="shortlisted">Preseleccionado</SelectItem>
                  <SelectItem value="interview">Entrevista</SelectItem>
                  <SelectItem value="offered">Oferta</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appliedDate">Fecha de aplicación</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                  <SelectItem value="status">Estado</SelectItem>
                  <SelectItem value="priority">Prioridad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todas ({stats.total})</TabsTrigger>
          <TabsTrigger value="active">Activas ({stats.active})</TabsTrigger>
          <TabsTrigger value="offers">Ofertas ({stats.offers})</TabsTrigger>
          <TabsTrigger value="rejected">Rechazadas ({stats.rejected})</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <ApplicationAnalytics applications={applications.map(app => ({
            id: app.id,
            status: app.status,
            appliedDate: app.appliedDate,
            daysSinceApplied: app.daysSinceApplied || 0,
            responseTime: app.responseTime,
            priority: app.priority,
            company: app.company
          }))} />
        </TabsContent>

        <TabsContent value={activeTab} className="space-y-4">
          {activeTab !== "analytics" && (
            <>
              {sortedApplications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay aplicaciones</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                        ? "No se encontraron aplicaciones con los filtros seleccionados"
                        : "Aún no has aplicado a ningún trabajo. ¡Comienza a buscar oportunidades!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedApplications.map((application) => {
                    const StatusIcon = statusConfig[application.status].icon;
                    
                    return (
                      <Card key={application.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-gray-600" />
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="text-lg font-semibold truncate">
                                      {application.jobTitle}
                                    </h3>
                                    <Badge className={statusConfig[application.status].color}>
                                      <StatusIcon className="h-3 w-3 mr-1" />
                                      {statusConfig[application.status].label}
                                    </Badge>
                                    <Badge variant="outline" className={priorityConfig[application.priority].color}>
                                      {priorityConfig[application.priority].label}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                    <div className="flex items-center">
                                      <Building2 className="h-4 w-4 mr-1" />
                                      {application.company}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {application.location}
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      Aplicado {formatDate(application.appliedDate)}
                                    </div>
                                    {(application.daysSinceApplied || 0) > 0 && (
                                      <div className="flex items-center">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                          {application.daysSinceApplied || 0} días
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                                    <span>{application.jobType}</span>
                                    {application.remote && <span>• Remoto</span>}
                                    {application.salary && (
                                      <span>• {application.salary.min.toLocaleString()} - {application.salary.max.toLocaleString()} {application.salary.currency}</span>
                                    )}
                                    <span>• {application.experience}</span>
                                  </div>

                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {application.skills.slice(0, 4).map((skill) => (
                                      <Badge key={skill} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {application.skills.length > 4 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{application.skills.length - 4}
                                      </Badge>
                                    )}
                                  </div>

                                  {application.notes && (
                                    <p className="text-sm text-muted-foreground mb-3">
                                      <strong>Notas:</strong> {application.notes}
                                    </p>
                                  )}

                                  {application.nextSteps && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                      <p className="text-sm text-blue-800">
                                        <strong>Próximos pasos:</strong> {application.nextSteps}
                                      </p>
                                    </div>
                                  )}

                                  {application.interviewDate && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                                      <p className="text-sm text-orange-800">
                                        <strong>Entrevista programada:</strong> {formatDateTime(application.interviewDate)}
                                      </p>
                                    </div>
                                  )}

                                  {application.rejectionReason && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                      <p className="text-sm text-red-800">
                                        <strong>Motivo del rechazo:</strong> {application.rejectionReason}
                                      </p>
                                    </div>
                                  )}

                                  {application.offerDetails && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                      <p className="text-sm text-green-800">
                                        <strong>Oferta:</strong> {application.offerDetails.salary.toLocaleString()} {application.salary?.currency} • 
                                        Inicio: {formatDate(application.offerDetails.startDate)}
                                      </p>
                                    </div>
                                  )}

                                  {/* Application Timeline Preview */}
                                  {application.timeline && application.timeline.length > 0 && (
                                    <div className="mt-3">
                                      <ApplicationTimeline 
                                        timeline={application.timeline.slice(0, 2)} 
                                        className="border-0 shadow-none"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2 ml-4">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalles
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contactar
                              </Button>
                              {application.status === "offered" && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  Responder Oferta
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </RoleGuard>
  );
}