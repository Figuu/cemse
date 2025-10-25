"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  UserPlus,
  X,
  Send,
  Grid3X3,
  List
} from "lucide-react";
import { MessageInterface } from "@/components/messaging/MessageInterface";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { getEducationLevelLabel } from "@/lib/translations";

interface YouthApplication {
  id: string;
  title: string;
  description: string;
  status: "ACTIVE" | "PAUSED" | "CLOSED" | "HIRED";
  isPublic: boolean;
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
  interestStatus?: "INTERESTED" | "CONTACTED" | "INTERVIEW_SCHEDULED" | "HIRED" | "NOT_INTERESTED";
  interestId?: string;
}

interface YouthApplicationBrowserProps {
  companyId?: string;
}

export function YouthApplicationBrowser({ companyId }: YouthApplicationBrowserProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "SUPERADMIN";
  
  const [applications, setApplications] = useState<YouthApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [educationFilter, setEducationFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedApplication, setSelectedApplication] = useState<YouthApplication | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [activeChat, setActiveChat] = useState<{ applicationId: string; youthId: string; youthName: string } | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  const startChat = (application: YouthApplication) => {
    setActiveChat({
      applicationId: application.id,
      youthId: application.youth.id,
      youthName: `${application.youth?.profile?.firstName || ''} ${application.youth?.profile?.lastName || ''}`.trim()
    });
    setShowChat(true);
  };

  const updateInterest = async (applicationId: string, interestId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/youth-applications/${applicationId}/interests/${interestId}`, {
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

  const filteredApplications = applications.filter(app => {
    // Filter out applications without youth data
    if (!app.youth?.profile) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      return app.youth?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             app.youth?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             app.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             app.description?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true; // If no search term, include all apps
  });

  const ApplicationCard = ({ application }: { application: YouthApplication }) => {
    // Skip rendering if youth data is missing
    if (!application.youth?.profile) return null;
    
    return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${
      viewMode === "grid" ? "h-full flex flex-col" : ""
    }`} 
          onClick={() => setSelectedApplication(application)}>
      <CardContent className={`p-4 sm:p-6 ${viewMode === "grid" ? "flex flex-col flex-1" : ""}`}>
        {/* Header with Avatar and Status */}
        <div className={`flex items-start justify-between gap-3 mb-4 ${
          viewMode === "list" ? "sm:flex-row sm:items-start" : ""
        }`}>
          <div className={`flex items-center space-x-3 flex-1 min-w-0 ${
            viewMode === "list" ? "sm:space-x-4" : ""
          }`}>
            <Avatar className={`flex-shrink-0 ${
              viewMode === "list" ? "h-12 w-12 sm:h-16 sm:w-16" : "h-10 w-10 sm:h-12 sm:w-12"
            }`}>
              <AvatarImage src={application.youth?.profile?.avatarUrl} />
              <AvatarFallback>
                {application.youth?.profile?.firstName?.[0]}
                {application.youth?.profile?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold truncate ${
                viewMode === "list" ? "text-base sm:text-lg" : "text-sm sm:text-base lg:text-lg"
              }`}>{application.title}</h4>
              <p className={`text-muted-foreground truncate ${
                viewMode === "list" ? "text-sm sm:text-base" : "text-xs sm:text-sm"
              }`}>
                {application.youth?.profile?.firstName} {application.youth?.profile?.lastName}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(application.status)} text-xs flex-shrink-0 ${
            viewMode === "list" ? "sm:text-sm" : ""
          }`}>
            {getStatusLabel(application.status)}
          </Badge>
        </div>

        {/* Location and Education */}
        <div className={`flex gap-2 mb-3 text-xs text-muted-foreground ${
          viewMode === "list" ? "flex-row sm:items-center sm:gap-4" : "flex-col"
        }`}>
          {application.youth?.profile?.city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{application.youth?.profile.city}</span>
            </div>
          )}
          {application.youth?.profile?.education && (
            <Badge variant="outline" className="text-xs w-fit">
              {getEducationLevelLabel(application.youth?.profile.education)}
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

        {/* Description */}
        <p className={`text-muted-foreground mb-3 ${
          viewMode === "list" 
            ? "text-sm sm:text-base line-clamp-3" 
            : "text-xs sm:text-sm line-clamp-2 flex-1"
        }`}>
          {application.description}
        </p>

        {/* Skills */}
        {application.youth?.profile.skills && application.youth?.profile.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {application.youth?.profile.skills.slice(0, viewMode === "list" ? 6 : 3).map((skill: any, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                  {typeof skill === 'string' ? skill : skill.name || skill}
                </Badge>
              ))}
              {application.youth?.profile.skills.length > (viewMode === "list" ? 6 : 3) && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{application.youth?.profile.skills.length - (viewMode === "list" ? 6 : 3)}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className={`pt-3 border-t ${viewMode === "grid" ? "mt-auto" : ""}`}>
          {/* Document indicators */}
          <div className={`flex items-center gap-3 text-xs text-muted-foreground mb-3 ${
            viewMode === "list" ? "sm:mb-0 sm:flex-row sm:justify-end" : ""
          }`}>
            {application.cvFile || application.cvUrl && (
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                <span>CV</span>
              </div>
            )}
            {application.youth?.profile.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>Teléfono</span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className={`flex gap-2 ${
            viewMode === "list" ? "sm:flex-row sm:items-center sm:justify-between" : "flex-col"
          }`}>
            {application.hasInterest ? (
              <div className={viewMode === "list" ? "flex items-center gap-2" : "space-y-2"}>
                <Badge variant="default" className={`text-xs ${
                  viewMode === "list" ? "w-fit" : "w-full justify-center"
                }`}>
                  {application.interestStatus === "INTERESTED" && "Interés Expresado"}
                  {application.interestStatus === "CONTACTED" && "Contactado"}
                  {application.interestStatus === "INTERVIEW_SCHEDULED" && "Entrevista Programada"}
                  {application.interestStatus === "HIRED" && "Contratado"}
                  {application.interestStatus === "NOT_INTERESTED" && "No Interesado"}
                </Badge>
                {application.interestStatus === "INTERESTED" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className={viewMode === "list" ? "w-auto" : "w-full"}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateInterest(application.id, application.interestId!, "CONTACTED");
                    }}
                  >
                    Contactar
                  </Button>
                )}
                {application.interestStatus === "CONTACTED" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className={viewMode === "list" ? "w-auto" : "w-full"}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateInterest(application.id, application.interestId!, "INTERVIEW_SCHEDULED");
                    }}
                  >
                    Programar Entrevista
                  </Button>
                )}
                {application.interestStatus === "INTERVIEW_SCHEDULED" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className={viewMode === "list" ? "w-auto" : "w-full"}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateInterest(application.id, application.interestId!, "HIRED");
                    }}
                  >
                    Contratar
                  </Button>
                )}
              </div>
            ) : (
              !isAdmin && (
                <Button 
                  size="sm" 
                  className={viewMode === "list" ? "w-auto" : "w-full"}
                  onClick={(e) => {
                    e.stopPropagation();
                    expressInterest(application.id);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Expresar Interés
                </Button>
              )
            )}
            
            {/* Chat and View buttons */}
            <div className={`flex gap-2 ${viewMode === "list" ? "sm:ml-auto" : ""}`}>
              <Button 
                variant="outline" 
                size="sm"
                className={`text-blue-600 hover:text-blue-700 hover:bg-blue-50 ${
                  viewMode === "list" ? "w-auto" : "flex-1"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  startChat(application);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedApplication(application);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${showChat ? 'lg:mr-96' : ''}`}>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold">Candidatos Jóvenes</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Descubre talento joven disponible para oportunidades laborales
              </p>
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className={`grid gap-3 sm:gap-4 ${isAdmin ? 'grid-cols-2 lg:grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <div>
                    <p className="text-lg sm:text-2xl font-bold">{filteredApplications.length}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Aplicaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <div>
                    <p className="text-lg sm:text-2xl font-bold">
                      {filteredApplications.filter(app => app.status === "ACTIVE").length}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Activas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {!isAdmin && (
              <>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                      <div>
                        <p className="text-lg sm:text-2xl font-bold">
                          {filteredApplications.filter(app => app.hasInterest).length}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Con Interés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                      <div>
                        <p className="text-lg sm:text-2xl font-bold">
                          {filteredApplications.filter(app => app.totalInterests > 0).length}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Populares</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar aplicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select value={educationFilter} onValueChange={setEducationFilter}>
                <SelectTrigger className="w-full sm:w-48">
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
                <SelectTrigger className="w-full sm:w-48">
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
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Más recientes</SelectItem>
                  <SelectItem value="applicationsCount">Más populares</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

      {/* Applications Grid/List */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6" 
        : "space-y-4"
      }>
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
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

        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && activeChat && (
        <div className="fixed inset-0 lg:inset-auto lg:right-0 lg:top-0 lg:h-full lg:w-96 bg-white border-l shadow-lg z-50">
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Chat con {activeChat.youthName}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Solicitud abierta</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowChat(false);
                    setActiveChat(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              <MessageInterface
                recipientId={activeChat.youthId}
                contextType="YOUTH_APPLICATION"
                contextId={activeChat.applicationId}
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && selectedApplication.youth?.profile && (
        <YouthApplicationDetailModal 
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onExpressInterest={expressInterest}
          onUpdateInterest={updateInterest}
          onOpenChat={() => startChat(selectedApplication)}
          isAdmin={isAdmin}
        />
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
  onOpenChat,
  isAdmin
}: { 
  application: YouthApplication;
  onClose: () => void;
  onExpressInterest: (id: string, notes?: string) => void;
  onUpdateInterest: (applicationId: string, interestId: string, status: string, notes?: string) => void;
  onOpenChat: () => void;
  isAdmin: boolean;
}) {
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">{application.title}</CardTitle>
            <Button variant="ghost" onClick={onClose} size="sm">✕</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Youth Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto sm:mx-0">
              <AvatarImage src={application.youth?.profile.avatarUrl} />
              <AvatarFallback>
                {application.youth?.profile.firstName?.[0]}
                {application.youth?.profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-semibold">
                {application.youth?.profile.firstName} {application.youth?.profile.lastName}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">{application.youth.email}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                <Badge className={getStatusColor(application.status)}>
                  {getStatusLabel(application.status)}
                </Badge>
                {application.youth?.profile.city && (
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{application.youth?.profile.city}</span>
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
          {application.youth?.profile.skills && application.youth?.profile.skills.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Habilidades</h4>
              <div className="flex flex-wrap gap-2">
                {application.youth?.profile.skills.map((skill: any, index) => (
                  <Badge key={index} variant="outline">
                    {typeof skill === 'string' ? skill : skill.name || skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {application.youth?.profile.education && (
            <div>
              <h4 className="font-semibold mb-2">Nivel Educativo</h4>
              <Badge variant="outline">
                {getEducationLevelLabel(application.youth?.profile.education)}
              </Badge>
            </div>
          )}

          {/* Documents */}
          {(application.cvFile || application.cvUrl || application.coverLetterFile || application.coverLetterUrl) && (
            <div>
              <h4 className="font-semibold mb-2">Documentos</h4>
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
                {(application.cvFile || application.cvUrl) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      const cvUrl = application.cvUrl || application.cvFile;
                      if (cvUrl) {
                        // If it's a full URL, open it directly
                        if (cvUrl.startsWith('http')) {
                          window.open(cvUrl, '_blank');
                        } else {
                          // If it's a file path, construct the full URL
                          const fullUrl = cvUrl.startsWith('/') ? cvUrl : `/${cvUrl}`;
                          window.open(fullUrl, '_blank');
                        }
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar CV
                  </Button>
                )}
                {(application.coverLetterFile || application.coverLetterUrl) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      const coverLetterUrl = application.coverLetterUrl || application.coverLetterFile;
                      if (coverLetterUrl) {
                        // If it's a full URL, open it directly
                        if (coverLetterUrl.startsWith('http')) {
                          window.open(coverLetterUrl, '_blank');
                        } else {
                          // If it's a file path, construct the full URL
                          const fullUrl = coverLetterUrl.startsWith('/') ? coverLetterUrl : `/${coverLetterUrl}`;
                          window.open(fullUrl, '_blank');
                        }
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Carta de Presentación</span>
                    <span className="sm:hidden">Carta</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
            {!application.hasInterest ? (
              !isAdmin && (
                <Button 
                  className="w-full sm:w-auto"
                  onClick={() => onExpressInterest(application.id, notes)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Expresar Interés
                </Button>
              )
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                <Button 
                  className="w-full sm:w-auto"
                  onClick={() => onUpdateInterest(application.id, application.interestId!, "CONTACTED", notes)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Marcar como Contactado</span>
                  <span className="sm:hidden">Contactado</span>
                </Button>
                <Button 
                  className="w-full sm:w-auto"
                  onClick={() => onUpdateInterest(application.id, application.interestId!, "INTERVIEW_SCHEDULED", notes)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Programar Entrevista</span>
                  <span className="sm:hidden">Entrevista</span>
                </Button>
                <Button 
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                  onClick={() => onUpdateInterest(application.id, application.interestId!, "HIRED", notes)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Contratar
                </Button>
              </div>
            )}
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onOpenChat}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Enviar Mensaje</span>
              <span className="sm:hidden">Mensaje</span>
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
