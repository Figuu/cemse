"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { 
  Users, 
  Search, 
  Filter, 
  Download,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Award,
  BookOpen
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useInstitutionStudents, STUDENT_STATUS_LABELS } from "@/hooks/useInstitutionStudents";

function StudentsPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();
  
  // Get institution ID from session
  const institutionId = session?.user?.profile?.institutionId;
  
  // Fetch real data
  const { data: studentsData, isLoading: studentsLoading } = useInstitutionStudents(institutionId, { 
    search: searchTerm,
    limit: 50 
  });

  const students = studentsData?.students || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "GRADUATED":
        return "bg-blue-100 text-blue-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "SUSPENDED":
        return "bg-yellow-100 text-yellow-800";
      case "DROPPED_OUT":
        return "bg-red-100 text-red-800";
      case "TRANSFERRED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return STUDENT_STATUS_LABELS[status as keyof typeof STUDENT_STATUS_LABELS] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estudiantes</h1>
          <p className="text-muted-foreground">
            Gestiona y supervisa el progreso de tus estudiantes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsData?.pagination?.totalCount || students.length}</div>
            <p className="text-xs text-muted-foreground">
              {studentsData?.pagination?.totalCount ? `Total en la institución` : "Cargando..."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter(s => s.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {students.length > 0 ? Math.round((students.filter(s => s.status === "ACTIVE").length / students.length) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graduados</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter(s => s.status === "GRADUATED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {students.length > 0 ? Math.round((students.filter(s => s.status === "GRADUATED").length / students.length) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.reduce((sum, s) => sum + (s._count?.enrollments || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total inscripciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Estudiantes</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar estudiantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studentsLoading ? (
              <div className="text-center py-8">Cargando estudiantes...</div>
            ) : students.map((student) => {
              const completedEnrollments = student.enrollments?.filter(e => e.status === "COMPLETED").length || 0;
              const totalEnrollments = student.enrollments?.length || 1;
              const progressPercentage = Math.round((completedEnrollments / totalEnrollments) * 100);
              
              return (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.student?.avatarUrl} />
                          <AvatarFallback>
                            {(student.student?.firstName?.[0] || '') + (student.student?.lastName?.[0] || '')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-1">
                          <h3 className="font-semibold">
                            {student.student?.firstName} {student.student?.lastName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{student.student?.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{student.student?.phone || "No disponible"}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Inscrito: {new Date(student.enrollmentDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right space-y-1">
                          <Badge className={getStatusColor(student.status)}>
                            {getStatusLabel(student.status)}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {completedEnrollments} cursos completados
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.program?.name || "Sin programa"}
                          </div>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <div className="text-sm font-medium">Progreso General</div>
                          <div className="text-sm text-muted-foreground">
                            Progreso: {progressPercentage}%
                          </div>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${progressPercentage}%` } as React.CSSProperties}
                            />
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            Ver Perfil
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <RoleGuard allowedRoles={["INSTITUTION", "SUPERADMIN"]}>
      <StudentsPageContent />
    </RoleGuard>
  );
}
