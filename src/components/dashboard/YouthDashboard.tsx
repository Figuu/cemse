"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Briefcase, 
  Lightbulb, 
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  Users,
  Target,
  Zap,
  Star,
  ArrowRight,
  PlayCircle,
  FileText,
  Globe,
  Heart,
  MessageCircle,
  Calendar,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useNews } from "@/hooks/useNews";
import { useResources } from "@/hooks/useResources";
import { useCourses } from "@/hooks/useCourses";
import { useJobs } from "@/hooks/useJobs";
import { useYouthStats } from "@/hooks/useYouthStats";

interface YouthDashboardProps {
  stats?: any[];
}

export function YouthDashboard({ stats = [] }: YouthDashboardProps) {
  const { data: session } = useSession();
  
  // Fetch data for different sections
  const { news: featuredNews } = useNews({ limit: 6 });
  const { resources: featuredResources } = useResources({ limit: 6 });
  const { courses: recommendedCourses } = useCourses({ limit: 4 });
  const { data: jobsData } = useJobs({ limit: 4 });
  const { stats: youthStats, isLoading: statsLoading } = useYouthStats();
  
  // Extract jobs from the response
  const featuredJobs = jobsData?.jobs || [];

  // Create stats from real data
  const realStats = youthStats ? [
    { title: "Cursos Completados", value: youthStats.completedCourses.toString(), icon: CheckCircle, change: { value: 15, type: "increase" as const } },
    { title: "Certificados", value: youthStats.totalCertificates.toString(), icon: Award, change: { value: 10, type: "increase" as const } },
    { title: "Aplicaciones Enviadas", value: youthStats.jobApplications.toString(), icon: Briefcase, change: { value: 25, type: "increase" as const } },
    { title: "Horas de Estudio", value: youthStats.studyHours.toString(), icon: Clock, description: "Total" },
  ] : [];

  const defaultStats = [
    { title: "Cursos Completados", value: "0", icon: CheckCircle, change: { value: 0, type: "neutral" as const } },
    { title: "Certificados", value: "0", icon: Award, change: { value: 0, type: "neutral" as const } },
    { title: "Aplicaciones Enviadas", value: "0", icon: Briefcase, change: { value: 0, type: "neutral" as const } },
    { title: "Horas de Estudio", value: "0", icon: Clock, description: "Total" },
  ];

  const displayStats = realStats.length > 0 ? realStats : (stats.length > 0 ? stats : defaultStats);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                ¡Hola, {session?.user?.profile?.firstName || 'Joven'}!
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Tu futuro profesional te espera. Elige tu camino hacia el éxito
              </p>
            </div>
            
            {/* Path Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
              {/* Employment Path */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
                <CardContent className="p-4 sm:p-6 md:p-8 text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">Empleo</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Encuentra oportunidades laborales, mejora tu CV y conecta con empresas
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button asChild size="sm" className="w-full h-10 sm:h-12">
                      <Link href="/jobs">
                        <Target className="h-4 w-4 mr-2" />
                        Buscar Empleos
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/profile">
                        <Users className="h-4 w-4 mr-2" />
                        Mejorar mi CV
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Entrepreneurship Path */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200">
                <CardContent className="p-4 sm:p-6 md:p-8 text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-900">Emprendimiento</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Desarrolla tu idea de negocio, conecta con mentores y accede a recursos
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button asChild size="sm" className="w-full h-10 sm:h-12">
                      <Link href="/entrepreneurship">
                        <Zap className="h-4 w-4 mr-2" />
                        Crear mi Startup
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/entrepreneurship/resources">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Recursos para Emprender
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Path */}
            <div className="max-w-2xl mx-auto px-4">
              <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 text-center">
                      <h4 className="font-semibold text-emerald-900 text-sm sm:text-base">
                        ¿Prefieres aprender primero?
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Desarrolla habilidades antes de tomar decisiones
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                      <Link href="/courses">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Explorar Cursos
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      {stat.title}
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    {stat.description && (
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    )}
                    {stat.change && (
                      <div className="flex items-center space-x-1 mt-1">
                        <TrendingUp className={`h-3 w-3 ${
                          stat.change.type === 'increase' ? 'text-green-500' : 
                          stat.change.type === 'decrease' ? 'text-red-500' : 'text-gray-500'
                        }`} />
                        <span className={`text-xs ${
                          stat.change.type === 'increase' ? 'text-green-600' : 
                          stat.change.type === 'decrease' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {stat.change.value > 0 ? '+' : ''}{stat.change.value}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* News Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center space-x-2">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              <span>Noticias y Actualizaciones</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Mantente informado con las últimas novedades
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/news">
              Ver todas las noticias
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Employment News */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span>Noticias de Empleo</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Oportunidades laborales y consejos profesionales
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {featuredNews?.filter(article => !article.isEntrepreneurshipRelated).slice(0, 6).map((article) => (
                <div key={article.id} className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex space-x-2 sm:space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {article.imageUrl ? (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        {article.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Destacado
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium line-clamp-2 text-xs sm:text-sm mb-2">
                        {article.title}
                      </h4>
                      <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.viewCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="hidden sm:inline">{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                          <span className="sm:hidden">{new Date(article.publishedAt || article.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Entrepreneurship News */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              <span>Noticias de Emprendimiento</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Innovación, startups y oportunidades de negocio
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {featuredNews?.filter(article => article.isEntrepreneurshipRelated).slice(0, 6).map((article) => (
                <div key={article.id} className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex space-x-2 sm:space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {article.imageUrl ? (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Lightbulb className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        {article.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Destacado
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium line-clamp-2 text-xs sm:text-sm mb-2">
                        {article.title}
                      </h4>
                      <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.viewCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="hidden sm:inline">{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                          <span className="sm:hidden">{new Date(article.publishedAt || article.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center space-x-2">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              <span>Recursos y Materiales</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Herramientas educativas y materiales de apoyo
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/resources">
              Ver todos los recursos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Employment Resources */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span>Recursos de Empleo</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Guías, plantillas y herramientas para tu búsqueda laboral
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {featuredResources?.filter(resource => !resource.isEntrepreneurshipRelated).slice(0, 8).map((resource) => (
                <div key={resource.id} className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {resource.category}
                        </Badge>
                      </div>
                      <h4 className="font-medium line-clamp-2 text-xs sm:text-sm">
                        {resource.title}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{resource.downloads}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{resource.rating}/5</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    <PlayCircle className="h-3 w-3 mr-2" />
                    Ver Recurso
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Entrepreneurship Resources */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              <span>Recursos de Emprendimiento</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Plantillas, guías y herramientas para crear tu startup
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {featuredResources?.filter(resource => resource.isEntrepreneurshipRelated).slice(0, 8).map((resource) => (
                <div key={resource.id} className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Lightbulb className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {resource.category}
                        </Badge>
                      </div>
                      <h4 className="font-medium line-clamp-2 text-xs sm:text-sm">
                        {resource.title}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{resource.downloads}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{resource.rating}/5</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    <PlayCircle className="h-3 w-3 mr-2" />
                    Ver Recurso
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
