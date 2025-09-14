"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useInterviews } from "@/hooks/useInterviews";
import { InterviewCard } from "@/components/interviews/InterviewCard";
import { InterviewScheduler } from "@/components/interviews/InterviewScheduler";
import { InterviewChat } from "@/components/interviews/InterviewChat";
import { Interview } from "@/hooks/useInterviews";

export default function InterviewsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    interviews,
    isLoading,
    error,
    refetch,
    updateInterview,
    sendMessage,
  } = useInterviews();

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = 
      interview.application.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.application.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.application.candidate.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || interview.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const upcomingInterviews = filteredInterviews.filter(
    interview => new Date(interview.scheduledAt) > new Date() && interview.status !== "COMPLETED"
  );

  const pastInterviews = filteredInterviews.filter(
    interview => new Date(interview.scheduledAt) <= new Date() || interview.status === "COMPLETED"
  );

  const handleCreateInterview = async (data: {
    type: string;
    scheduledAt: string;
    duration: number;
    location?: string;
    meetingLink?: string;
    notes?: string;
  }) => {
    // This would need to be passed from a parent component with application data
    // For now, we'll show an error
    console.error("Interview creation requires application context", data);
    return;
  };

  const handleUpdateInterview = async (id: string, status: string) => {
    await updateInterview(id, { status: status as "SCHEDULED" | "CONFIRMED" | "DECLINED" | "COMPLETED" | "CANCELLED" });
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedInterview) return false;
    return await sendMessage(selectedInterview.id, message);
  };

  const handleMessageClick = (interviewId: string) => {
    const interview = interviews.find(i => i.id === interviewId);
    if (interview) {
      setSelectedInterview(interview);
      setShowChat(true);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Entrevistas</h1>
            <p className="text-muted-foreground">Gestiona las entrevistas de trabajo</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Entrevistas</h1>
            <p className="text-muted-foreground">Gestiona las entrevistas de trabajo</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar entrevistas</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["YOUTH", "COMPANIES"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Entrevistas</h1>
            <p className="text-muted-foreground">Gestiona las entrevistas de trabajo</p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={() => setShowScheduler(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Entrevista
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por trabajo, empresa o candidato..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="SCHEDULED">Programada</option>
                  <option value="CONFIRMED">Confirmada</option>
                  <option value="DECLINED">Declinada</option>
                  <option value="COMPLETED">Completada</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Próximas ({upcomingInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Pasadas ({pastInterviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingInterviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay entrevistas próximas</h3>
                  <p className="text-muted-foreground">
                    Las entrevistas programadas aparecerán aquí.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingInterviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onUpdate={handleUpdateInterview}
                    onMessage={handleMessageClick}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastInterviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay entrevistas pasadas</h3>
                  <p className="text-muted-foreground">
                    Las entrevistas completadas aparecerán aquí.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastInterviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onUpdate={handleUpdateInterview}
                    onMessage={handleMessageClick}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Interview Scheduler Modal */}
        {showScheduler && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <InterviewScheduler
                applicationId=""
                jobTitle=""
                candidateName=""
                onSave={handleCreateInterview}
                onCancel={() => setShowScheduler(false)}
                isLoading={false}
              />
            </div>
          </div>
        )}

        {/* Interview Chat Modal */}
        {showChat && selectedInterview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Chat - {selectedInterview.application.jobTitle}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <InterviewChat
                  interview={selectedInterview}
                  onSendMessage={handleSendMessage}
                  isLoading={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
