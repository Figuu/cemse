"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
  MoreHorizontal,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { 
  useInstitutionReports, 
  useCreateInstitutionReport,
  REPORT_TYPE_LABELS,
  REPORT_STATUS_LABELS,
  getReportStatusColor,
  getReportTypeColor,
  ReportFilters
} from "@/hooks/useInstitutionAnalytics";
import { InstitutionReport } from "@/hooks/useInstitutionAnalytics";

interface ReportManagementProps {
  institutionId: string;
}

export function ReportManagement({ institutionId }: ReportManagementProps) {
  const [filters, setFilters] = useState<ReportFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReport, setNewReport] = useState({
    title: "",
    type: "STUDENT_ENROLLMENT" as const,
    isPublic: false,
  });

  const { data: reportsData, isLoading } = useInstitutionReports(institutionId, filters);
  const createReportMutation = useCreateInstitutionReport(institutionId);

  const reports = reportsData?.reports || [];

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setFilters(prev => ({
      ...prev,
      search,
      page: 1,
    }));
  };

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleCreateReport = async () => {
    if (!newReport.title.trim()) return;

    try {
      await createReportMutation.mutateAsync(newReport);
      setNewReport({ title: "", type: "STUDENT_ENROLLMENT", isPublic: false });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating report:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "GENERATING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "DRAFT":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Reportes</h2>
          <p className="text-muted-foreground">
            Crea y administra reportes de la institución
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Reporte
        </Button>
      </div>

      {/* Create Report Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Reporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Título del Reporte</label>
                <Input
                  placeholder="Ingresa el título del reporte"
                  value={newReport.title}
                  onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Reporte</label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={newReport.isPublic}
                onChange={(e) => setNewReport(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="isPublic" className="text-sm">
                Reporte público
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleCreateReport}
                disabled={!newReport.title.trim() || createReportMutation.isPending}
              >
                {createReportMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Reporte
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Buscar Reportes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <select
                value={filters.type || ""}
                onChange={(e) => handleFilterChange("type", e.target.value || undefined)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos los tipos</option>
                {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos los estados</option>
                {Object.entries(REPORT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ordenar por</label>
              <select
                value={filters.sortBy || "createdAt"}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="createdAt">Fecha de creación</option>
                <option value="title">Título</option>
                <option value="type">Tipo</option>
                <option value="status">Estado</option>
                <option value="generatedAt">Fecha de generación</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{report.title}</h4>
                          <Badge className={getReportTypeColor(report.type)}>
                            {REPORT_TYPE_LABELS[report.type]}
                          </Badge>
                          <Badge className={getReportStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1">{REPORT_STATUS_LABELS[report.status]}</span>
                          </Badge>
                          {report.isPublic && (
                            <Badge variant="outline">Público</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>
                              {report.author.firstName} {report.author.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(report.createdAt).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          {report.generatedAt && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                Generado: {new Date(report.generatedAt).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay reportes</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando reportes para analizar los datos de la institución
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Reporte
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Reportes</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Completados</p>
                  <p className="text-2xl font-bold">
                    {reports.filter(r => r.status === "COMPLETED").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Generando</p>
                  <p className="text-2xl font-bold">
                    {reports.filter(r => r.status === "GENERATING").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Borradores</p>
                  <p className="text-2xl font-bold">
                    {reports.filter(r => r.status === "DRAFT").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
