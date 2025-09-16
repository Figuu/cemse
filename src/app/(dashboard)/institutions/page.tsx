"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Trash2,
  X
} from "lucide-react";
import { InstitutionProfileForm } from "@/components/institutions/InstitutionProfileForm";
import { CompanyDetailsModal } from "@/components/company/CompanyDetailsModal";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/company";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isAdmin = userRole === "SUPERADMIN" || userRole === "INSTITUTION";
  
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [activeTab, setActiveTab] = useState("institutions");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [institutionDetails, setInstitutionDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  // Companies data
  const { data: companiesData, isLoading: companiesLoading } = useCompanies({
    search: searchQuery || undefined,
    location: cityFilter !== "all" ? cityFilter : undefined,
    industry: typeFilter !== "all" ? typeFilter : undefined,
  });

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

  const fetchInstitutionDetails = async (institutionId: string) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`/api/institutions/${institutionId}/details`);
      if (response.ok) {
        const data = await response.json();
        setInstitutionDetails(data.institution);
      } else {
        console.error("Failed to fetch institution details");
      }
    } catch (error) {
      console.error("Error fetching institution details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewInstitution = async (institution: Institution) => {
    setSelectedInstitution(institution);
    setShowInstitutionModal(true);
    await fetchInstitutionDetails(institution.id);
  };

  const handleCloseInstitutionModal = () => {
    setShowInstitutionModal(false);
    setSelectedInstitution(null);
    setInstitutionDetails(null);
  };

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowCompanyModal(true);
  };

  const handleCloseCompanyModal = () => {
    setShowCompanyModal(false);
    setSelectedCompany(null);
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

  const getCompanySizeLabel = (size: string) => {
    switch (size) {
      case "STARTUP":
        return "Startup";
      case "SMALL":
        return "Pequeña";
      case "MEDIUM":
        return "Mediana";
      case "LARGE":
        return "Grande";
      case "ENTERPRISE":
        return "Empresa";
      default:
        return size;
    }
  };

  const getCompanySizeColor = (size: string) => {
    switch (size) {
      case "STARTUP":
        return "bg-orange-100 text-orange-800";
      case "SMALL":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-blue-100 text-blue-800";
      case "LARGE":
        return "bg-purple-100 text-purple-800";
      case "ENTERPRISE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const uniqueCities = Array.from(new Set(institutions.map(i => i.city).filter(Boolean))).sort();
  const companies = companiesData?.companies || [];

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
            <h1 className="text-3xl font-bold">Instituciones y Empresas</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona municipios, ONGs, centros de capacitación y empresas
            </p>
          </div>
          {activeTab === "institutions" && isAdmin && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Institución
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="institutions">Instituciones</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
        </TabsList>

        <TabsContent value="institutions" className="space-y-6">
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
                      {uniqueCities.map((city, index) => (
                        <SelectItem key={`city-${index}-${city}`} value={city}>{city}</SelectItem>
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
                {isAdmin && (
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
                )}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewInstitution(institution)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
                {isAdmin && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    Gestionar
                  </Button>
                )}
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
                {isAdmin && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Institución
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          {/* Companies Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar empresas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Industria</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las industrias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las industrias</SelectItem>
                      <SelectItem value="TECHNOLOGY">Tecnología</SelectItem>
                      <SelectItem value="HEALTHCARE">Salud</SelectItem>
                      <SelectItem value="FINANCE">Finanzas</SelectItem>
                      <SelectItem value="EDUCATION">Educación</SelectItem>
                      <SelectItem value="RETAIL">Retail</SelectItem>
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
                      {uniqueCities.map((city, index) => (
                        <SelectItem key={`city-${index}-${city}`} value={city}>{city}</SelectItem>
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

          {/* Companies Grid */}
          {companiesLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={company.logo} />
                          <AvatarFallback>
                            <Building className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <Badge className={`mt-1 ${getCompanySizeColor(company.size || "")}`}>
                            {getCompanySizeLabel(company.size || "")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {company.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {company.location}
                      </div>
                      {company.website && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Globe className="h-4 w-4 mr-2" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {company.website}
                          </a>
                        </div>
                      )}
                      {company.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          {company.email}
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {company.phone}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold">{company._count?.jobs || 0}</div>
                        <div className="text-xs text-muted-foreground">Trabajos</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{company.totalEmployees || 0}</div>
                        <div className="text-xs text-muted-foreground">Empleados</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{company.views || 0}</div>
                        <div className="text-xs text-muted-foreground">Vistas</div>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewCompany(company)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                      {isAdmin && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <Users className="h-4 w-4 mr-2" />
                          Gestionar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {companies.length === 0 && !companiesLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron empresas</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || typeFilter !== "all" || cityFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "No hay empresas registradas"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Institution Details Modal */}
      {showInstitutionModal && selectedInstitution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedInstitution.logoUrl} />
                    <AvatarFallback>
                      <Building className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{selectedInstitution.name}</CardTitle>
                    <Badge className={`mt-2 ${getTypeColor(selectedInstitution.type)}`}>
                      {getTypeLabel(selectedInstitution.type)}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseInstitutionModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedInstitution.city}, {selectedInstitution.country}</span>
                    </div>
                    {selectedInstitution.website && (
                      <div className="flex items-center text-sm">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a href={selectedInstitution.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">
                          {selectedInstitution.website}
                        </a>
                      </div>
                    )}
                    {selectedInstitution.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{selectedInstitution.email}</span>
                      </div>
                    )}
                    {selectedInstitution.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{selectedInstitution.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Contacto:</span>
                      <p className="text-muted-foreground">
                        {selectedInstitution.user?.profile?.firstName && selectedInstitution.user?.profile?.lastName 
                          ? `${selectedInstitution.user.profile.firstName} ${selectedInstitution.user.profile.lastName}`
                          : selectedInstitution.user?.email || 'No disponible'
                        }
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Estado:</span>
                      <Badge variant={selectedInstitution.isActive ? "default" : "secondary"} className="ml-2">
                        {selectedInstitution.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedInstitution.description || 'No hay descripción disponible'}
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Estadísticas</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{selectedInstitution._count?.courses || 0}</div>
                    <div className="text-sm text-muted-foreground">Cursos</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{selectedInstitution._count?.programs || 0}</div>
                    <div className="text-sm text-muted-foreground">Programas</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{selectedInstitution._count?.students || 0}</div>
                    <div className="text-sm text-muted-foreground">Estudiantes</div>
                  </div>
                </div>
              </div>

              {/* Recent Courses */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Cursos Recientes</h3>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : institutionDetails?.recentCourses?.length > 0 ? (
                  <div className="space-y-2">
                    {institutionDetails.recentCourses.map((course: any) => (
                      <div key={course.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{course.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{course.studentsCount} estudiantes</span>
                              <span>•</span>
                              <span>{course.duration} min</span>
                            </div>
                          </div>
                          <Badge variant="outline">{course.status}</Badge>
                        </div>
                      </div>
                    ))}
                    <div className="text-center py-4">
                      <Button variant="outline" size="sm">
                        Ver Todos los Cursos
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay cursos disponibles</p>
                  </div>
                )}
              </div>

              {/* Recent News */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Noticias Recientes</h3>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : institutionDetails?.recentNews?.length > 0 ? (
                  <div className="space-y-2">
                    {institutionDetails.recentNews.map((news: any) => (
                      <div key={news.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{news.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {news.summary}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{news.timeAgo}</span>
                              <span>•</span>
                              <span>{news.viewCount} vistas</span>
                              <span>•</span>
                              <span>{news.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center py-4">
                      <Button variant="outline" size="sm">
                        Ver Todas las Noticias
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay noticias disponibles</p>
                  </div>
                )}
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Recursos Disponibles</h3>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : institutionDetails?.resources?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {institutionDetails.resources.map((resource: any) => (
                      <div key={resource.id} className="p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{resource.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">{resource.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{resource.type}</span>
                              <span>•</span>
                              <span>{resource.downloads} descargas</span>
                              <span>•</span>
                              <span>{resource.timeAgo}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay recursos disponibles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
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

      {/* Company Details Modal */}
      {showCompanyModal && selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          onClose={handleCloseCompanyModal}
        />
      )}
    </div>
  );
}
