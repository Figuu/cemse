"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Plus, 
  Building, 
  Users, 
  MapPin,
  Globe,
  Phone,
  Mail,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { InstitutionProfileForm } from "@/components/institutions/InstitutionProfileForm";

interface Institution {
  id: string;
  name: string;
  description: string;
  type: "MUNICIPALITY" | "NGO" | "TRAINING_CENTER";
  city: string;
  country: string;
  website?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  _count: {
    courses: number;
    programs: number;
    students: number;
  };
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    filterInstitutions();
  }, [institutions, searchQuery, typeFilter, cityFilter]);

  const fetchInstitutions = async () => {
    try {
      const response = await fetch("/api/institutions");
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data.institutions || []);
      }
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterInstitutions = () => {
    let filtered = institutions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(institution =>
        institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        institution.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        institution.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(institution => institution.type === typeFilter);
    }

    // City filter
    if (cityFilter !== "all") {
      filtered = filtered.filter(institution => institution.city === cityFilter);
    }

    setFilteredInstitutions(filtered);
  };

  const handleCreateInstitution = async (institutionData: Record<string, unknown>) => {
    try {
      const response = await fetch("/api/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(institutionData)
      });

      if (response.ok) {
        await fetchInstitutions();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("Error creating institution:", error);
    }
  };

  const handleUpdateInstitution = async (id: string, institutionData: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/institutions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(institutionData)
      });

      if (response.ok) {
        await fetchInstitutions();
        setEditingInstitution(null);
      }
    } catch (error) {
      console.error("Error updating institution:", error);
    }
  };

  const handleDeleteInstitution = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta institución?")) return;

    try {
      const response = await fetch(`/api/institutions/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await fetchInstitutions();
      }
    } catch (error) {
      console.error("Error deleting institution:", error);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "MUNICIPALITY":
        return "Municipio";
      case "NGO":
        return "ONG";
      case "TRAINING_CENTER":
        return "Centro de Capacitación";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "MUNICIPALITY":
        return "bg-blue-100 text-blue-800";
      case "NGO":
        return "bg-green-100 text-green-800";
      case "TRAINING_CENTER":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const uniqueCities = Array.from(new Set(institutions.map(i => i.city))).sort();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Instituciones</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona municipios, ONGs y centros de capacitación
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Institución
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar instituciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="MUNICIPALITY">Municipio</SelectItem>
                  <SelectItem value="NGO">ONG</SelectItem>
                  <SelectItem value="TRAINING_CENTER">Centro de Capacitación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ciudad</label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ciudades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ciudades</SelectItem>
                  {uniqueCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setCityFilter("all");
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstitutions.map((institution) => (
          <Card key={institution.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={institution.logoUrl} />
                    <AvatarFallback>
                      <Building className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{institution.name}</CardTitle>
                    <Badge className={`mt-1 ${getTypeColor(institution.type)}`}>
                      {getTypeLabel(institution.type)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingInstitution(institution)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteInstitution(institution.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {institution.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {institution.city}, {institution.country}
                </div>
                {institution.website && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Globe className="h-4 w-4 mr-2" />
                    <a href={institution.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {institution.website}
                    </a>
                  </div>
                )}
                {institution.email && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {institution.email}
                  </div>
                )}
                {institution.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {institution.phone}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold">{institution._count.courses}</div>
                  <div className="text-xs text-muted-foreground">Cursos</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{institution._count.programs}</div>
                  <div className="text-xs text-muted-foreground">Programas</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{institution._count.students}</div>
                  <div className="text-xs text-muted-foreground">Estudiantes</div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Gestionar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInstitutions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron instituciones</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || typeFilter !== "all" || cityFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza creando tu primera institución"
              }
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Institución
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Institution Modal */}
      {(showCreateForm || editingInstitution) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingInstitution ? "Editar Institución" : "Nueva Institución"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingInstitution(null);
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <InstitutionProfileForm
                institution={editingInstitution}
                onSubmit={editingInstitution ? 
                  (data) => handleUpdateInstitution(editingInstitution.id, data) :
                  handleCreateInstitution
                }
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingInstitution(null);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
