"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  Building2,
  TrendingUp,
  TrendingDown,
  Shield,
  Settings,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useAdminStats } from "@/hooks/useAdminStats";

interface AdminDashboardProps {
  stats?: any[];
}

export function AdminDashboard({ stats = [] }: AdminDashboardProps) {
  const { data: session } = useSession();
  
  // Fetch admin statistics
  const { stats: adminStats, isLoading, error } = useAdminStats();

  // Create stats from real data
  const realStats = adminStats ? [
    { title: "Usuarios Totales", value: adminStats.totalUsers.toString(), icon: Users, change: { value: Math.round(adminStats.userActivityRate), type: "increase" as const } },
    { title: "Cursos Activos", value: adminStats.totalCourses.toString(), icon: GraduationCap, change: { value: 15, type: "increase" as const } },
    { title: "Ofertas de Trabajo", value: adminStats.totalJobs.toString(), icon: Briefcase, change: { value: 10, type: "increase" as const } },
    { title: "Instituciones", value: adminStats.totalInstitutions.toString(), icon: Building2, change: { value: 2, type: "increase" as const } },
  ] : [];

  const defaultStats = [
    { title: "Usuarios Totales", value: "0", icon: Users, change: { value: 0, type: "neutral" as const } },
    { title: "Cursos Activos", value: "0", icon: GraduationCap, change: { value: 0, type: "neutral" as const } },
    { title: "Ofertas de Trabajo", value: "0", icon: Briefcase, change: { value: 0, type: "neutral" as const } },
    { title: "Instituciones", value: "0", icon: Building2, change: { value: 0, type: "neutral" as const } },
  ];

  const displayStats = realStats.length > 0 ? realStats : (stats.length > 0 ? stats : defaultStats);



  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-card shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Panel de Administración
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Bienvenido, {session?.user?.profile?.firstName || 'Administrador'}. 
                Supervisa y gestiona toda la plataforma Emplea y Emprende.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <Shield className="h-3 w-3 mr-1" />
                Super Administrador
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading ? (
          // Loading state
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          // Error state
          <div className="col-span-full">
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <p className="text-red-700 dark:text-red-300">
                    Error al cargar estadísticas: {error}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Normal state
          displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {stat.change.type === 'increase' ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : stat.change.type === 'decrease' ? (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    ) : (
                      <TrendingUp className="h-3 w-3 text-gray-500" />
                    )}
                    <span className={stat.change.type === 'increase' ? 'text-green-600' : 
                                    stat.change.type === 'decrease' ? 'text-red-600' : 'text-gray-600'}>
                      {stat.change.value > 0 ? '+' : ''}{stat.change.value}%
                    </span>
                    <span className="hidden sm:inline">vs mes anterior</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Platform Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Estadísticas de la Plataforma</span>
            </CardTitle>
            <CardDescription>
              Métricas importantes del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminStats ? (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Usuarios Activos (30 días)</span>
                  <span className="font-semibold text-green-600">{adminStats.activeUsers}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Tasa de Actividad</span>
                  <span className="font-semibold text-blue-600">{adminStats.userActivityRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Ofertas de Trabajo</span>
                  <span className="font-semibold text-purple-600">{adminStats.totalJobs}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Cursos Disponibles</span>
                  <span className="font-semibold text-orange-600">{adminStats.totalCourses}</span>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Cargando estadísticas...
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-green-600" />
              <span>Gestión del Sistema</span>
            </CardTitle>
            <CardDescription>
              Herramientas de administración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/users">
                <Users className="h-4 w-4 mr-2" />
                Gestión de Usuarios
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/institutions">
                <Building2 className="h-4 w-4 mr-2" />
                Gestión de Instituciones
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/companies">
                <Briefcase className="h-4 w-4 mr-2" />
                Gestión de Empresas
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/courses">
                <GraduationCap className="h-4 w-4 mr-2" />
                Gestión de Cursos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
