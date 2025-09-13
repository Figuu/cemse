"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Building2, 
  MapPin, 
  Users, 
  DollarSign,
  Calendar,
  Globe,
  Heart,
  MessageCircle,
  Eye,
  Share2,
  Edit,
  ArrowLeft,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  AlertCircle,
  CheckCircle,
  FileText
} from "lucide-react";
import { useStartups, Startup } from "@/hooks/useStartups";
import { useSession } from "next-auth/react";

export default function StartupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { getStartup } = useStartups();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const startupId = params.id as string;

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const data = await getStartup(startupId);
        if (data) {
          setStartup(data);
        } else {
          setError("Startup no encontrada");
        }
      } catch (err) {
        setError("Error al cargar la startup");
      } finally {
        setIsLoading(false);
      }
    };

    if (startupId) {
      fetchStartup();
    }
  }, [startupId, getStartup]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "IDEA":
        return "bg-blue-100 text-blue-800";
      case "STARTUP":
        return "bg-yellow-100 text-yellow-800";
      case "GROWING":
        return "bg-green-100 text-green-800";
      case "ESTABLISHED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStageText = (stage: string) => {
    switch (stage) {
      case "IDEA":
        return "Idea";
      case "STARTUP":
        return "Startup";
      case "GROWING":
        return "Creciendo";
      case "ESTABLISHED":
        return "Establecida";
      default:
        return stage;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount || amount === 0) return "Sin financiamiento";
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No especificada";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow functionality
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark functionality
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: startup?.name,
        text: startup?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  const isOwner = session?.user?.id === startup?.owner.id;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Startup no encontrada"}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{startup.name}</h1>
          <p className="text-muted-foreground">
            por {startup.owner.firstName} {startup.owner.lastName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Button variant="outline" onClick={() => router.push(`/startups/${startup.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={isBookmarked ? "text-red-500" : ""}
          >
            <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  {startup.logo ? (
                    <img src={startup.logo} alt={startup.name} className="w-20 h-20 rounded" />
                  ) : (
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStageColor(startup.businessStage)}>
                      {getStageText(startup.businessStage)}
                    </Badge>
                    <Badge variant="outline">{startup.category}</Badge>
                    {startup.subcategory && (
                      <Badge variant="secondary">{startup.subcategory}</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{startup.description}</p>
                  
                  {/* Key Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{startup.viewsCount}</div>
                      <div className="text-sm text-muted-foreground">Vistas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{startup.reviewsCount}</div>
                      <div className="text-sm text-muted-foreground">Reseñas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{startup.employees || "N/A"}</div>
                      <div className="text-sm text-muted-foreground">Empleados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {startup.rating ? `${startup.rating.toFixed(1)}★` : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="business">Negocio</TabsTrigger>
              <TabsTrigger value="team">Equipo</TabsTrigger>
              <TabsTrigger value="business-plan">Plan de Negocios</TabsTrigger>
              <TabsTrigger value="contact">Contacto</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Descripción Detallada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{startup.description}</p>
                </CardContent>
              </Card>

              {startup.businessModel && (
                <Card>
                  <CardHeader>
                    <CardTitle>Modelo de Negocio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{startup.businessModel}</p>
                  </CardContent>
                </Card>
              )}

              {startup.targetMarket && (
                <Card>
                  <CardHeader>
                    <CardTitle>Mercado Objetivo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{startup.targetMarket}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Información General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fundada:</span>
                      <span>{formatDate(startup.founded)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Etapa:</span>
                      <Badge className={getStageColor(startup.businessStage)}>
                        {getStageText(startup.businessStage)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Categoría:</span>
                      <span>{startup.category}</span>
                    </div>
                    {startup.subcategory && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subcategoría:</span>
                        <span>{startup.subcategory}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Información Financiera
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ingresos Anuales:</span>
                      <span>{formatCurrency(startup.annualRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Empleados:</span>
                      <span>{startup.employees || "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Fundador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      {startup.owner.avatarUrl ? (
                        <img 
                          src={startup.owner.avatarUrl} 
                          alt={startup.owner.firstName} 
                          className="w-10 h-10 rounded-full" 
                        />
                      ) : (
                        <Users className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {startup.owner.firstName} {startup.owner.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">Fundador</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business-plan" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Plan de Negocios
                  </CardTitle>
                  <CardDescription>
                    Gestiona y edita el plan de negocios de esta startup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {startup.businessPlan ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Resumen Ejecutivo</h4>
                          <p className="text-sm text-muted-foreground">
                            {startup.businessPlan.executiveSummary || "No disponible"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Análisis de Mercado</h4>
                          <p className="text-sm text-muted-foreground">
                            {startup.businessPlan.marketAnalysis || "No disponible"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => router.push(`/startups/business-plan?startupId=${startupId}`)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Editar Plan de Negocios
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/startups/business-plan?startupId=${startupId}&templateId=lean-startup`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Crear Nuevo Plan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No hay plan de negocios</h3>
                      <p className="text-muted-foreground mb-4">
                        Esta startup aún no tiene un plan de negocios creado
                      </p>
                      <Button
                        onClick={() => router.push(`/startups/business-plan?startupId=${startupId}`)}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Crear Plan de Negocios
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {startup.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={startup.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {startup.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  
                  {startup.email && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${startup.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {startup.email}
                      </a>
                    </div>
                  )}
                  
                  {startup.phone && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`tel:${startup.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {startup.phone}
                      </a>
                    </div>
                  )}
                  
                  {startup.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{startup.address}, {startup.municipality}</span>
                    </div>
                  )}

                  {/* Social Media */}
                  {startup.socialMedia && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Redes Sociales</h4>
                      <div className="flex gap-2">
                        {startup.socialMedia.facebook && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={startup.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                              <Facebook className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {startup.socialMedia.twitter && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={startup.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                              <Twitter className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {startup.socialMedia.linkedin && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={startup.socialMedia.linkedin} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {startup.socialMedia.instagram && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={startup.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                              <Instagram className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Actions and Info */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full" 
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
              >
                {isFollowing ? "Siguiendo" : "Seguir"}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              <Button variant="outline" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar
              </Button>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Rápida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{startup.municipality}, {startup.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Creada {formatDate(startup.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{startup.viewsCount} vistas</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
