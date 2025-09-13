"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  MapPin, 
  Users, 
  Star,
  TrendingUp,
  Eye,
  Briefcase,
  Calendar,
  Globe
} from "lucide-react";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { useCompanies, useFeaturedCompanies } from "@/hooks/useCompanies";
import { CompanySizeLabels } from "@/types/company";
import Link from "next/link";

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: companiesData, isLoading: companiesLoading } = useCompanies({
    page: currentPage,
    limit: 12,
    search: searchTerm,
    industry: selectedIndustry,
    size: selectedSize,
    location: selectedLocation,
    sortBy,
    sortOrder,
  });

  const { data: featuredData, isLoading: featuredLoading } = useFeaturedCompanies();

  const companies = companiesData?.companies || [];
  const pagination = companiesData?.pagination;
  const featuredCompanies = featuredData?.companies || [];

  const industries = [
    "Tecnología",
    "Salud",
    "Finanzas",
    "Educación",
    "Retail",
    "Manufactura",
    "Servicios",
    "Consultoría",
    "Marketing",
    "Diseño",
  ];

  const locations = [
    "La Paz",
    "Santa Cruz",
    "Cochabamba",
    "Oruro",
    "Potosí",
    "Sucre",
    "Tarija",
    "Beni",
    "Pando",
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string, value: string) => {
    switch (filter) {
      case "industry":
        setSelectedIndustry(value);
        break;
      case "size":
        setSelectedSize(value);
        break;
      case "location":
        setSelectedLocation(value);
        break;
    }
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedIndustry("");
    setSelectedSize("");
    setSelectedLocation("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedIndustry || selectedSize || selectedLocation;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Empresas
          </h1>
          <p className="text-muted-foreground">
            Descubre empresas y oportunidades de trabajo
          </p>
        </div>
        <Link href="/companies/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Empresa
          </Button>
        </Link>
      </div>

      {/* Featured Companies */}
      {featuredCompanies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Empresas Destacadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {featuredLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 bg-muted rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-full"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCompanies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    variant="featured"
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Buscar y Filtrar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Industria</label>
              <select
                value={selectedIndustry}
                onChange={(e) => handleFilterChange("industry", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todas las industrias</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tamaño</label>
              <select
                value={selectedSize}
                onChange={(e) => handleFilterChange("size", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos los tamaños</option>
                {Object.entries(CompanySizeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ubicación</label>
              <select
                value={selectedLocation}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todas las ubicaciones</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ordenar por</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-");
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder as "asc" | "desc");
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="createdAt-desc">Más recientes</option>
                <option value="createdAt-asc">Más antiguos</option>
                <option value="name-asc">Nombre A-Z</option>
                <option value="name-desc">Nombre Z-A</option>
                <option value="totalJobs-desc">Más trabajos</option>
                <option value="averageRating-desc">Mejor calificados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Empresas ({pagination?.total || 0})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === "totalJobs" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("totalJobs")}
              >
                <Briefcase className="h-4 w-4 mr-1" />
                Más Trabajos
              </Button>
              <Button
                variant={sortBy === "averageRating" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("averageRating")}
              >
                <Star className="h-4 w-4 mr-1" />
                Mejor Calificados
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {companiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 bg-muted rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : companies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    variant="default"
                    showActions={true}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                    {pagination.total} empresas
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron empresas</h3>
              <p className="text-muted-foreground mb-4">
                Intenta ajustar tus filtros de búsqueda
              </p>
              <Button onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
