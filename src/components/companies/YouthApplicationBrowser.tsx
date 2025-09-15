"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Users, 
  Eye, 
  Heart,
  MessageSquare,
  Download,
  Star,
  Calendar,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  ExternalLink,
  Clock,
  CheckCircle,
  UserPlus
} from "lucide-react";
import { YouthApplicationChat } from "@/components/messaging/YouthApplicationChat";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface YouthApplication {
  id: string;
  title: string;
  description: string;
  status: "ACTIVE" | "PAUSED" | "CLOSED" | "HIRED";
  isPublic: boolean;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
  cvFile?: string;
  coverLetterFile?: string;
  cvUrl?: string;
  coverLetterUrl?: string;
  youth: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      city?: string;
      skills: any[];
      experience: any[];
      education?: string;
      phone?: string;
    };
  };
  companyInterests: any[];
  totalInterests: number;
  hasInterest: boolean;
}

interface YouthApplicationBrowserProps {
  companyId: string;
}

export function YouthApplicationBrowser({ companyId }: YouthApplicationBrowserProps) {
  const [applications, setApplications] = useState<YouthApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [educationFilter, setEducationFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedApplication, setSelectedApplication] = useState<YouthApplication | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Fetch applications
  useEffect(() => {
    fetchApplications();
  }, [companyId, educationFilter, cityFilter, sortBy, sortOrder]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(educationFilter !== "all" && { education: educationFilter }),
        ...(cityFilter !== "all" && { city: cityFilter }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/youth-applications?${params}`);
      const data = await response.json();
      
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const expressInterest = async (applicationId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/youth-applications/${applicationId}/interests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        await fetchApplications(); // Refresh the list
      }
    } catch (error) {
      console.error("Error expressing interest:", error);
    }
  };

  const updateInterest = async (applicationId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/youth-applications/${applicationId}/interests`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        await fetchApplications(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating interest:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800";
      case "PAUSED": return "bg-yellow-100 text-yellow-800";
      case "CLOSED": return "bg-gray-100 text-gray-800";
      case "HIRED": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE": return "Activo";
      case "PAUSED": return "Pausado";
      case "CLOSED": return "Cerrado";
      case "HIRED": return "Contratado";
      default: return status;
    }
  };

  const filteredApplications = applications.filter(app =>
    app.youth.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.youth.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ApplicationCard = ({ application }: { application: YouthApplication }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => setSelectedApplication(application)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={application.youth.profile.avatarUrl} />
              <AvatarFallback>
                {application.youth.profile.firstName?.[0]}
                {application.youth.profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-lg">{application.title}</h4>
              <p className="text-muted-foreground">
                {application.youth.profile.firstName} {application.youth.profile.lastName}
              </p>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                {application.youth.profile.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{application.youth.profile.city}</span>
                  </div>
                )}
                {application.youth.profile.education && (
                  <Badge variant="outline" className="text-xs">
                    {application.youth.profile.education}
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(application.createdAt), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(application.status)}>
              {getStatusLabel(application.status)}
            </Badge>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{application.viewsCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{application.totalInterests}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {application.description}
        </p>

        {/* Skills */}
        {application.youth.profile.skills && application.youth.profile.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {application.youth.profile.skills.slice(0, 4).map((skill: any, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {typeof skill === 'string' ? skill : skill.name || skill}
                </Badge>
              ))}
              {application.youth.profile.skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{application.youth.profile.skills.length - 4} más
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {application.cvFile || application.cvUrl && (
              <div className="flex items-center space-x-1">
                <Download className="h-4 w-4" />
                <span>CV disponible</span>
              </div>
            )}
            {application.youth.profile.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>Contacto</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {application.hasInterest ? (
              <Badge variant="default" className="text-xs">
                Interés Expresado
              </Badge>
            ) : (
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  expressInterest(application.id);
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Expresar Interés
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Aplicaciones de Jóvenes</h2>
          <p className="text-muted-foreground">
            Descubre talento joven disponible para oportunidades laborales
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avanzados
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{filteredApplications.length}</p>
                <p className="text-sm text-muted-foreground">Aplicaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredApplications.filter(app => app.status === "ACTIVE").length}
                </p>
                <p className="text-sm text-muted-foreground">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredApplications.filter(app => app.hasInterest).length}
                </p>
                <p className="text-sm text-muted-foreground">Con Interés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredApplications.filter(app => app.totalInterests > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Populares</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar aplicaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={educationFilter} onValueChange={setEducationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Nivel educativo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            <SelectItem value="HIGH_SCHOOL">Bachillerato</SelectItem>
            <SelectItem value="TECHNICAL">Técnico</SelectItem>
            <SelectItem value="UNIVERSITY">Universitario</SelectItem>
            <SelectItem value="GRADUATE">Postgrado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ciudad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ciudades</SelectItem>
            <SelectItem value="Cochabamba">Cochabamba</SelectItem>
            <SelectItem value="La Paz">La Paz</SelectItem>
            <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
            <SelectItem value="Sucre">Sucre</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Más recientes</SelectItem>
            <SelectItem value="viewsCount">Más vistos</SelectItem>
            <SelectItem value="applicationsCount">Más populares</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron aplicaciones</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || educationFilter !== "all" || cityFilter !== "all"
                ? "No hay aplicaciones que coincidan con los filtros aplicados"
                : "Aún no hay aplicaciones de jóvenes disponibles"
              }
            </p>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <YouthApplicationDetailModal 
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onExpressInterest={expressInterest}
          onUpdateInterest={updateInterest}
          onOpenChat={() => setShowChat(true)}
        />
      )}

      {/* Chat Modal */}
      {showChat && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chat de Aplicación</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowChat(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <YouthApplicationChat
                applicationId={selectedApplication.id}
                companyName="Empresa" // TODO: Get actual company name
                companyId={companyId}
                youthId={selectedApplication.youth.id}
                youthName={`${selectedApplication.youth.profile.firstName} ${selectedApplication.youth.profile.lastName}`}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Youth Application Detail Modal Component
function YouthApplicationDetailModal({ 
  application, 
  onClose, 
  onExpressInterest,
  onUpdateInterest,
  onOpenChat
}: { 
  application: YouthApplication;
  onClose: () => void;
  onExpressInterest: (id: string, notes?: string) => void;
  onUpdateInterest: (id: string, status: string, notes?: string) => void;
  onOpenChat: () => void;
}) {
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{application.title}</CardTitle>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Youth Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={application.youth.profile.avatarUrl} />
              <AvatarFallback>
                {application.youth.profile.firstName?.[0]}
                {application.youth.profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">
                {application.youth.profile.firstName} {application.youth.profile.lastName}
              </h3>
              <p className="text-muted-foreground">{application.youth.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge className={getStatusColor(application.status)}>
                  {getStatusLabel(application.status)}
                </Badge>
                {application.youth.profile.city && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{application.youth.profile.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">Descripción</h4>
            <div className="bg-muted p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{application.description}</p>
            </div>
          </div>

          {/* Skills */}
          {application.youth.profile.skills && application.youth.profile.skills.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Habilidades</h4>
              <div className="flex flex-wrap gap-2">
                {application.youth.profile.skills.map((skill: any, index) => (
                  <Badge key={index} variant="outline">
                    {typeof skill === 'string' ? skill : skill.name || skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {(application.cvFile || application.cvUrl || application.coverLetterFile || application.coverLetterUrl) && (
            <div>
              <h4 className="font-semibold mb-2">Documentos</h4>
              <div className="flex items-center space-x-4">
                {(application.cvFile || application.cvUrl) && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar CV
                  </Button>
                )}
                {(application.coverLetterFile || application.coverLetterUrl) && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Carta de Presentación
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {!application.hasInterest ? (
              <Button 
                onClick={() => onExpressInterest(application.id, notes)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Expresar Interés
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => onUpdateInterest(application.id, "CONTACTED", notes)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Marcar como Contactado
                </Button>
                <Button 
                  onClick={() => onUpdateInterest(application.id, "INTERVIEW_SCHEDULED", notes)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Programar Entrevista
                </Button>
                <Button 
                  onClick={() => onUpdateInterest(application.id, "HIRED", notes)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Contratar
                </Button>
              </>
            )}
            <Button 
              variant="outline"
              onClick={onOpenChat}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Enviar Mensaje
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE": return "bg-green-100 text-green-800";
    case "PAUSED": return "bg-yellow-100 text-yellow-800";
    case "CLOSED": return "bg-gray-100 text-gray-800";
    case "HIRED": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE": return "Activo";
    case "PAUSED": return "Pausado";
    case "CLOSED": return "Cerrado";
    case "HIRED": return "Contratado";
    default: return status;
  }
}
