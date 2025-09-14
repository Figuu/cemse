"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  DollarSign, 
  Briefcase,
  User,
  GraduationCap,
  Building,
  School
} from "lucide-react";
import { useSearch, SearchFilters } from "@/hooks/useSearch";
import { SearchResult } from "@/hooks/useSearch";

interface AdvancedSearchProps {
  className?: string;
}

export function AdvancedSearch({ className }: AdvancedSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [activeTab, setActiveTab] = useState("all");

  const {
    results,
    isLoading,
    error,
    search,
    clearResults
  } = useSearch();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    const searchFilters = {
      ...filters,
      type: activeTab === "all" ? undefined : [activeTab]
    };
    
    await search(query, searchFilters);
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | string[] | { min?: number; max?: number } | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setQuery("");
    clearResults();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "job":
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case "company":
        return <Building className="h-4 w-4 text-green-600" />;
      case "youth":
        return <User className="h-4 w-4 text-purple-600" />;
      case "course":
        return <GraduationCap className="h-4 w-4 text-orange-600" />;
      case "institution":
        return <School className="h-4 w-4 text-indigo-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case "job":
        return "Trabajo";
      case "company":
        return "Empresa";
      case "youth":
        return "Perfil";
      case "course":
        return "Curso";
      case "institution":
        return "Institución";
      default:
        return type;
    }
  };

  const filteredResults = results.filter(result => {
    if (activeTab === "all") return true;
    return result.type === activeTab;
  });

  return (
    <div className={className}>
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Búsqueda Avanzada
          </CardTitle>
          <CardDescription>
            Encuentra trabajos, empresas, personas y cursos con filtros específicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Término de búsqueda</Label>
            <div className="flex space-x-2">
              <Input
                id="search-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar trabajos, empresas, personas..."
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="location"
                  value={filters.location || ""}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  placeholder="Ciudad, país..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={filters.category || ""}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Tecnología</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="finance">Finanzas</SelectItem>
                  <SelectItem value="healthcare">Salud</SelectItem>
                  <SelectItem value="education">Educación</SelectItem>
                  <SelectItem value="design">Diseño</SelectItem>
                  <SelectItem value="engineering">Ingeniería</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experiencia</Label>
              <Select
                value={filters.experience || ""}
                onValueChange={(value) => handleFilterChange("experience", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nivel de experiencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Principiante (0-2 años)</SelectItem>
                  <SelectItem value="mid">Intermedio (2-5 años)</SelectItem>
                  <SelectItem value="senior">Avanzado (5-10 años)</SelectItem>
                  <SelectItem value="expert">Experto (10+ años)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salario (USD)</Label>
              <div className="flex space-x-2">
                <Input
                  id="salary-min"
                  type="number"
                  placeholder="Mín"
                  value={filters.salary?.min || ""}
                  onChange={(e) => handleFilterChange("salary", {
                    ...filters.salary,
                    min: parseInt(e.target.value) || 0
                  })}
                />
                <Input
                  id="salary-max"
                  type="number"
                  placeholder="Máx"
                  value={filters.salary?.max || ""}
                  onChange={(e) => handleFilterChange("salary", {
                    ...filters.salary,
                    max: parseInt(e.target.value) || 0
                  })}
                />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.location || filters.category || filters.experience || filters.salary) && (
            <div className="space-y-2">
              <Label>Filtros activos</Label>
              <div className="flex flex-wrap gap-2">
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{filters.location}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange("location", undefined)}
                    />
                  </Badge>
                )}
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Filter className="h-3 w-3" />
                    <span>{filters.category}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange("category", undefined)}
                    />
                  </Badge>
                )}
                {filters.experience && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{filters.experience}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange("experience", undefined)}
                    />
                  </Badge>
                )}
                {filters.salary && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>
                      ${filters.salary.min} - ${filters.salary.max}
                    </span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange("salary", undefined)}
                    />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2"
                >
                  Limpiar todo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resultados de búsqueda</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {filteredResults.length} resultado{filteredResults.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="job">Trabajos</TabsTrigger>
                <TabsTrigger value="company">Empresas</TabsTrigger>
                <TabsTrigger value="youth">Personas</TabsTrigger>
                <TabsTrigger value="course">Cursos</TabsTrigger>
                <TabsTrigger value="institution">Instituciones</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Buscando...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-destructive">
                    <p className="text-sm">{error}</p>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="space-y-4">
                    {filteredResults.map((result, index) => (
                      <div
                        key={`${result.type}-${result.id}-${index}`}
                        onClick={() => handleResultClick(result)}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getResultIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium truncate">
                                {result.title}
                              </h3>
                              <Badge variant="outline">
                                {getResultTypeLabel(result.type)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {result.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              {result.metadata.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{String(result.metadata.location)}</span>
                                </div>
                              )}
                              {result.metadata.salary && (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{String(result.metadata.salary)}</span>
                                </div>
                              )}
                              {result.metadata.company && (
                                <div className="flex items-center space-x-1">
                                  <Building className="h-3 w-3" />
                                  <span>{String(result.metadata.company)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No se encontraron resultados
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Intenta ajustar tus filtros de búsqueda
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
