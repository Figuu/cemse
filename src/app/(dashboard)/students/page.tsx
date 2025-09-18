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

function StudentsPageContent() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - in real app, this would come from API
  const students = [
    {
      id: "1",
      name: "María González",
      email: "maria.gonzalez@email.com",
      phone: "+57 300 123 4567",
      enrollmentDate: "2024-01-15",
      status: "ACTIVE",
      coursesCompleted: 3,
      certificates: 2,
      currentCourse: "Desarrollo Web Frontend",
      progress: 75
    },
    {
      id: "2", 
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@email.com",
      phone: "+57 300 234 5678",
      enrollmentDate: "2024-02-20",
      status: "ACTIVE",
      coursesCompleted: 1,
      certificates: 1,
      currentCourse: "Marketing Digital",
      progress: 45
    },
    {
      id: "3",
      name: "Ana Martínez",
      email: "ana.martinez@email.com", 
      phone: "+57 300 345 6789",
      enrollmentDate: "2024-01-10",
      status: "GRADUATED",
      coursesCompleted: 5,
      certificates: 4,
      currentCourse: null,
      progress: 100
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "GRADUATED":
        return "bg-blue-100 text-blue-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Activo";
      case "GRADUATED":
        return "Graduado";
      case "INACTIVE":
        return "Inactivo";
      default:
        return status;
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
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
              75% del total
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
              25% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.reduce((sum, s) => sum + s.certificates, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total emitidos
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
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`/avatars/${student.id}.jpg`} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold">{student.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{student.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{student.phone}</span>
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
                          {student.coursesCompleted} cursos completados
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {student.certificates} certificados
                        </div>
                      </div>
                      
                      {student.currentCourse && (
                        <div className="text-right space-y-1">
                          <div className="text-sm font-medium">{student.currentCourse}</div>
                          <div className="text-sm text-muted-foreground">
                            Progreso: {student.progress}%
                          </div>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${student.progress}%` } as React.CSSProperties}
                            />
                          </div>
                        </div>
                      )}
                      
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
            ))}
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
