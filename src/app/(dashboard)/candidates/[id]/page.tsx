"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Star, 
  Heart,
  MessageCircle,
  ExternalLink,
  Clock,
  DollarSign,
  Globe,
  Phone,
  Mail,
  GraduationCap,
  Award,
  TrendingUp,
  Eye,
  Save
} from "lucide-react";
import { useCandidate } from "@/hooks/useCandidates";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");

  const { data: candidate, isLoading, error } = useCandidate(candidateId);

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

  if (error || !candidate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Candidato no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            El candidato que buscas no existe o ha sido eliminado
          </p>
          <Link href="/candidates">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Candidatos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = false; // This would come from a hook in real app
  const hasContacted = false; // This would come from a hook in real app

  const handleSave = () => {
    // Implement save functionality
    console.log("Saving candidate:", candidate.id);
  };

  const handleContact = () => {
    // Implement contact functionality
    console.log("Contacting candidate:", candidate.id);
  };

  const getExperienceLevelLabel = (level: string) => {
    const experienceLevels = [
      { value: "ENTRY_LEVEL", label: "Nivel Inicial (0-2 años)" },
      { value: "MID_LEVEL", label: "Nivel Medio (2-5 años)" },
      { value: "SENIOR_LEVEL", label: "Nivel Senior (5+ años)" },
      { value: "EXECUTIVE", label: "Ejecutivo (10+ años)" },
      { value: "INTERN", label: "Interno/Practicante" },
    ];
    const experienceLevel = experienceLevels.find(exp => exp.value === level);
    return experienceLevel?.label || level;
  };

  const getAvailabilityLabel = (availability: string) => {
    const availabilityOptions = [
      { value: "IMMEDIATE", label: "Inmediata" },
      { value: "WITHIN_MONTH", label: "Dentro de un mes" },
      { value: "WITHIN_QUARTER", label: "Dentro de 3 meses" },
      { value: "FLEXIBLE", label: "Flexible" },
    ];
    const availabilityOption = availabilityOptions.find(avail => avail.value === availability);
    return availabilityOption?.label || availability;
  };

  const formatSalaryExpectations = () => {
    if (!candidate.salaryExpectations) return null;
    
    const { min, max, currency } = candidate.salaryExpectations;
    
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    } else if (min) {
      return `Desde ${min.toLocaleString()} ${currency}`;
    } else if (max) {
      return `Hasta ${max.toLocaleString()} ${currency}`;
    }
    
    return null;
  };

  const getWorkArrangementLabels = () => {
    if (!candidate.workArrangementPreferences) return [];
    
    const arrangements = [];
    if (candidate.workArrangementPreferences.office) arrangements.push("Oficina");
    if (candidate.workArrangementPreferences.remote) arrangements.push("Remoto");
    if (candidate.workArrangementPreferences.hybrid) arrangements.push("Híbrido");
    return arrangements;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/candidates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {candidate.profile?.firstName || ""} {candidate.profile?.lastName || ""}
          </h1>
          <p className="text-muted-foreground">
            {candidate.profile?.address || "Ubicación no especificada"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            onClick={handleSave}
          >
            <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? "Guardado" : "Guardar"}
          </Button>
          <Button
            variant={hasContacted ? "outline" : "default"}
            size="sm"
            onClick={handleContact}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {hasContacted ? "Contactado" : "Contactar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {candidate.profile?.avatarUrl ? (
                    <img
                      src={candidate.profile.avatarUrl}
                      alt={`${candidate.profile.firstName} ${candidate.profile.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">
                      {candidate.profile?.firstName || ""} {candidate.profile?.lastName || ""}
                    </h2>
                    {candidate.availability === "IMMEDIATE" && (
                      <Badge variant="destructive" className="text-xs">
                        Disponible
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {candidate.profile?.address || "Ubicación no especificada"}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {getExperienceLevelLabel(candidate.experienceLevel || "ENTRY_LEVEL")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {getAvailabilityLabel(candidate.availability || "FLEXIBLE")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {candidate.statistics?.totalApplications || 0} aplicaciones
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {candidate.statistics?.totalApplications || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Aplicaciones</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {candidate.statistics?.recentApplications || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Recientes</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {candidate.skills?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Habilidades</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {candidate.languages?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Idiomas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="experience">Experiencia</TabsTrigger>
                <TabsTrigger value="applications">Aplicaciones</TabsTrigger>
                <TabsTrigger value="skills">Habilidades</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-6">
                <div className="space-y-6">
                  {/* Skills */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Habilidades Técnicas</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {candidate.languages && candidate.languages.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Idiomas</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.languages.map((language) => (
                          <Badge key={language} variant="secondary">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Arrangement Preferences */}
                  {getWorkArrangementLabels().length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Preferencias de Trabajo</h4>
                      <div className="flex flex-wrap gap-2">
                        {getWorkArrangementLabels().map((arrangement) => (
                          <Badge key={arrangement} variant="outline">
                            {arrangement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Salary Expectations */}
                  {formatSalaryExpectations() && (
                    <div>
                      <h4 className="font-semibold mb-3">Expectativas Salariales</h4>
                      <div className="flex items-center gap-2 text-lg font-medium text-green-600">
                        <DollarSign className="h-5 w-5" />
                        <span>{formatSalaryExpectations()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="experience" className="p-6">
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Experiencia Profesional</h3>
                    <p className="text-muted-foreground">
                      La información de experiencia se mostrará aquí cuando esté disponible
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="applications" className="p-6">
                <div className="space-y-4">
                  {candidate.jobApplications && candidate.jobApplications.length > 0 ? (
                    candidate.jobApplications.map((application) => (
                      <Card key={application.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{application.job.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {application.job.company.name}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(application.appliedAt), { 
                                    addSuffix: true, 
                                    locale: es 
                                  })}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {application.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link href={`/companies/${application.job.company.id}/jobs/${application.job.id}`}>
                                <Button variant="outline" size="sm">
                                  Ver Trabajo
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No hay aplicaciones</h3>
                      <p className="text-muted-foreground">
                        Este candidato no ha aplicado a trabajos aún
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="skills" className="p-6">
                <div className="space-y-6">
                  {candidate.skills && candidate.skills.length > 0 ? (
                    <div>
                      <h4 className="font-semibold mb-3">Habilidades Técnicas</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {candidate.skills.map((skill) => (
                          <div key={skill} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                            <Award className="h-4 w-4 text-primary" />
                            <span className="text-sm">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No hay habilidades registradas</h3>
                      <p className="text-muted-foreground">
                        Este candidato no ha registrado sus habilidades aún
                      </p>
                    </div>
                  )}
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
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{candidate.email}</span>
              </div>
              {candidate.profile?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{candidate.profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{candidate.profile?.address || "No especificada"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Candidate Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Experiencia</span>
                <span className="text-sm font-medium">
                  {getExperienceLevelLabel(candidate.experienceLevel || "ENTRY_LEVEL")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Disponibilidad</span>
                <span className="text-sm font-medium">
                  {getAvailabilityLabel(candidate.availability || "FLEXIBLE")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Aplicaciones</span>
                <span className="text-sm font-medium">{candidate.statistics?.totalApplications || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Habilidades</span>
                <span className="text-sm font-medium">{candidate.skills?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Idiomas</span>
                <span className="text-sm font-medium">{candidate.languages?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button
                  className="w-full"
                  variant={isSaved ? "default" : "outline"}
                  onClick={handleSave}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? "Guardado" : "Guardar Candidato"}
                </Button>
                <Button
                  variant={hasContacted ? "outline" : "default"}
                  className="w-full"
                  onClick={handleContact}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {hasContacted ? "Contactado" : "Contactar"}
                </Button>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
