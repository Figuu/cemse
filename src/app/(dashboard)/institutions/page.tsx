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
  department: string;
  region?: string;
  institutionType: "MUNICIPALITY" | "NGO" | "TRAINING_CENTER" | "FOUNDATION" | "OTHER";
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  _count: {
    companies: number;
    profiles: number;
    courses: number;
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
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
    industry: typeFilter !== "all" ? typeFilter : undefined,
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    fetchInstitutions();
  }, [debouncedSearchQuery, typeFilter]);

  useEffect(() => {
    filterInstitutions();
  }, [institutions, searchQuery, typeFilter]);

  const fetchInstitutions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (debouncedSearchQuery) {
        params.append("search", debouncedSearchQuery);
      }
      
      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

          const response = await fetch(`/api/institutions?${params.toString()}`);
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
    // Since API now handles most filtering, we just need to do additional client-side filtering if needed
    // For now, we'll use the institutions directly from the API
    setFilteredInstitutions(institutions);
  };

  // Function to normalize industry names
  const normalizeIndustry = (industry: string): string => {
    if (!industry) return '';
    
    return industry
      .toLowerCase()
      .trim()
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (tildes, accents)
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s]/g, '') // Remove special characters except letters, numbers, and spaces
      .trim();
  };

  // Get unique normalized industries from companies
  const getUniqueIndustries = (companies: Company[]): string[] => {
    const industryMap = new Map<string, string>();
    
    companies.forEach(company => {
      if (company.businessSector) {
        const normalized = normalizeIndustry(company.businessSector);
        if (normalized && !industryMap.has(normalized)) {
          // Store the original industry name as the display value
          industryMap.set(normalized, company.businessSector);
        }
      }
    });
    
    return Array.from(industryMap.values()).sort();
  };

  // Filter companies based on search and industry
  const filterCompanies = (companies: Company[]): Company[] => {
    let filtered = companies;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (company.description && company.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (company.location && company.location.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Industry filter with normalization
    if (typeFilter !== "all") {
      filtered = filtered.filter(company => {
        if (!company.businessSector) return false;
        return normalizeIndustry(company.businessSector) === normalizeIndustry(typeFilter);
      });
    }

    return filtered;
  };

  const companies = companiesData?.companies || [];
  const uniqueIndustries = getUniqueIndustries(companies);
  const filteredCompanies = filterCompanies(companies);

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
      case "FOUNDATION":
        return "Fundación";
      case "OTHER":
        return "Otro";
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
      case "FOUNDATION":
        return "bg-orange-100 text-orange-800";
      case "OTHER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const translateResourceType = (type: string) => {
    const translations: { [key: string]: string } = {
      "guide": "Guía",
      "template": "Plantilla",
      "document": "Documento",
      "video": "Video",
      "presentation": "Presentación",
      "worksheet": "Hoja de Trabajo",
      "checklist": "Lista de Verificación",
      "manual": "Manual",
      "handbook": "Manual",
      "tutorial": "Tutorial",
      "course": "Curso",
      "webinar": "Seminario Web",
      "ebook": "Libro Electrónico",
      "pdf": "PDF",
      "image": "Imagen",
      "audio": "Audio",
      "software": "Software",
      "tool": "Herramienta",
      "resource": "Recurso",
      "material": "Material",
      "other": "Otro",
      // Tipos específicos encontrados en la base de datos
      "GUIDE": "Guía",
      "TEMPLATE": "Plantilla",
      "COURSE": "Curso"
    };
    
    return translations[type] || translations[type.toLowerCase()] || type;
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Instituciones y Empresas</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gestiona municipios, ONGs, centros de capacitación y empresas
            </p>
          </div>
          {activeTab === "institutions" && isAdmin && (
            <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Institución
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="institutions" className="text-sm sm:text-base py-2">Instituciones</TabsTrigger>
          <TabsTrigger value="companies" className="text-sm sm:text-base py-2">Empresas</TabsTrigger>
        </TabsList>

        <TabsContent value="institutions" className="space-y-4 sm:space-y-6">
          {/* Filters */}
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
                      <Input
                        placeholder="Buscar instituciones..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 sm:pl-10 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block">Tipo</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        <SelectItem value="MUNICIPALITY">Municipio</SelectItem>
                        <SelectItem value="NGO">ONG</SelectItem>
                        <SelectItem value="TRAINING_CENTER">Centro de Capacitación</SelectItem>
                        <SelectItem value="FOUNDATION">Fundación</SelectItem>
                        <SelectItem value="OTHER">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end sm:col-span-2 lg:col-span-1">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setTypeFilter("all");
                      }}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredInstitutions.map((institution) => (
          <Card key={institution.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarImage src={institution.logoUrl} />
                    <AvatarFallback>
                      <Building className="h-5 w-5 sm:h-6 sm:w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg truncate">{institution.name}</CardTitle>
                    <Badge className={`mt-1 text-xs sm:text-sm ${getTypeColor(institution.institutionType)}`}>
                      {getTypeLabel(institution.institutionType)}
                    </Badge>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingInstitution(institution)}
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteInstitution(institution.id)}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                {institution.description}
              </p>
              
              <div className="space-y-2 mb-3 sm:mb-4">
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{institution.department}{institution.region ? `, ${institution.region}` : ''}</span>
                </div>
                {institution.website && (
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                    <a href={institution.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                      {institution.website}
                    </a>
                  </div>
                )}
                {institution.email && (
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{institution.email}</span>
                  </div>
                )}
                {institution.phone && (
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{institution.phone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center mb-3 sm:mb-4">
                <div>
                  <div className="text-base sm:text-lg font-bold">{institution._count.companies}</div>
                  <div className="text-xs text-muted-foreground">Empresas</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-bold">{institution._count.profiles}</div>
                  <div className="text-xs text-muted-foreground">Perfiles</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-bold">{institution._count?.courses || 0}</div>
                  <div className="text-xs text-muted-foreground">Cursos</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs sm:text-sm"
                  onClick={() => handleViewInstitution(institution)}
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Ver Detalles
                </Button>
                {isAdmin && (
                  <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
              <CardContent className="p-8 sm:p-12 text-center">
                <Building className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">No se encontraron instituciones</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  {searchQuery || typeFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Comienza creando tu primera institución"
                  }
                </p>
                {isAdmin && (
                  <Button onClick={() => setShowCreateForm(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Institución
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="companies" className="space-y-4 sm:space-y-6">
          {/* Companies Filters */}
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
                      <Input
                        placeholder="Buscar empresas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 sm:pl-10 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block">Industria</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue placeholder="Todas las industrias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las industrias</SelectItem>
                        {uniqueIndustries.map((industry, index) => (
                          <SelectItem key={`industry-${index}-${industry}`} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end sm:col-span-2 lg:col-span-1">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setTypeFilter("all");
                      }}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Companies Grid */}
          {companiesLoading ? (
            <div className="flex items-center justify-center h-48 sm:h-64">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                          <AvatarImage src={company.logo} />
                          <AvatarFallback>
                            <Building className="h-5 w-5 sm:h-6 sm:w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg truncate">{company.name}</CardTitle>
                          <Badge className={`mt-1 text-xs sm:text-sm ${getCompanySizeColor(company.size || "")}`}>
                            {getCompanySizeLabel(company.size || "")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                      {company.description}
                    </p>
                    
                    <div className="space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{company.location}</span>
                      </div>
                      {company.website && (
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                          <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                            {company.website}
                          </a>
                        </div>
                      )}
                      {company.email && (
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{company.email}</span>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{company.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center mb-3 sm:mb-4">
                      <div>
                        <div className="text-base sm:text-lg font-bold">{company._count?.jobs || 0}</div>
                        <div className="text-xs text-muted-foreground">Trabajos</div>
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-bold">{company.totalEmployees || 0}</div>
                        <div className="text-xs text-muted-foreground">Empleados</div>
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-bold">{company.views || 0}</div>
                        <div className="text-xs text-muted-foreground">Vistas</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs sm:text-sm"
                        onClick={() => handleViewCompany(company)}
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Ver Detalles
                      </Button>
                      {isAdmin && (
                        <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Gestionar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredCompanies.length === 0 && !companiesLoading && (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <Building className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">No se encontraron empresas</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  {searchQuery || typeFilter !== "all"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <Card className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                    <AvatarImage src={selectedInstitution.logoUrl} />
                    <AvatarFallback>
                      <Building className="h-6 w-6 sm:h-8 sm:w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-2xl truncate">{selectedInstitution.name}</CardTitle>
                    <Badge className={`mt-1 sm:mt-2 text-xs sm:text-sm ${getTypeColor(selectedInstitution.institutionType)}`}>
                      {getTypeLabel(selectedInstitution.institutionType)}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseInstitutionModal}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Información General</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-xs sm:text-sm">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{selectedInstitution.department}{selectedInstitution.region ? `, ${selectedInstitution.region}` : ''}</span>
                    </div>
                    {selectedInstitution.website && (
                      <div className="flex items-center text-xs sm:text-sm">
                        <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        <a href={selectedInstitution.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 truncate">
                          {selectedInstitution.website}
                        </a>
                      </div>
                    )}
                    {selectedInstitution.email && (
                      <div className="flex items-center text-xs sm:text-sm">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{selectedInstitution.email}</span>
                      </div>
                    )}
                    {selectedInstitution.phone && (
                      <div className="flex items-center text-xs sm:text-sm">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{selectedInstitution.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium">Contacto:</span>
                      <p className="text-muted-foreground truncate">
                        {selectedInstitution.creator?.profile?.firstName && selectedInstitution.creator?.profile?.lastName 
                          ? `${selectedInstitution.creator.profile.firstName} ${selectedInstitution.creator.profile.lastName}`
                          : selectedInstitution.creator?.email || 'No disponible'
                        }
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium">Estado:</span>
                      <Badge variant={selectedInstitution.isActive ? "default" : "secondary"} className="ml-2 text-xs">
                        {selectedInstitution.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {selectedInstitution.description || 'No hay descripción disponible'}
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Estadísticas</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-primary">{selectedInstitution._count?.companies || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Empresas</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-primary">{selectedInstitution._count?.profiles || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Perfiles</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-primary">{selectedInstitution._count?.courses || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Cursos</div>
                  </div>
                </div>
              </div>

              {/* Recent Courses */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Cursos Recientes</h3>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary"></div>
                  </div>
                ) : institutionDetails?.recentCourses?.length > 0 ? (
                  <div className="space-y-2">
                    {institutionDetails.recentCourses.map((course: any) => (
                      <div key={course.id} className="p-3 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base truncate">{course.title}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{course.studentsCount} estudiantes</span>
                              <span>•</span>
                              <span>{course.duration} min</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs w-fit">{course.status}</Badge>
                        </div>
                      </div>
                    ))}
                    <div className="text-center py-3 sm:py-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs sm:text-sm"
                        onClick={() => {
                          // Navigate to courses page with institution filter
                          window.open(`/courses?institution=${selectedInstitution?.id}`, '_blank');
                        }}
                      >
                        Ver Todos los Cursos
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <p className="text-xs sm:text-sm">No hay cursos disponibles</p>
                  </div>
                )}
              </div>

              {/* Recent News */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Noticias Recientes</h3>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary"></div>
                  </div>
                ) : institutionDetails?.recentNews?.length > 0 ? (
                  <div className="space-y-2">
                    {institutionDetails.recentNews.map((news: any) => (
                      <div key={news.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base truncate">{news.title}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                              {news.summary}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
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
                    <div className="text-center py-3 sm:py-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs sm:text-sm"
                        onClick={() => {
                          // Navigate to news page with institution filter
                          window.open(`/news?institution=${selectedInstitution?.id}`, '_blank');
                        }}
                      >
                        Ver Todas las Noticias
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <p className="text-xs sm:text-sm">No hay noticias disponibles</p>
                  </div>
                )}
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Recursos Disponibles</h3>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary"></div>
                  </div>
                ) : institutionDetails?.resources?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {institutionDetails.resources.map((resource: any) => (
                      <div key={resource.id} className="p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base truncate">{resource.title}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{resource.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                              <span>{translateResourceType(resource.type)}</span>
                              <span>•</span>
                              <span>{resource.downloads} descargas</span>
                              <span>•</span>
                              <span>{resource.timeAgo}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center py-3 sm:py-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs sm:text-sm"
                        onClick={() => {
                          // Navigate to resources page with institution filter
                          window.open(`/resources?institution=${selectedInstitution?.id}`, '_blank');
                        }}
                      >
                        Ver Todos los Recursos
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <p className="text-xs sm:text-sm">No hay recursos disponibles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Institution Modal */}
      {(showCreateForm || editingInstitution) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <Card className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">
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
            <CardContent className="p-4 sm:p-6">
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
