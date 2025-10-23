"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  X, 
  Eye, 
  Calendar, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Users, 
  Building, 
  Briefcase,
  Newspaper,
  FileText,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Clock
} from "lucide-react";

interface CompanyDetailsModalProps {
  company: {
    id: string;
    name: string;
    description?: string;
    businessSector?: string;
    companySize?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
    foundedYear?: number;
    logoUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  onClose: () => void;
}

interface JobOffer {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  salary?: number;
  requirements: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  applicationsCount: number;
  viewsCount: number;
}

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  imageUrl?: string;
  publishedAt?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  timeAgo: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  downloads: number;
  rating: number;
  thumbnail: string;
}

interface Employee {
  id: string;
  position?: string;
  hiredAt: string;
  status: string;
  employee: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export function CompanyDetailsModal({ company, onClose }: CompanyDetailsModalProps) {
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/companies/${company.id}/details`);
        if (response.ok) {
          const data = await response.json();
          setCompanyDetails(data.company);
          setJobs(data.jobs || []);
          setNews(data.news || []);
          setResources(data.resources || []);
          setEmployees(data.employees || []);
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [company.id]);

  const getCompanySizeLabel = (size: string) => {
    switch (size) {
      case "STARTUP": return "Startup";
      case "SMALL": return "Pequeña (1-50)";
      case "MEDIUM": return "Mediana (51-200)";
      case "LARGE": return "Grande (201-1000)";
      case "ENTERPRISE": return "Empresa (1000+)";
      default: return size;
    }
  };

  const getCompanySizeColor = (size: string) => {
    switch (size) {
      case "STARTUP": return "bg-purple-100 text-purple-800";
      case "SMALL": return "bg-green-100 text-green-800";
      case "MEDIUM": return "bg-blue-100 text-blue-800";
      case "LARGE": return "bg-orange-100 text-orange-800";
      case "ENTERPRISE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Hoy";
    if (diffInDays === 1) return "Ayer";
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
    return `Hace ${Math.floor(diffInDays / 365)} años`;
  };

  const translateResourceType = (type: string) => {
    const translations: { [key: string]: string } = {
      "guide": "Guía",
      "template": "Plantilla",
      "document": "Documento",
      "video": "Video",
      "presentation": "Presentación",
      "worksheet": "Hoja de Trabajo",
      "checklist": "Lista de Verificación",
      "manual": "Manual",
      "handbook": "Manual",
      "tutorial": "Tutorial",
      "course": "Curso",
      "webinar": "Seminario Web",
      "ebook": "Libro Electrónico",
      "pdf": "PDF",
      "image": "Imagen",
      "audio": "Audio",
      "software": "Software",
      "tool": "Herramienta",
      "resource": "Recurso",
      "material": "Material",
      "other": "Otro",
      // Tipos específicos encontrados en la base de datos
      "GUIDE": "Guía",
      "TEMPLATE": "Plantilla",
      "COURSE": "Curso"
    };
    
    return translations[type] || translations[type.toLowerCase()] || type;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando información de la empresa...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={company.logoUrl} />
                <AvatarFallback>
                  <Building className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{company.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  {company.businessSector && (
                    <Badge variant="outline">{company.businessSector}</Badge>
                  )}
                  {company.companySize && (
                    <Badge className={getCompanySizeColor(company.companySize)}>
                      {getCompanySizeLabel(company.companySize)}
                    </Badge>
                  )}
                  <Badge variant={company.isActive ? "default" : "secondary"}>
                    {company.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {company.description && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Descripción</h4>
                    <p className="text-sm mt-1">{company.description}</p>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company.address}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span>Visitar sitio web</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {company.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company.phone}</span>
                  </div>
                )}
                {company.foundedYear && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Fundada en {company.foundedYear}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Estadísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
                <div className="text-sm text-muted-foreground">Trabajos Activos</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{employees.length}</div>
                <div className="text-sm text-muted-foreground">Empleados</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{news.length}</div>
                <div className="text-sm text-muted-foreground">Noticias</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{resources.length}</div>
                <div className="text-sm text-muted-foreground">Recursos</div>
              </div>
            </div>
            
          </div>

          {/* Recent Jobs */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Trabajos Disponibles</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-2">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{job.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span>{job.jobType}</span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>${job.salary.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{job.applicationsCount} aplicaciones</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{job.isActive ? "Activo" : "Inactivo"}</Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Navigate to job details page
                            window.open(`/jobs/${job.id}`, '_blank');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center py-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Navigate to jobs page with company filter
                      window.open(`/jobs?company=${company.id}`, '_blank');
                    }}
                  >
                    Ver Todos los Trabajos
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay trabajos disponibles</p>
              </div>
            )}
          </div>

          {/* Recent News */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Noticias Recientes</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : news.length > 0 ? (
              <div className="space-y-2">
                {news.slice(0, 3).map((article) => (
                  <div key={article.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      {article.imageUrl && (
                        <img 
                          src={article.imageUrl} 
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{article.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{article.timeAgo}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{article.viewCount} vistas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{article.likeCount} likes</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{article.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center py-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Navigate to news page with company filter
                      window.open(`/news?company=${company.id}`, '_blank');
                    }}
                  >
                    Ver Todas las Noticias
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay noticias disponibles</p>
              </div>
            )}
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Recursos Disponibles</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.slice(0, 4).map((resource) => (
                  <div key={resource.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{resource.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{resource.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{translateResourceType(resource.type)}</span>
                          <span>•</span>
                          <span>{resource.downloads} descargas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center py-4 col-span-full">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Navigate to resources page with company filter
                      window.open(`/resources?company=${company.id}`, '_blank');
                    }}
                  >
                    Ver Todos los Recursos
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay recursos disponibles</p>
              </div>
            )}
          </div>

          {/* Employees */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Equipo</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : employees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.slice(0, 6).map((employee) => (
                  <div key={employee.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.employee.avatarUrl} />
                        <AvatarFallback>
                          <Users className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {employee.employee.firstName} {employee.employee.lastName}
                        </h4>
                        {employee.position && (
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={employee.status === "ACTIVE" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {employee.status === "ACTIVE" ? "Activo" : "Inactivo"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Desde {formatDate(employee.hiredAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center py-4 col-span-full">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Navigate to team/employees page with company filter
                      window.open(`/team?company=${company.id}`, '_blank');
                    }}
                  >
                    Ver Todo el Equipo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay información del equipo disponible</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}