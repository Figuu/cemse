"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Users, 
  Star, 
  Globe, 
  Phone, 
  Mail,
  Briefcase,
  Heart,
  Share2,
  Edit,
  Eye,
  MessageCircle,
  Award
} from "lucide-react";
import { useCompany } from "@/hooks/useCompanies";
import { CompanySizeLabels, EmploymentTypeLabels, ExperienceLevelLabels } from "@/types/company";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export default function CompanyProfilePage() {
  const params = useParams();
  const companyId = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");

  const { data: company, isLoading, error } = useCompany(companyId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="h-8 w-32 bg-muted rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 bg-muted rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-muted rounded w-48"></div>
                      <div className="h-4 bg-muted rounded w-32"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-4 bg-muted rounded w-28"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Empresa no encontrada</h3>
          <p className="text-muted-foreground mb-4">
            La empresa que buscas no existe o ha sido eliminada
          </p>
          <Link href="/companies">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Empresas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = false; // This would come from auth context in real app
  const isFollowing = false; // This would come from a hook in real app
  const isLiked = false; // This would come from a hook in real app

  const handleFollow = () => {
    // Implement follow functionality
  };

  const handleLike = () => {
    // Implement like functionality
  };

  const handleShare = () => {
    // Implement share functionality
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/companies">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <p className="text-muted-foreground">
            {company.industry} • {company.location}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Link href={`/companies/${company.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={handleLike}>
            <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            {company.followers}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={`Logo de ${company.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{company.name}</h2>
                    {company.isVerified && (
                      <Badge variant="default" className="text-xs">
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {company.industry} • {company.location}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {company.totalEmployees || "N/A"} empleados
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {company.totalJobs} trabajos
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {company.averageRating?.toFixed(1) || "N/A"} rating
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {company.views} vistas
                    </span>
                  </div>
                </div>
              </div>

              {company.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Sobre la Empresa</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {company.description}
                  </p>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {company.totalJobs}
                  </div>
                  <div className="text-sm text-muted-foreground">Trabajos</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {company.totalApplications}
                  </div>
                  <div className="text-sm text-muted-foreground">Aplicaciones</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {company.followers}
                  </div>
                  <div className="text-sm text-muted-foreground">Seguidores</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {company.averageRating?.toFixed(1) || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="jobs">Trabajos</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                <TabsTrigger value="culture">Cultura</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-6">
                <div className="space-y-6">
                  {/* Mission & Vision */}
                  {(company.mission || company.vision) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {company.mission && (
                        <div>
                          <h4 className="font-semibold mb-2">Misión</h4>
                          <p className="text-muted-foreground">{company.mission}</p>
                        </div>
                      )}
                      {company.vision && (
                        <div>
                          <h4 className="font-semibold mb-2">Visión</h4>
                          <p className="text-muted-foreground">{company.vision}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Technologies */}
                  {company.technologies.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Tecnologías</h4>
                      <div className="flex flex-wrap gap-2">
                        {company.technologies.map((tech) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {company.benefits.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Beneficios</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {company.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="jobs" className="p-6">
                <div className="space-y-4">
                  {company.jobs && company.jobs.length > 0 ? (
                    company.jobs.map((job) => (
                      <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{job.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {job.location} • {EmploymentTypeLabels[job.employmentType] || job.employmentType} • {ExperienceLevelLabels[job.experienceLevel] || job.experienceLevel}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{job.totalApplications} aplicaciones</span>
                                <span>{job.totalViews} vistas</span>
                                <span>
                                  {formatDistanceToNow(new Date(job.createdAt), { 
                                    addSuffix: true, 
                                    locale: es 
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {job.isUrgent && (
                                <Badge variant="destructive" className="text-xs">
                                  Urgente
                                </Badge>
                              )}
                              <Button variant="outline" size="sm">
                                Ver Trabajo
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No hay trabajos disponibles</h3>
                      <p className="text-muted-foreground">
                        Esta empresa no tiene trabajos publicados actualmente
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="p-6">
                <div className="space-y-4">
                  {company.reviews && company.reviews.length > 0 ? (
                    company.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold">
                                {review.author.profile?.firstName?.charAt(0) || "U"}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm">
                                  {review.isAnonymous ? "Anónimo" : 
                                   `${review.author.profile?.firstName || ""} ${review.author.profile?.lastName || ""}`.trim() || "Usuario"}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "text-yellow-400 fill-current"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <h5 className="font-medium text-sm mb-2">{review.title}</h5>
                              <p className="text-sm text-muted-foreground mb-3">
                                {review.content}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                  {formatDistanceToNow(new Date(review.createdAt), { 
                                    addSuffix: true, 
                                    locale: es 
                                  })}
                                </span>
                                <span>{review.helpfulVotes} útiles</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No hay reseñas</h3>
                      <p className="text-muted-foreground">
                        Esta empresa no tiene reseñas aún
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="culture" className="p-6">
                <div className="space-y-6">
                  {company.culture && (
                    <div>
                      <h4 className="font-semibold mb-3">Cultura de la Empresa</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {company.culture}
                      </p>
                    </div>
                  )}

                  {company.values.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Valores</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {company.values.map((value, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                            <Award className="h-4 w-4 text-primary" />
                            <span className="text-sm">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Arrangements */}
                  <div>
                    <h4 className="font-semibold mb-3">Modalidades de Trabajo</h4>
                    <div className="flex flex-wrap gap-2">
                      {company.officeWork && (
                        <Badge variant="outline">Oficina</Badge>
                      )}
                      {company.remoteWork && (
                        <Badge variant="outline">Remoto</Badge>
                      )}
                      {company.hybridWork && (
                        <Badge variant="outline">Híbrido</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{company.phone}</span>
                </div>
              )}
              {company.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{company.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{company.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tamaño</span>
                <span className="text-sm font-medium">
                  {company.size ? CompanySizeLabels[company.size] : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fundada</span>
                <span className="text-sm font-medium">
                  {company.foundedYear || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Empleados</span>
                <span className="text-sm font-medium">
                  {company.totalEmployees || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Trabajos</span>
                <span className="text-sm font-medium">{company.totalJobs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {company.averageRating?.toFixed(1) || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button
                  className="w-full"
                  variant={isFollowing ? "default" : "outline"}
                  onClick={handleFollow}
                >
                  {isFollowing ? "Siguiendo" : "Seguir Empresa"}
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
