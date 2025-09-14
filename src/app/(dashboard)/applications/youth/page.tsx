"use client";

import { useState, useEffect } from "react";
import { YouthApplicationForm } from "@/components/jobs/YouthApplicationForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  FileText, 
  Eye, 
  Edit, 
  Pause, 
  Play, 
  Heart,
  CheckCircle,
  Calendar
} from "lucide-react";
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
  companyInterests: Array<{ id: string; company: { name: string } }>;
  totalInterests: number;
}

export default function YouthApplicationsPage() {
  const [applications, setApplications] = useState<YouthApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<YouthApplication | null>(null);
  const [activeTab, setActiveTab] = useState("my-applications");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/youth-applications");
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

  const createApplication = async (formData: Record<string, unknown>) => {
    try {
      const response = await fetch("/api/youth-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchApplications();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error creating application:", error);
    }
  };

  const updateApplication = async (id: string, formData: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/youth-applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchApplications();
        setEditingApplication(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/youth-applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchApplications();
      }
    } catch (error) {
      console.error("Error updating application status:", error);
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

  const ApplicationCard = ({ application }: { application: YouthApplication }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{application.title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {application.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Creado {formatDistanceToNow(new Date(application.createdAt), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{application.viewsCount} vistas</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{application.totalInterests} intereses</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(application.status)}>
              {getStatusLabel(application.status)}
            </Badge>
            <div className="flex items-center gap-2 mt-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setEditingApplication(application);
                  setShowForm(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              {application.status === "ACTIVE" ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => updateApplicationStatus(application.id, "PAUSED")}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              ) : application.status === "PAUSED" ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => updateApplicationStatus(application.id, "ACTIVE")}
                >
                  <Play className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {application.companyInterests && application.companyInterests.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">Empresas Interesadas</h4>
            <div className="flex flex-wrap gap-2">
              {application.companyInterests.slice(0, 3).map((interest) => (
                <Badge key={interest.id} variant="outline" className="text-xs">
                  {interest.company.name}
                </Badge>
              ))}
              {application.companyInterests.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{application.companyInterests.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => {
            setShowForm(false);
            setEditingApplication(null);
          }}>
            ← Volver
          </Button>
          <h1 className="text-3xl font-bold">
            {editingApplication ? "Editar Aplicación" : "Nueva Aplicación Abierta"}
          </h1>
        </div>
        
        <YouthApplicationForm
          onSubmit={(data) => {
            if (editingApplication) {
              updateApplication(editingApplication.id, data);
            } else {
              createApplication(data);
            }
          }}
          existingApplication={editingApplication || undefined}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mis Aplicaciones Abiertas</h1>
          <p className="text-muted-foreground">
            Gestiona tus aplicaciones abiertas para que las empresas puedan encontrarte
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Aplicación
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
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
                  {applications.filter(app => app.status === "ACTIVE").length}
                </p>
                <p className="text-sm text-muted-foreground">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {applications.reduce((sum, app) => sum + app.viewsCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Vistas</p>
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
                  {applications.reduce((sum, app) => sum + app.totalInterests, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Intereses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-applications">
            Todas ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Activas ({applications.filter(app => app.status === "ACTIVE").length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            Pausadas ({applications.filter(app => app.status === "PAUSED").length})
          </TabsTrigger>
          <TabsTrigger value="interests">
            Con Intereses ({applications.filter(app => app.totalInterests > 0).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-applications" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : applications.length > 0 ? (
            applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes aplicaciones</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera aplicación abierta para que las empresas puedan encontrarte
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Aplicación
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {applications.filter(app => app.status === "ACTIVE").map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="paused" className="space-y-4">
          {applications.filter(app => app.status === "PAUSED").map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="interests" className="space-y-4">
          {applications.filter(app => app.totalInterests > 0).map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
