"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Eye, 
  MessageCircle, 
  Calendar,
  MapPin,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Star,
  Users,
  Briefcase,
  DollarSign,
  Globe,
  Mail,
  Phone
} from "lucide-react";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { JobApplicationChat } from "@/components/jobs/JobApplicationChat";

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  companyOwnerId?: string;
  companyDescription?: string;
  location: string;
  appliedDate: string;
  status: "applied" | "reviewing" | "shortlisted" | "interview" | "offered" | "rejected" | "withdrawn";
  priority: "low" | "medium" | "high";
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  jobType: "tiempo-completo" | "medio-tiempo" | "contrato" | "pasantía" | "voluntario";
  remote: boolean;
  experience: string;
  skills: string[];
  description?: string;
  requirements?: string[];
  benefits?: string[];
  notes?: string;
  nextSteps?: string;
  interviewDate?: string;
  rejectionReason?: string;
  offerDetails?: {
    salary: number;
    startDate: string;
    benefits: string[];
    responseDeadline: string;
  };
  timeline: ApplicationTimelineEvent[];
  contactPerson?: {
    name: string;
    title: string;
    email: string;
    phone?: string;
  };
  communication?: any[];
}

interface ApplicationTimelineEvent {
  id: string;
  type: "applied" | "reviewed" | "shortlisted" | "interview_scheduled" | "interview_completed" | "offered" | "rejected" | "withdrawn";
  title: string;
  description: string;
  date: string;
  status: "completed" | "pending" | "cancelled";
  details?: string;
}

const mockApplication: JobApplication = {
  id: "app-1",
  jobId: "job-offer-123",
  jobTitle: "Senior Frontend Developer",
  company: "TechCorp Bolivia",
  companyLogo: "/api/placeholder/60/60",
  companyOwnerId: "company-owner-456",
  companyDescription: "TechCorp Bolivia es una empresa líder en desarrollo de software con más de 10 años de experiencia en el mercado. Nos especializamos en soluciones web y móviles para empresas de todos los tamaños.",
  location: "La Paz, Bolivia",
  appliedDate: "2024-01-15T10:30:00Z",
  status: "interview",
  priority: "high",
  salary: {
    min: 15000,
    max: 20000,
    currency: "BOB"
  },
  jobType: "tiempo-completo",
  remote: true,
  experience: "3-5 años",
  skills: ["React", "TypeScript", "Node.js", "MongoDB", "AWS", "Docker"],
  description: "Estamos buscando un desarrollador frontend senior para unirse a nuestro equipo de desarrollo. El candidato ideal tendrá experiencia sólida en React y TypeScript, y estará familiarizado con las mejores prácticas de desarrollo web moderno.",
  requirements: [
    "3+ años de experiencia en desarrollo frontend",
    "Experiencia sólida con React y TypeScript",
    "Conocimiento de Node.js y bases de datos",
    "Experiencia con herramientas de CI/CD",
    "Inglés intermedio-avanzado",
    "Trabajo en equipo y comunicación efectiva"
  ],
  benefits: [
    "Salario competitivo",
    "Seguro médico completo",
    "Días de vacaciones flexibles",
    "Oportunidades de crecimiento profesional",
    "Ambiente de trabajo colaborativo",
    "Trabajo remoto disponible"
  ],
  notes: "Empresa muy interesante, buena cultura y oportunidades de crecimiento. El equipo parece muy profesional y la tecnología que usan está actualizada.",
  nextSteps: "Entrevista técnica programada para el 25 de enero a las 2:00 PM. Preparar ejemplos de proyectos anteriores y estar listo para resolver problemas de código.",
  interviewDate: "2024-01-25T14:00:00Z",
  timeline: [
    {
      id: "1",
      type: "applied",
      title: "Aplicación enviada",
      description: "Tu aplicación fue enviada exitosamente",
      date: "2024-01-15T10:30:00Z",
      status: "completed",
      details: "Aplicación enviada a través de la plataforma Emplea y Emprende"
    },
    {
      id: "2",
      type: "reviewed",
      title: "Aplicación revisada",
      description: "Tu aplicación ha sido revisada por el equipo de RRHH",
      date: "2024-01-16T09:15:00Z",
      status: "completed",
      details: "El equipo de RRHH ha revisado tu perfil y CV. Tu experiencia coincide con los requisitos del puesto."
    },
    {
      id: "3",
      type: "shortlisted",
      title: "Preseleccionado",
      description: "Has sido preseleccionado para la siguiente etapa",
      date: "2024-01-18T14:20:00Z",
      status: "completed",
      details: "Tu perfil ha sido seleccionado entre los candidatos más calificados. El siguiente paso es la entrevista técnica."
    },
    {
      id: "4",
      type: "interview_scheduled",
      title: "Entrevista programada",
      description: "Entrevista técnica programada para el 25 de enero a las 2:00 PM",
      date: "2024-01-20T11:00:00Z",
      status: "pending",
      details: "La entrevista será conducida por el líder técnico del equipo. Duración estimada: 1 hora. Se evaluarán tus habilidades técnicas y experiencia."
    }
  ],
  contactPerson: {
    name: "María González",
    title: "Gerente de RRHH",
    email: "maria.gonzalez@techcorp.bo",
    phone: "+591 70123456"
  }
};

