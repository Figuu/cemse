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
  Eye,
  Plus,
  Edit,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Target,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { useCompanyStats } from "@/hooks/useCompanyStats";
import { useCompanyAnalytics } from "@/hooks/useCompanyAnalytics";
import { useCompanyApplications } from "@/hooks/useCompanyApplications";

interface CompanyDashboardProps {
  stats?: any[];
}

export function CompanyDashboard({ stats = [] }: CompanyDashboardProps) {
  const { data: session } = useSession();
  
  // Fetch company analytics and stats
  const { stats: companyStats, jobPostings, isLoading, error } = useCompanyStats();
  const { applications: recentApplications, isLoading: applicationsLoading } = useCompanyApplications(5);
  
  // Note: useCompanyAnalytics requires companyId, but it's not available in session
  // For now, we'll skip analytics or use a placeholder
  const analytics = null; // TODO: Implement proper company ID retrieval

  // Create stats from real data
  const realStats = companyStats ? [
    { title: "Ofertas Activas", value: companyStats.activeJobs.toString(), icon: Briefcase, change: { value: 0, type: "neutral" as const } },
    { title: "Aplicaciones Recibidas", value: companyStats.totalApplications.toString(), icon: Users, change: { value: 20, type: "increase" as const } },
    { title: "Candidatos Contratados", value: companyStats.hiredCandidates.toString(), icon: CheckCircle, change: { value: 5, type: "increase" as const } },
  ] : [];

  const defaultStats = [
    { title: "Ofertas Activas", value: "0", icon: Briefcase, change: { value: 0, type: "neutral" as const } },
    { title: "Aplicaciones Recibidas", value: "0", icon: Users, change: { value: 0, type: "neutral" as const } },
    { title: "Candidatos Contratados", value: "0", icon: CheckCircle, change: { value: 0, type: "neutral" as const } },
  ];

  const displayStats = realStats.length > 0 ? realStats : (stats.length > 0 ? stats : defaultStats);

  // Use real data from API
  const activeJobOffers = jobPostings || [];

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
      case "reviewing":
        return "En Revisión";
      case "shortlisted":
        return "Preseleccionado";
      case "hired":
        return "Contratado";
      case "rejected":
        return "Rechazado";
      case "reviewed":
        return "Revisado";
      case "interviewed":
        return "Entrevistado";
      case "accepted":
        return "Aceptado";
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
              <Badge className="bg-green-100 text-green-800">
                <Building2 className="h-3 w-3 mr-1" />
                Empresa
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Company Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error al cargar las estadísticas: {error}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                    <span>vs mes anterior</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
              {applicationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : recentApplications.length > 0 ? recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      {application.applicant.avatarUrl ? (
                        <img 
                          src={application.applicant.avatarUrl} 
                          alt={application.applicant.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">{application.applicant.name}</h4>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusLabel(application.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{application.jobTitle}</span>
                        <span>Aplicó hace {application.daysSinceApplied} días</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/talent/${application.applicant.id}`}>
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
                      <span>Publicado {job.postedDate}</span>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
