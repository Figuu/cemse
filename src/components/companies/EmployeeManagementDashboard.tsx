"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  MoreHorizontal,
  Edit,
  Trash2,
  UserMinus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Employee {
  id: string;
  employeeId: string;
  position: string;
  hiredAt: string;
  terminatedAt?: string;
  status: "ACTIVE" | "TERMINATED" | "ON_LEAVE";
  notes?: string;
  salary?: number;
  contractType?: string;
  employee: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      phone?: string;
      address?: string;
      city?: string;
      skillsWithLevel?: any[];
      workExperience?: any[];
      educationLevel?: string;
    };
  };
}

interface EmployeeManagementDashboardProps {
  companyId: string;
}

export function EmployeeManagementDashboard({ companyId }: EmployeeManagementDashboardProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, [companyId, statusFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/companies/${companyId}/employees?${params}`);
      const data = await response.json();
      
      if (data.employees) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateEmployeeStatus = async (employeeId: string, status: "ACTIVE" | "TERMINATED" | "ON_LEAVE", notes?: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/employees/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        await fetchEmployees();
      }
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const terminateEmployee = async (employeeId: string, reason?: string) => {
    if (confirm("¿Estás seguro de que quieres terminar la relación laboral con este empleado?")) {
      await updateEmployeeStatus(employeeId, "TERMINATED", reason);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800";
      case "TERMINATED": return "bg-red-100 text-red-800";
      case "ON_LEAVE": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE": return "Activo";
      case "TERMINATED": return "Terminado";
      case "ON_LEAVE": return "En Licencia";
      default: return status;
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.employee.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const employeesByStatus = {
    active: filteredEmployees.filter(emp => emp.status === "ACTIVE"),
    onLeave: filteredEmployees.filter(emp => emp.status === "ON_LEAVE"),
    terminated: filteredEmployees.filter(emp => emp.status === "TERMINATED"),
  };

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={employee.employee.profile.avatarUrl} />
              <AvatarFallback>
                {employee.employee.profile.firstName?.[0]}
                {employee.employee.profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">
                {employee.employee.profile.firstName} {employee.employee.profile.lastName}
              </h4>
              <p className="text-sm text-muted-foreground">{employee.employee.email}</p>
              <p className="text-sm font-medium">{employee.position}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Contratado {formatDistanceToNow(new Date(employee.hiredAt), { addSuffix: true, locale: es })}</span>
                </span>
                {employee.salary && (
                  <span className="font-medium text-green-600">
                    Bs. {employee.salary.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(employee.status)}>
              {getStatusLabel(employee.status)}
            </Badge>
            <div className="flex items-center space-x-2 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedEmployee(employee)}>
                <Edit className="h-4 w-4" />
              </Button>
              {employee.status === "ACTIVE" && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => terminateEmployee(employee.id)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-muted-foreground">
              {employee.employee.profile.phone && (
                <div className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>{employee.employee.profile.phone}</span>
                </div>
              )}
              {employee.employee.profile.city && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{employee.employee.profile.city}</span>
                </div>
              )}
              {employee.contractType && (
                <div className="flex items-center space-x-1">
                  <Briefcase className="h-3 w-3" />
                  <span>{employee.contractType}</span>
                </div>
              )}
            </div>
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
          <h2 className="text-2xl font-bold">Gestión de Empleados</h2>
          <p className="text-muted-foreground">
            Administra tu equipo de trabajo
          </p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Agregar Empleado
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{employeesByStatus.active.length}</p>
                <p className="text-sm text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{employeesByStatus.onLeave.length}</p>
                <p className="text-sm text-muted-foreground">En Licencia</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{employeesByStatus.terminated.length}</p>
                <p className="text-sm text-muted-foreground">Terminados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{filteredEmployees.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar empleados..."
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
            <SelectItem value="ACTIVE">Activos</SelectItem>
            <SelectItem value="ON_LEAVE">En Licencia</SelectItem>
            <SelectItem value="TERMINATED">Terminados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee List */}
      <div className="space-y-4">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay empleados</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "No se encontraron empleados con los filtros aplicados"
                : "Aún no tienes empleados registrados"
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Agregar Primer Empleado
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Employee Detail Modal would go here */}
      {selectedEmployee && (
        <EmployeeDetailModal 
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onUpdateStatus={updateEmployeeStatus}
        />
      )}
    </div>
  );
}

// Employee Detail Modal Component
function EmployeeDetailModal({ 
  employee, 
  onClose, 
  onUpdateStatus 
}: { 
  employee: Employee;
  onClose: () => void;
  onUpdateStatus: (id: string, status: "ACTIVE" | "TERMINATED" | "ON_LEAVE", notes?: string) => void;
}) {
  const [notes, setNotes] = useState(employee.notes || "");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detalles del Empleado</CardTitle>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Employee Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={employee.employee.profile.avatarUrl} />
              <AvatarFallback>
                {employee.employee.profile.firstName?.[0]}
                {employee.employee.profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">
                {employee.employee.profile.firstName} {employee.employee.profile.lastName}
              </h3>
              <p className="text-muted-foreground">{employee.employee.email}</p>
              <p className="font-medium">{employee.position}</p>
              <Badge className={getStatusColor(employee.status)}>
                {getStatusLabel(employee.status)}
              </Badge>
            </div>
          </div>

          {/* Employment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Fecha de Contratación</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(employee.hiredAt).toLocaleDateString()}
              </p>
            </div>
            {employee.salary && (
              <div>
                <h4 className="font-semibold mb-2">Salario</h4>
                <p className="text-sm text-green-600 font-medium">
                  Bs. {employee.salary.toLocaleString()}
                </p>
              </div>
            )}
            {employee.contractType && (
              <div>
                <h4 className="font-semibold mb-2">Tipo de Contrato</h4>
                <p className="text-sm text-muted-foreground">{employee.contractType}</p>
              </div>
            )}
            {employee.terminatedAt && (
              <div>
                <h4 className="font-semibold mb-2">Fecha de Terminación</h4>
                <p className="text-sm text-red-600">
                  {new Date(employee.terminatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-2">Información de Contacto</h4>
            <div className="space-y-2 text-sm">
              {employee.employee.profile.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.employee.profile.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{employee.employee.email}</span>
              </div>
              {employee.employee.profile.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.employee.profile.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {employee.status === "ACTIVE" && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={() => onUpdateStatus(employee.id, "ON_LEAVE", notes)}
              >
                Poner en Licencia
              </Button>
              <Button 
                variant="destructive"
                onClick={() => onUpdateStatus(employee.id, "TERMINATED", notes)}
              >
                Terminar Contrato
              </Button>
            </div>
          )}
          
          {employee.status === "ON_LEAVE" && (
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => onUpdateStatus(employee.id, "ACTIVE", notes)}
              >
                Reactivar
              </Button>
              <Button 
                variant="destructive"
                onClick={() => onUpdateStatus(employee.id, "TERMINATED", notes)}
              >
                Terminar Contrato
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE": return "bg-green-100 text-green-800";
    case "TERMINATED": return "bg-red-100 text-red-800";
    case "ON_LEAVE": return "bg-yellow-100 text-yellow-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE": return "Activo";
    case "TERMINATED": return "Terminado";
    case "ON_LEAVE": return "En Licencia";
    default: return status;
  }
}
