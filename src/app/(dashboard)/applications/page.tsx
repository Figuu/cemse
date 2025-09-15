"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Clock, 
  MessageCircle,
  Eye,
  Filter,
  Search
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ApplicationStatusLabels, EmploymentTypeLabels, ExperienceLevelLabels } from "@/types/company";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Mock data - in real app, this would come from an API
const mockApplications = [
  {
    id: "app1",
    job: {
      id: "job1",
      title: "Desarrollador Frontend",
      company: {
        name: "TechCorp",
        logoUrl: "/placeholder-company.png"
      },
      location: "Cochabamba, Bolivia",
      contractType: "FULL_TIME",
      experienceLevel: "MID_LEVEL",
      salaryMin: 8000,
      salaryMax: 12000,
      salaryCurrency: "BOB"
    },
    status: "UNDER_REVIEW",
    appliedAt: "2024-01-15T10:30:00Z",
    lastMessageAt: "2024-01-16T14:20:00Z",
    unreadMessages: 2
  },
  {
    id: "app2",
    job: {
      id: "job2",
      title: "Diseñador UX/UI",
      company: {
        name: "DesignStudio",
        logoUrl: "/placeholder-company.png"
      },
      location: "La Paz, Bolivia",
      contractType: "PART_TIME",
      experienceLevel: "ENTRY_LEVEL",
      salaryMin: 5000,
      salaryMax: 8000,
      salaryCurrency: "BOB"
    },
    status: "PRE_SELECTED",
    appliedAt: "2024-01-10T09:15:00Z",
    lastMessageAt: "2024-01-17T11:45:00Z",
    unreadMessages: 0
  },
  {
    id: "app3",
    job: {
      id: "job3",
      title: "Analista de Datos",
      company: {
        name: "DataCorp",
        logoUrl: "/placeholder-company.png"
      },
      location: "Santa Cruz, Bolivia",
      contractType: "FULL_TIME",
      experienceLevel: "SENIOR_LEVEL",
      salaryMin: 12000,
      salaryMax: 18000,
      salaryCurrency: "BOB"
    },
    status: "REJECTED",
    appliedAt: "2024-01-05T16:20:00Z",
    lastMessageAt: "2024-01-12T10:30:00Z",
    unreadMessages: 0
  }
];

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplications = mockApplications.filter(app => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesSearch = app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.job.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "HIRED": return "default";
      case "PRE_SELECTED": return "secondary";
      case "REJECTED": return "destructive";
      case "UNDER_REVIEW": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            Mis Aplicaciones
          </h1>
          <p className="text-muted-foreground">
            Gestiona y da seguimiento a tus aplicaciones de trabajo
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por trabajo o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Todas
              </Button>
              <Button
                variant={statusFilter === "SENT" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("SENT")}
              >
                Enviadas
              </Button>
              <Button
                variant={statusFilter === "UNDER_REVIEW" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("UNDER_REVIEW")}
              >
                En Revisión
              </Button>
              <Button
                variant={statusFilter === "PRE_SELECTED" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("PRE_SELECTED")}
              >
                Pre-seleccionadas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay aplicaciones</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "No se encontraron aplicaciones con los filtros seleccionados"
                  : "Aún no has aplicado a ningún trabajo"
                }
              </p>
              <Link href="/jobs">
                <Button>
                  Buscar Trabajos
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{application.job.title}</h3>
                        <p className="text-muted-foreground">{application.job.company.name}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{application.job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{EmploymentTypeLabels[application.job.contractType]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Aplicaste hace {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true, locale: es })}</span>
                      </div>
                    </div>

                    {application.job.salaryMin && application.job.salaryMax && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Salario: </span>
                        <span className="text-muted-foreground">
                          {application.job.salaryMin.toLocaleString()} - {application.job.salaryMax.toLocaleString()} {application.job.salaryCurrency}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <Badge variant={getStatusColor(application.status)}>
                      {ApplicationStatusLabels[application.status as keyof typeof ApplicationStatusLabels] || application.status}
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Link href={`/jobs/${application.job.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Trabajo
                        </Button>
                      </Link>
                      
                      {application.unreadMessages > 0 && (
                        <Link href={`/jobs/${application.job.id}/chat`}>
                          <Button size="sm" className="relative">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {application.unreadMessages}
                            </span>
                          </Button>
                        </Link>
                      )}
                      
                      {application.unreadMessages === 0 && (
                        <Link href={`/jobs/${application.job.id}/chat`}>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}