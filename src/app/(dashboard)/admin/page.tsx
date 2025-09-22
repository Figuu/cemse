"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAdminStats } from "@/hooks/useAdminStats";
import { 
  Shield, 
  Users, 
  Building2, 
  GraduationCap, 
  TrendingUp, 
  Settings,
  Plus,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  BookOpen
} from "lucide-react";
import { useState } from "react";


function AdminPageContent() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "companies" | "institutions" | "system" | "analytics">("overview");
  const { stats, recentUsers, recentActivities, isLoading, error, refetch } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestiona el sistema y supervisa la actividad</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestiona el sistema y supervisa la actividad</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>Error al cargar los datos: {error}</p>
          </div>
          <Button onClick={refetch} className="mt-4">
            Reintentar
          </Button>
        </Card>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "YOUTH":
        return "bg-blue-100 text-blue-800";
      case "COMPANIES":
        return "bg-green-100 text-green-800";
      case "INSTITUTION":
        return "bg-purple-100 text-purple-800";
      case "SUPERADMIN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "YOUTH":
        return "Joven";
      case "COMPANIES":
        return "Empresa";
      case "INSTITUTION":
        return "Institución";
      case "SUPERADMIN":
        return "Administrador";
      default:
        return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "inactive":
        return "Inactivo";
      case "pending":
        return "Pendiente";
      default:
        return status;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "info":
        return "text-blue-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "info":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "error":
        return XCircle;
      default:
        return CheckCircle;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getHealthText = (health: string) => {
    switch (health) {
      case "excellent":
        return "Excelente";
      case "good":
        return "Bueno";
      case "warning":
        return "Advertencia";
      case "critical":
        return "Crítico";
      default:
        return health;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestiona usuarios, empresas, instituciones y configuración del sistema
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Acción
          </Button>
        </div>
      </div>

      {/* System Health Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className={`h-8 w-8 ${stats?.systemHealth ? getHealthColor(stats.systemHealth) : 'text-gray-400'}`} />
              <div>
                <h3 className="text-lg font-semibold">Estado del Sistema</h3>
                <p className={`text-sm ${stats?.systemHealth ? getHealthColor(stats.systemHealth) : 'text-gray-400'}`}>
                  {stats?.systemHealth ? getHealthText(stats.systemHealth) : 'Cargando...'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Última actualización</p>
              <p className="text-sm font-medium">{formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuarios Totales</p>
                <p className="text-2xl font-bold">{stats ? stats.totalUsers.toLocaleString() : '...'}</p>
                <p className="text-xs text-green-600">+12% este mes</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Empresas</p>
                <p className="text-2xl font-bold">{stats ? stats.totalCompanies : '...'}</p>
                <p className="text-xs text-green-600">+3 este mes</p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Instituciones</p>
                <p className="text-2xl font-bold">{stats ? stats.totalInstitutions : '...'}</p>
                <p className="text-xs text-green-600">+1 este mes</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cursos Activos</p>
                <p className="text-2xl font-bold">{stats ? stats.totalCourses : '...'}</p>
                <p className="text-xs text-green-600">+8 este mes</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Resumen", icon: BarChart3 },
            { id: "users", name: "Usuarios", icon: Users },
            { id: "companies", name: "Empresas", icon: Building2 },
            { id: "institutions", name: "Instituciones", icon: GraduationCap },
            { id: "system", name: "Sistema", icon: Settings },
            { id: "analytics", name: "Analíticas", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "overview" | "users" | "companies" | "institutions" | "system" | "analytics")}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimas actividades en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    const Icon = getSeverityIcon(activity.severity);
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <Icon className={`h-4 w-4 mt-1 ${getSeverityColor(activity.severity)}`} />
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estadísticas Rápidas</CardTitle>
                <CardDescription>
                  Métricas clave del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ofertas de Trabajo</span>
                    <span className="font-semibold">{stats ? stats.totalJobs : '...'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Usuarios Activos</span>
                    <span className="font-semibold">{stats ? stats.activeUsers : '...'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tasa de Actividad</span>
                    <span className="font-semibold text-green-600">
                      {stats ? stats.userActivityRate : '...'}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
            <Button asChild>
              <a href="/admin/users">
                <Plus className="h-4 w-4 mr-2" />
                Gestionar Usuarios
              </a>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestión Completa de Usuarios</h3>
              <p className="text-muted-foreground mb-4">
                Accede a la página dedicada para crear, editar y eliminar usuarios jóvenes del sistema.
              </p>
              <Button asChild>
                <a href="/admin/users">Ir a Gestión de Usuarios</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "companies" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestión de Empresas</h3>
            <Button asChild>
              <a href="/admin/companies">
                <Plus className="h-4 w-4 mr-2" />
                Gestionar Empresas
              </a>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestión Completa de Empresas</h3>
              <p className="text-muted-foreground mb-4">
                Accede a la página dedicada para crear, editar y eliminar empresas del sistema.
              </p>
              <Button asChild>
                <a href="/admin/companies">Ir a Gestión de Empresas</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "institutions" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestión de Instituciones</h3>
            <Button asChild>
              <a href="/admin/institutions">
                <Plus className="h-4 w-4 mr-2" />
                Gestionar Instituciones
              </a>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestión Completa de Instituciones</h3>
              <p className="text-muted-foreground mb-4">
                Accede a la página dedicada para crear, editar y eliminar instituciones del sistema.
              </p>
              <Button asChild>
                <a href="/admin/institutions">Ir a Gestión de Instituciones</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "system" && (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Configuración del Sistema</h3>
            <p className="text-muted-foreground">
              Configura parámetros del sistema, mantenimiento y monitoreo.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === "analytics" && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analíticas Avanzadas</h3>
            <p className="text-muted-foreground">
              Visualiza métricas detalladas y reportes del sistema.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN"]}>
      <AdminPageContent />
    </RoleGuard>
  );
}
