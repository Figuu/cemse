"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Star, 
  MapPin, 
  Briefcase,
  MessageCircle,
  Filter,
  Save,
  User
} from "lucide-react";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { CandidateSearchFilters } from "@/components/candidates/CandidateSearchFilters";
import { useCandidates, CandidateSearchFilters as CandidateFilters } from "@/hooks/useCandidates";
import { RoleGuard } from "@/components/auth/RoleGuard";

function CandidatesPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CandidateFilters>({
    page: 1,
    limit: 12,
    sortBy: "relevance",
    sortOrder: "desc",
  });

  const { data: candidatesData, isLoading } = useCandidates(filters);

  const candidates = candidatesData?.candidates || [];
  const pagination = candidatesData?.pagination;

  const handleFiltersChange = (newFilters: CandidateFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setFilters(prev => ({
      ...prev,
      search,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      page: 1,
      limit: 12,
      sortBy: "relevance",
      sortOrder: "desc",
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  const handleSaveCandidate = (candidateId: string) => {
    // Implement save candidate functionality
    console.log("Saving candidate:", candidateId);
  };

  const handleContactCandidate = (candidateId: string) => {
    // Implement contact candidate functionality
    console.log("Contacting candidate:", candidateId);
  };

  const handleViewCandidate = (candidateId: string) => {
    // Implement view candidate functionality
    console.log("Viewing candidate:", candidateId);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Candidatos
          </h1>
          <p className="text-muted-foreground">
            Encuentra el talento perfecto para tu empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Candidatos Guardados
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Mensajes
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <CandidateSearchFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
      />

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Candidatos Encontrados ({pagination?.total || 0})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={filters.sortBy === "relevance" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, sortBy: "relevance" }))}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Relevancia
                  </Button>
                  <Button
                    variant={filters.sortBy === "experience" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, sortBy: "experience" }))}
                  >
                    <Briefcase className="h-4 w-4 mr-1" />
                    Experiencia
                  </Button>
                  <Button
                    variant={filters.sortBy === "location" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, sortBy: "location" }))}
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Ubicación
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 bg-muted rounded-full"></div>
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
              ) : candidates.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        onSave={handleSaveCandidate}
                        onContact={handleContactCandidate}
                        onView={handleViewCandidate}
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
                        {pagination.total} candidatos
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
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
                                variant={page === pagination.page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
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
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron candidatos</h3>
                  <p className="text-muted-foreground mb-4">
                    Intenta ajustar tus filtros de búsqueda
                  </p>
                  <Button onClick={handleClearFilters}>
                    Limpiar Filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Candidatos</span>
                <span className="font-semibold">{pagination?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Disponibles</span>
                <span className="font-semibold text-green-600">
                  {candidates.filter(c => c.availability === "IMMEDIATE").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Con Experiencia</span>
                <span className="font-semibold">
                  {candidates.filter(c => c.experienceLevel === "SENIOR_LEVEL").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nivel Inicial</span>
                <span className="font-semibold">
                  {candidates.filter(c => c.experienceLevel === "ENTRY_LEVEL").length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Guardar Búsqueda
              </Button>
              <Button className="w-full" variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar Múltiples
              </Button>
              <Button className="w-full" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
            </CardContent>
          </Card>

          {/* Popular Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Habilidades Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["JavaScript", "React", "Python", "Node.js", "TypeScript", "AWS", "Docker", "SQL"].map((skill) => (
                  <Button
                    key={skill}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentSkills = filters.skills || [];
                      if (!currentSkills.includes(skill)) {
                        setFilters(prev => ({
                          ...prev,
                          skills: [...currentSkills, skill],
                          page: 1,
                        }));
                      }
                    }}
                    className="text-xs"
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <RoleGuard allowedRoles={["COMPANIES", "SUPERADMIN"]}>
      <CandidatesPageContent />
    </RoleGuard>
  );
}