const statusConfig = {
  applied: { label: "Aplicado", color: "bg-blue-100 text-blue-800", icon: FileText },
  reviewing: { label: "En Revisión", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  shortlisted: { label: "Preseleccionado", color: "bg-purple-100 text-purple-800", icon: Star },
  interview: { label: "Entrevista", color: "bg-orange-100 text-orange-800", icon: Calendar },
  offered: { label: "Oferta", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rechazado", color: "bg-red-100 text-red-800", icon: XCircle },
  withdrawn: { label: "Retirado", color: "bg-gray-100 text-gray-800", icon: AlertCircle }
};

const jobTypeLabels = {
  "tiempo-completo": "Tiempo Completo",
  "medio-tiempo": "Medio Tiempo",
  "contrato": "Contrato",
  "pasantía": "Pasantía",
  "voluntario": "Voluntario"
};

const priorityConfig = {
  low: { label: "Baja", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Media", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "Alta", color: "bg-red-100 text-red-800" }
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showChat, setShowChat] = useState(false);
  
  // Determine user role
  const isYouth = session?.user?.role === "YOUTH";

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/applications/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch application');
        }
        
        const data = await response.json();
        if (data.success) {
          setApplication(data.application);
        } else {
          throw new Error(data.error || 'Failed to fetch application');
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        // Fallback to mock data for development
        setApplication(mockApplication);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchApplication();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aplicación no encontrada</h3>
            <p className="text-muted-foreground">
              La aplicación que buscas no existe o ha sido eliminada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusConfig[application.status].icon;

  const handleOpenChat = () => {
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
  };

  return (
    <>
      <div className={`space-y-6 ${showChat ? 'mr-96' : ''}`}>
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/applications">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Aplicaciones
        </Link>
      </Button>

      {/* Application Header */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start space-y-4 sm:space-y-6 lg:space-y-0 lg:space-x-6">
            {/* Company Logo and Basic Info */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-gray-600" />
              </div>
              
              <div className="text-center lg:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold">{application.jobTitle}</h1>
                  <Badge className={statusConfig[application.status].color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[application.status].label}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground mb-2">{application.company}</p>
                <div className="flex items-center justify-center lg:justify-start text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  {application.location}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center lg:justify-start">
                    <Clock className="h-4 w-4 mr-1" />
                    Aplicado {formatDate(application.appliedDate)}
                  </div>
                  <div className="flex justify-center lg:justify-start">
                    <Badge variant="outline" className={priorityConfig[application.priority].color}>
                      {priorityConfig[application.priority].label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">{jobTypeLabels[application.jobType]}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Tipo de Trabajo</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">{application.experience}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Experiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-purple-600">{application.skills.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Habilidades</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-orange-600">
                    {application.remote ? "Sí" : "No"}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Remoto</div>
                </div>
              </div>

              {application.salary && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-800 text-sm sm:text-base">Salario Ofrecido</h4>
                      <p className="text-green-700 text-sm sm:text-base">
                        {application.salary.min.toLocaleString()} - {application.salary.max.toLocaleString()} {application.salary.currency}
                      </p>
                    </div>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {Array.isArray(application.skills) && application.skills.length > 0 ? (
                  application.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs sm:text-sm">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No hay habilidades específicas disponibles</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full lg:w-64">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                <Button className="w-full text-sm sm:text-base">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Trabajo
                </Button>
                <Button variant="outline" className="w-full text-sm sm:text-base" onClick={handleOpenChat}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
                <Button variant="outline" className="w-full text-sm sm:text-base">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar CV
                </Button>
                {application.status === "offered" && !isYouth && (
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base col-span-1 sm:col-span-2 lg:col-span-1">
                    Responder Oferta
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Resumen</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs sm:text-sm py-2">Cronología</TabsTrigger>
          <TabsTrigger value="details" className="text-xs sm:text-sm py-2">Detalles</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs sm:text-sm py-2">Contacto</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción del Trabajo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {application.description || "Descripción del puesto no disponible"}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Array.isArray(application.requirements) && application.requirements.length > 0 ? (
                    application.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{requirement}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">
                      No hay requisitos específicos disponibles
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Beneficios</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Array.isArray(application.benefits) && application.benefits.length > 0 ? (
                    application.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">
                      No hay beneficios específicos disponibles
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Notes and Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Notas y Próximos Pasos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Mis Notas</h4>
                    <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                      {application.notes}
                    </p>
                  </div>
                )}
                {application.nextSteps && (
                  <div>
                    <h4 className="font-medium mb-2">Próximos Pasos</h4>
                    <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                      {application.nextSteps}
                    </p>
                  </div>
                )}
                {application.interviewDate && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <h4 className="font-medium text-orange-800 mb-1">Entrevista Programada</h4>
                    <p className="text-sm text-orange-700">
                      {formatDateTime(application.interviewDate)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Cronología de la Aplicación</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Seguimiento de todos los eventos relacionados con tu aplicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                {application.timeline.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center",
                        event.status === "completed" ? "bg-green-100" : 
                        event.status === "pending" ? "bg-orange-100" : "bg-gray-100"
                      )}>
                        {event.status === "completed" ? (
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        ) : event.status === "pending" ? (
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                        ) : (
                          <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 space-y-1 sm:space-y-0">
                        <h4 className="font-semibold text-sm sm:text-base">{event.title}</h4>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {formatDateTime(event.date)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      {event.details && (
                        <p className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                          {event.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Descripción</h4>
                    <p className="text-sm text-muted-foreground">
                      {application.companyDescription}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {application.location}
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <a href="#" className="text-blue-600 hover:underline">
                        Sitio Web
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalles del Puesto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tipo de Trabajo</span>
                    <span className="text-sm font-medium">{jobTypeLabels[application.jobType]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Experiencia Requerida</span>
                    <span className="text-sm font-medium">{application.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Trabajo Remoto</span>
                    <span className="text-sm font-medium">{application.remote ? "Sí" : "No"}</span>
                  </div>
                  {application.salary && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Salario</span>
                      <span className="text-sm font-medium">
                        {application.salary.min.toLocaleString()} - {application.salary.max.toLocaleString()} {application.salary.currency}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 sm:space-y-6">
          {application.contactPerson ? (
            <Card>
              <CardHeader>
                <CardTitle>Persona de Contacto</CardTitle>
                <CardDescription>
                  Información de contacto para esta aplicación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                      <Users className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="font-semibold text-sm sm:text-base">{application.contactPerson.name}</h4>
                      <p className="text-sm text-muted-foreground">{application.contactPerson.title}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${application.contactPerson.email}`} className="text-blue-600 hover:underline text-sm sm:text-base">
                          {application.contactPerson.email}
                        </a>
                      </div>
                    </div>
                    {application.contactPerson.phone && (
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${application.contactPerson.phone}`} className="text-blue-600 hover:underline text-sm sm:text-base">
                          {application.contactPerson.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin información de contacto</h3>
                <p className="text-muted-foreground">
                  No hay información de contacto disponible para esta aplicación.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      </div>

      {/* Chat Sidebar - Rendered outside main container */}
      {showChat && application && (
        <JobApplicationChat
          jobId={application.jobId}
          applicationId={application.id}
          applicant={{
            id: application.companyOwnerId || "company-1",
            firstName: application.company,
            lastName: "",
            avatarUrl: "/placeholder-company.png",
            email: application.contactPerson?.email || "company@example.com"
          }}
          application={{
            id: application.id,
            status: application.status,
            appliedAt: application.appliedDate,
            coverLetter: application.notes || "",
            cvFile: null,
            cvUrl: "",
            coverLetterFile: null,
            coverLetterUrl: ""
          }}
          onClose={handleCloseChat}
        />
      )}
    </>
  );
}
