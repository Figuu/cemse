"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  MessageSquare,
  Download,
  Star,
  Calendar,
  MapPin,
  Briefcase,
  Mail,
  Phone
} from "lucide-react";
import { JobApplicationChat } from "@/components/messaging/JobApplicationChat";

interface Application {
  id: string;
  applicant: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      phone?: string;
      address?: string;
    };
  };
  jobOffer: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
    };
  };
  status: "SENT" | "UNDER_REVIEW" | "PRE_SELECTED" | "REJECTED" | "HIRED";
  appliedAt: string;
  reviewedAt?: string;
  coverLetter?: string;
  notes?: string;
  rating?: number;
  cvFile?: string;
  coverLetterFile?: string;
}

interface ApplicationReviewDashboardProps {
  companyId: string;
  jobId?: string; // Optional - if provided, show applications for specific job only
}

export function ApplicationReviewDashboard({ companyId, jobId }: ApplicationReviewDashboardProps) {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("appliedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Fetch applications
  useEffect(() => {
    fetchApplications();
  }, [companyId, jobId, statusFilter, sortBy, sortOrder]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const endpoint = jobId 
        ? `/api/companies/${companyId}/jobs/${jobId}/applications`
        : `/api/companies/${companyId}/applications`;
      
      const params = new URLSearchParams({
        ...(statusFilter !== "all" && { status: statusFilter }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`${endpoint}?${params}`);
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

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string, decisionReason?: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes, decisionReason }),
      });

      if (response.ok) {
        await fetchApplications();
        // If hired, create employee record
        if (status === "HIRED") {
          await createEmployeeRecord(applicationId);
        }
      }
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  const createEmployeeRecord = async (applicationId: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      await fetch(`/api/companies/${companyId}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: application.applicant.id,
          position: application.jobOffer.title,
          applicationId: applicationId,
        }),
      });
    } catch (error) {
      console.error("Error creating employee record:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT": return "bg-blue-100 text-blue-800";
      case "UNDER_REVIEW": return "bg-yellow-100 text-yellow-800";
      case "PRE_SELECTED": return "bg-purple-100 text-purple-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      case "HIRED": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SENT": return "Enviada";
      case "UNDER_REVIEW": return "En Revisión";
      case "PRE_SELECTED": return "Preseleccionado";
      case "REJECTED": return "Rechazada";
      case "HIRED": return "Contratado";
      default: return status;
    }
  };

  const filteredApplications = applications.filter(app =>
    app.applicant.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicant.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobOffer.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const applicationsByStatus = {
    sent: filteredApplications.filter(app => app.status === "SENT"),
    reviewing: filteredApplications.filter(app => app.status === "UNDER_REVIEW"),
    preselected: filteredApplications.filter(app => app.status === "PRE_SELECTED"),
    rejected: filteredApplications.filter(app => app.status === "REJECTED"),
    hired: filteredApplications.filter(app => app.status === "HIRED"),
  };

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => setSelectedApplication(application)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={application.applicant.profile.avatarUrl} />
              <AvatarFallback>
                {application.applicant.profile.firstName?.[0]}
                {application.applicant.profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">
                {application.applicant.profile.firstName} {application.applicant.profile.lastName}
              </h4>
              <p className="text-sm text-muted-foreground">{application.applicant.email}</p>
              <p className="text-sm font-medium">{application.jobOffer.title}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(application.status)}>
              {getStatusLabel(application.status)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(application.appliedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {application.applicant.profile.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>{application.applicant.profile.phone}</span>
              </div>
            )}
            {application.applicant.profile.address && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{application.applicant.profile.address}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedApplication(application);
                setShowChat(true);
              }}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            {application.cvFile && (
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            )}
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
          <h2 className="text-2xl font-bold">Gestión de Aplicaciones</h2>
          <p className="text-muted-foreground">
            Revisa y gestiona las aplicaciones de trabajo
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{applicationsByStatus.sent.length}</p>
                <p className="text-sm text-muted-foreground">Nuevas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{applicationsByStatus.reviewing.length}</p>
                <p className="text-sm text-muted-foreground">En Revisión</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{applicationsByStatus.preselected.length}</p>
                <p className="text-sm text-muted-foreground">Preseleccionados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{applicationsByStatus.hired.length}</p>
                <p className="text-sm text-muted-foreground">Contratados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{applicationsByStatus.rejected.length}</p>
                <p className="text-sm text-muted-foreground">Rechazadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar aplicantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="SENT">Nuevas</SelectItem>
            <SelectItem value="UNDER_REVIEW">En Revisión</SelectItem>
            <SelectItem value="PRE_SELECTED">Preseleccionados</SelectItem>
            <SelectItem value="REJECTED">Rechazadas</SelectItem>
            <SelectItem value="HIRED">Contratados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appliedAt">Fecha de aplicación</SelectItem>
            <SelectItem value="reviewedAt">Fecha de revisión</SelectItem>
            <SelectItem value="status">Estado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Todas ({filteredApplications.length})</TabsTrigger>
          <TabsTrigger value="sent">Nuevas ({applicationsByStatus.sent.length})</TabsTrigger>
          <TabsTrigger value="reviewing">En Revisión ({applicationsByStatus.reviewing.length})</TabsTrigger>
          <TabsTrigger value="preselected">Preseleccionados ({applicationsByStatus.preselected.length})</TabsTrigger>
          <TabsTrigger value="hired">Contratados ({applicationsByStatus.hired.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rechazadas ({applicationsByStatus.rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {applicationsByStatus.sent.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="reviewing" className="space-y-4">
          {applicationsByStatus.reviewing.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="preselected" className="space-y-4">
          {applicationsByStatus.preselected.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="hired" className="space-y-4">
          {applicationsByStatus.hired.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {applicationsByStatus.rejected.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Application Detail Modal would go here */}
      {selectedApplication && (
        <ApplicationDetailModal 
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdateStatus={updateApplicationStatus}
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
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <JobApplicationChat
                applicationId={selectedApplication.id}
                jobTitle={selectedApplication.jobOffer.title}
                companyName={selectedApplication.jobOffer.company.name}
                candidateName={`${selectedApplication.applicant.profile.firstName} ${selectedApplication.applicant.profile.lastName}`}
                companyId={companyId}
                candidateId={selectedApplication.applicant.id}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Application Detail Modal Component
function ApplicationDetailModal({ 
  application, 
  onClose, 
  onUpdateStatus 
}: { 
  application: Application;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, notes?: string, reason?: string) => void;
}) {
  const [notes, setNotes] = useState(application.notes || "");
  const [decisionReason, setDecisionReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detalles de Aplicación</CardTitle>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Candidate Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={application.applicant.profile.avatarUrl} />
              <AvatarFallback>
                {application.applicant.profile.firstName?.[0]}
                {application.applicant.profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">
                {application.applicant.profile.firstName} {application.applicant.profile.lastName}
              </h3>
              <p className="text-muted-foreground">{application.applicant.email}</p>
              <Badge className={getStatusColor(application.status)}>
                {getStatusLabel(application.status)}
              </Badge>
            </div>
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div>
              <h4 className="font-semibold mb-2">Carta de Presentación</h4>
              <div className="bg-muted p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => onUpdateStatus(application.id, "UNDER_REVIEW", notes)}
              disabled={application.status !== "SENT"}
            >
              Marcar en Revisión
            </Button>
            <Button 
              onClick={() => onUpdateStatus(application.id, "PRE_SELECTED", notes)}
              disabled={!["SENT", "UNDER_REVIEW"].includes(application.status)}
            >
              Preseleccionar
            </Button>
            <Button 
              onClick={() => onUpdateStatus(application.id, "HIRED", notes)}
              disabled={application.status === "HIRED"}
              className="bg-green-600 hover:bg-green-700"
            >
              Contratar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => onUpdateStatus(application.id, "REJECTED", notes, decisionReason)}
              disabled={application.status === "REJECTED"}
            >
              Rechazar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "SENT": return "bg-blue-100 text-blue-800";
    case "UNDER_REVIEW": return "bg-yellow-100 text-yellow-800";
    case "PRE_SELECTED": return "bg-purple-100 text-purple-800";
    case "REJECTED": return "bg-red-100 text-red-800";
    case "HIRED": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "SENT": return "Enviada";
    case "UNDER_REVIEW": return "En Revisión";
    case "PRE_SELECTED": return "Preseleccionado";
    case "REJECTED": return "Rechazada";
    case "HIRED": return "Contratado";
    default: return status;
  }
}
