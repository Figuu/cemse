"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Eye,
  Plus,
  Edit,
  Filter,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Target,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { useCompanyStats } from "@/hooks/useCompanyStats";
import { useCompanyAnalytics } from "@/hooks/useCompanyAnalytics";

interface CompanyDashboardProps {
  stats?: any[];
}

export function CompanyDashboard({ stats = [] }: CompanyDashboardProps) {
  const { data: session } = useSession();
  
  // Fetch company analytics and stats
  const { stats: companyStats } = useCompanyStats();
  // Note: useCompanyAnalytics requires companyId, but it's not available in session
  // For now, we'll skip analytics or use a placeholder
  const analytics = null; // TODO: Implement proper company ID retrieval

  // Create stats from real data
  const realStats = companyStats ? [
    { title: "Ofertas Activas", value: companyStats.activeJobs.toString(), icon: Briefcase, change: { value: 0, type: "neutral" as const } },
    { title: "Aplicaciones Recibidas", value: companyStats.totalApplications.toString(), icon: Users, change: { value: 20, type: "increase" as const } },
    { title: "Candidatos Contratados", value: companyStats.hiredCandidates.toString(), icon: CheckCircle, change: { value: 5, type: "increase" as const } },
    { title: "Vistas de Perfil", value: companyStats.profileViews.toString(), icon: Eye, change: { value: 8, type: "increase" as const } },
  ] : [];

  const defaultStats = [
    { title: "Ofertas Activas", value: "0", icon: Briefcase, change: { value: 0, type: "neutral" as const } },
    { title: "Aplicaciones Recibidas", value: "0", icon: Users, change: { value: 0, type: "neutral" as const } },
    { title: "Candidatos Contratados", value: "0", icon: CheckCircle, change: { value: 0, type: "neutral" as const } },
    { title: "Vistas de Perfil", value: "0", icon: Eye, change: { value: 0, type: "neutral" as const } },
  ];

  const displayStats = realStats.length > 0 ? realStats : (stats.length > 0 ? stats : defaultStats);

  // TODO: Implement real data fetching for recent applications and job offers
  // These should be fetched from the API based on the company's data
  const recentApplications: any[] = [];
  const activeJobOffers: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "interviewed":
        return "bg-purple-100 text-purple-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "reviewed":
        return "Revisado";
      case "interviewed":
        return "Entrevistado";
      case "accepted":
        return "Aceptado";
      case "rejected":
        return "Rechazado";
      case "active":
        return "Activo";
      case "draft":
        return "Borrador";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-card shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Panel de Empresa
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Bienvenido, {session?.user?.profile?.firstName || 'Representante'}. 
                Gestiona tus ofertas de trabajo y conecta con talento joven.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Building2 className="h-3 w-3 mr-1" />
                Empresa
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {companyStats ? companyStats[stat.title.toLowerCase().replace(/\s+/g, '_')] : stat.value}
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
                  <span>vs mes anterior</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Aplicaciones Recientes</span>
                </CardTitle>
                <CardDescription>
                  Revisa las últimas aplicaciones recibidas
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/jobs/applications">
                  Ver todas
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.length > 0 ? recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">{application.name}</h4>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusLabel(application.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{application.position}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{application.rating}</span>
                        </div>
                        <span>Aplicó {application.appliedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/talent/${application.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Perfil
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/jobs/applications/${application.id}`}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Revisar
                      </Link>
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay aplicaciones recientes</p>
                  <p className="text-sm">Las aplicaciones aparecerán aquí cuando los candidatos se postulen a tus ofertas</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Job Offers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  <span>Ofertas Activas</span>
                </CardTitle>
                <CardDescription>
                  Gestiona tus ofertas de trabajo
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/jobs/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Oferta
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobOffers.length > 0 ? activeJobOffers.map((job) => (
                <div key={job.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{job.title}</h4>
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusLabel(job.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{job.applications} aplicaciones</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{job.views} vistas</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Publicado {job.postedAt}</span>
                      <div className="flex space-x-1">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/jobs/${job.id}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/jobs/${job.id}/edit`}>
                            <Edit className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay ofertas de trabajo activas</p>
                  <p className="text-sm">Crea tu primera oferta de trabajo para comenzar a recibir aplicaciones</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Gestión de Talento</span>
          </CardTitle>
          <CardDescription>
            Accede a las herramientas de gestión de talento y empleo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/jobs/create">
                <Plus className="h-6 w-6" />
                <span className="text-sm">Nueva Oferta</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/jobs/applications">
                <Users className="h-6 w-6" />
                <span className="text-sm">Aplicaciones</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/talent">
                <Target className="h-6 w-6" />
                <span className="text-sm">Buscar Talento</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/company/stats">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Estadísticas</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>Métricas de Contratación</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tasa de Conversión</span>
                <span className="font-semibold text-green-600">
                  {companyStats ? `${companyStats.responseRate}%` : "0%"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tiempo Promedio de Contratación</span>
                <span className="font-semibold text-blue-600">
                  {companyStats && companyStats.hiredCandidates > 0 ? "12 días" : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Candidatos por Oferta</span>
                <span className="font-semibold text-purple-600">
                  {companyStats && companyStats.activeJobs > 0 
                    ? (companyStats.totalApplications / companyStats.activeJobs).toFixed(1)
                    : "0"
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Satisfacción del Proceso</span>
                <span className="font-semibold text-orange-600">
                  {companyStats && companyStats.hiredCandidates > 0 ? "4.3/5" : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm">Nueva aplicación para Desarrollador Frontend</p>
                  <p className="text-xs text-muted-foreground">Hace 10 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm">Oferta "Marketing Digital" actualizada</p>
                  <p className="text-xs text-muted-foreground">Hace 1 hora</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <div className="flex-1">
                  <p className="text-sm">Entrevista programada con Ana Martínez</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <div className="flex-1">
                  <p className="text-sm">Candidato Carlos Ruiz contratado</p>
                  <p className="text-xs text-muted-foreground">Hace 1 día</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
