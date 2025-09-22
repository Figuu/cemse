"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lightbulb, 
  FileText, 
  Calculator, 
  Users, 
  TrendingUp,
  Plus,
  Search,
  Filter,
  Globe,
  Star,
  Eye,
  Heart,
  Calendar,
  ArrowRight,
  PlayCircle,
  Download,
  Target,
  Zap,
  BookOpen,
  BarChart3,
  Building2
} from "lucide-react";
import { BusinessPlanBuilder } from "@/components/entrepreneurship/BusinessPlanBuilder";
import FinancialCalculator from "@/components/entrepreneurship/FinancialCalculator";
import BusinessModelCanvasModal from "@/components/entrepreneurship/BusinessModelCanvasModal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEntrepreneurshipNews, useLatestNews } from "@/hooks/useEntrepreneurshipNews";
import { useEntrepreneurshipResources, useFeaturedResources } from "@/hooks/useEntrepreneurshipResources";
import { useMyEntrepreneurships } from "@/hooks/useEntrepreneurships";
import { useBusinessPlans } from "@/hooks/useBusinessPlans";


export default function EntrepreneurshipPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showBusinessPlanBuilder, setShowBusinessPlanBuilder] = useState(false);
  const [showFinancialCalculator, setShowFinancialCalculator] = useState(false);
  const [showBusinessModelCanvas, setShowBusinessModelCanvas] = useState(false);
  const [selectedBusinessPlanId, setSelectedBusinessPlanId] = useState<string | undefined>();
  const router = useRouter();

  // Fetch data for the dashboard
  const { news: entrepreneurshipNews } = useLatestNews(6);
  const { resources: featuredResources } = useFeaturedResources();
  const { entrepreneurships: myEntrepreneurships } = useMyEntrepreneurships({ limit: 3 });
  const { data: businessPlansData } = useBusinessPlans({ limit: 10 });

  const handleCanvasSave = useCallback((canvasData: any) => {
    console.log("Business Model Canvas saved:", canvasData);
    setShowBusinessModelCanvas(false);
  }, []);

  const handleCanvasClose = useCallback(() => {
    setShowBusinessModelCanvas(false);
  }, []);

  // Memoize the business plan to prevent unnecessary re-renders
  const currentBusinessPlan = useMemo(() => {
    return businessPlansData?.businessPlans?.[0];
  }, [businessPlansData?.businessPlans?.[0]?.id]);


  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20 rounded-2xl p-6 sm:p-8 md:p-12">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="relative">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Centro de Emprendimiento
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                Transforma tus ideas en negocios exitosos. Accede a herramientas, recursos y una comunidad de emprendedores
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200 dark:hover:border-purple-800 cursor-pointer" onClick={() => {
          // Check if user already has a business plan
          if (businessPlansData?.businessPlans && businessPlansData.businessPlans.length > 0) {
            // Load the first (most recent) business plan
            setSelectedBusinessPlanId(businessPlansData.businessPlans[0].id);
          } else {
            // Create a new business plan
            setSelectedBusinessPlanId(undefined);
          }
          setShowBusinessPlanBuilder(true);
        }}>
          <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-purple-900 dark:text-purple-100">Plan de Negocio</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {businessPlansData?.businessPlans && businessPlansData.businessPlans.length > 0 
                  ? 'Continúa editando tu plan de negocio' 
                  : 'Crea y gestiona tu plan de negocio paso a paso'
                }
              </p>
            </div>
            <Button size="sm" className="w-full h-8 sm:h-10">
              <Plus className="h-4 w-4 mr-2" />
              {businessPlansData?.businessPlans && businessPlansData.businessPlans.length > 0 ? 'Editar Plan' : 'Crear Plan'}
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer" onClick={() => setShowFinancialCalculator(true)}>
          <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-100">Calculadora Financiera</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Calcula métricas financieras y proyecciones
              </p>
            </div>
            <Button size="sm" className="w-full h-8 sm:h-10">
              <Calculator className="h-4 w-4 mr-2" />
              Abrir Calculadora
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 dark:hover:border-green-800 cursor-pointer" onClick={() => router.push('/entrepreneurship/network')}>
          <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-green-900 dark:text-green-100">Red de Emprendedores</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Conecta con otros emprendedores y mentores
              </p>
            </div>
            <Button size="sm" className="w-full h-8 sm:h-10">
              <Users className="h-4 w-4 mr-2" />
              Explorar Red
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-200 dark:hover:border-orange-800 cursor-pointer" onClick={() => setShowBusinessModelCanvas(true)}>
          <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-orange-900 dark:text-orange-100">Business Model Canvas</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Diseña tu modelo de negocio visualmente
              </p>
            </div>
            <Button size="sm" className="w-full h-8 sm:h-10">
              <Target className="h-4 w-4 mr-2" />
              Crear Canvas
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="news">Noticias</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="projects">Mis Proyectos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Latest News */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-purple-600" />
                      <span>Últimas Noticias</span>
                    </CardTitle>
                    <CardDescription>
                      Mantente actualizado con las últimas novedades del ecosistema emprendedor
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/entrepreneurship/news">
                      Ver todas
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {entrepreneurshipNews?.slice(0, 3).map((article) => (
                  <div key={article.id} className="flex space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {article.imageUrl ? (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                      </div>
                      <h4 className="font-medium line-clamp-2 text-sm">
                        {article.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Featured Resources */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span>Recursos Destacados</span>
                    </CardTitle>
                    <CardDescription>
                      Herramientas y materiales para impulsar tu emprendimiento
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/entrepreneurship/resources">
                      Ver todos
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredResources?.slice(0, 3).map((resource) => (
                  <div key={resource.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {resource.category}
                        </Badge>
                      </div>
                      <h4 className="font-medium line-clamp-1 text-sm">
                        {resource.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{resource.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{resource.likes}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* My Projects */}
          {myEntrepreneurships && myEntrepreneurships.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-green-600" />
                      <span>Mis Proyectos</span>
                    </CardTitle>
                    <CardDescription>
                      Gestiona tus emprendimientos activos
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/entrepreneurship/my-projects">
                      Ver todos
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myEntrepreneurships.map((project) => (
                    <div key={project.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {project.logo ? (
                            <img 
                              src={project.logo} 
                              alt={project.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{project.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{project.category}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Etapa:</span>
                          <Badge variant="secondary" className="text-xs">
                            {project.businessStage}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Vistas:</span>
                          <span>{project.viewsCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Plans Section */}
          {businessPlansData?.businessPlans && businessPlansData.businessPlans.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span>Mis Planes de Negocio</span>
                    </CardTitle>
                    <CardDescription>
                      Gestiona y edita tus planes de negocio existentes
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedBusinessPlanId(undefined);
                      setShowBusinessPlanBuilder(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nuevo Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {businessPlansData.businessPlans.map((plan: any) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{plan.title || 'Plan de Negocio'}</h4>
                          <Badge variant={plan.status === 'draft' ? 'secondary' : 'default'}>
                            {plan.status === 'draft' ? 'Borrador' : 'Completado'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Progreso: {plan.completionPercentage}%</span>
                          <span>Actualizado: {new Date(plan.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedBusinessPlanId(plan.id);
                            setShowBusinessPlanBuilder(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Noticias de Emprendimiento</h2>
              <p className="text-muted-foreground">
                Mantente informado sobre las últimas tendencias y oportunidades
              </p>
            </div>
            <Button asChild>
              <Link href="/entrepreneurship/news">
                <Plus className="h-4 w-4 mr-2" />
                Ver todas las noticias
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entrepreneurshipNews?.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                    {article.imageUrl ? (
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Globe className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{article.likes}</span>
                        </div>
                      </div>
                      <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Recursos para Emprendedores</h2>
              <p className="text-muted-foreground">
                Herramientas, plantillas y guías para desarrollar tu negocio
              </p>
            </div>
            <Button asChild>
              <Link href="/entrepreneurship/resources">
                <Plus className="h-4 w-4 mr-2" />
                Ver todos los recursos
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources?.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="h-32 bg-muted rounded-t-lg flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {resource.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                    <h3 className="font-semibold line-clamp-2">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{resource.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{resource.likes}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Mis Proyectos</h2>
              <p className="text-muted-foreground">
                Gestiona y desarrolla tus emprendimientos
              </p>
            </div>
          </div>

          {myEntrepreneurships && myEntrepreneurships.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEntrepreneurships.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {project.logo ? (
                        <img 
                          src={project.logo} 
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{project.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{project.category}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Etapa:</span>
                      <Badge variant="secondary">
                        {project.businessStage}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Vistas:</span>
                      <span className="text-sm font-medium">{project.viewsCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estado:</span>
                      <Badge variant={project.isActive ? "default" : "secondary"}>
                        {project.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/entrepreneurship/${project.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/entrepreneurship/${project.id}/edit`}>
                        <FileText className="h-4 w-4 mr-1" />
                        Editar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tienes proyectos aún</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza creando tu primer emprendimiento para acceder a todas las herramientas
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>

      {/* Business Plan Builder Modal */}
      {showBusinessPlanBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Constructor de Plan de Negocio</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBusinessPlanBuilder(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <BusinessPlanBuilder
                businessPlanId={selectedBusinessPlanId}
                onSave={(plan) => {
                  console.log("Business plan saved:", plan);
                  setShowBusinessPlanBuilder(false);
                  setSelectedBusinessPlanId(undefined);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Calculator Modal */}
      {showFinancialCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Calculadora Financiera</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFinancialCalculator(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <FinancialCalculator
                financialData={{
                  initialInvestment: 0,
                  monthlyOperatingCosts: 0,
                  revenueProjection: 0,
                  breakEvenPoint: 0,
                  estimatedROI: 0,
                }}
                onUpdate={(data) => {
                  console.log("Financial data updated:", data);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Business Model Canvas Modal */}
      <BusinessModelCanvasModal
        businessPlan={currentBusinessPlan}
        onSave={handleCanvasSave}
        onClose={handleCanvasClose}
        isOpen={showBusinessModelCanvas}
      />
    </div>
  );
}