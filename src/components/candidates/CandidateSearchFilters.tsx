"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  X, 
  Plus,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Globe,
  GraduationCap,
  Briefcase
} from "lucide-react";
import { 
  CandidateSearchFilters, 
  COMMON_SKILLS, 
  COMMON_LANGUAGES, 
  EXPERIENCE_LEVELS, 
  AVAILABILITY_OPTIONS, 
  WORK_ARRANGEMENT_OPTIONS, 
  SORT_OPTIONS 
} from "@/hooks/useCandidates";

interface CandidateSearchFiltersProps {
  filters: CandidateSearchFilters;
  onFiltersChange: (filters: CandidateSearchFilters) => void;
  onSearch: (search: string) => void;
  onClearFilters: () => void;
}

export function CandidateSearchFilters({ 
  filters, 
  onFiltersChange, 
  onSearch,
  onClearFilters 
}: CandidateSearchFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const handleFilterChange = (key: keyof CandidateSearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !filters.skills?.includes(newSkill.trim())) {
      const currentSkills = filters.skills || [];
      handleFilterChange("skills", [...currentSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = filters.skills || [];
    handleFilterChange("skills", currentSkills.filter(skill => skill !== skillToRemove));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !filters.languages?.includes(newLanguage.trim())) {
      const currentLanguages = filters.languages || [];
      handleFilterChange("languages", [...currentLanguages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    const currentLanguages = filters.languages || [];
    handleFilterChange("languages", currentLanguages.filter(lang => lang !== languageToRemove));
  };

  const hasActiveFilters = 
    filters.search || 
    filters.skills?.length || 
    filters.experienceLevel || 
    filters.location || 
    filters.availability || 
    filters.education || 
    filters.languages?.length || 
    filters.salaryMin || 
    filters.salaryMax || 
    filters.workArrangement;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Buscar Candidatos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="space-y-2">
          <Label htmlFor="search">Buscar candidatos</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search"
              placeholder="Nombre, habilidades, ubicación..."
              value={filters.search || ""}
              onChange={(e) => {
                handleFilterChange("search", e.target.value);
                onSearch(e.target.value);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Nivel de Experiencia</Label>
              <select
                id="experienceLevel"
                value={filters.experienceLevel || ""}
                onChange={(e) => handleFilterChange("experienceLevel", e.target.value || undefined)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos los niveles</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="location"
                  placeholder="Ciudad, país..."
                  value={filters.location || ""}
                  onChange={(e) => handleFilterChange("location", e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilidad</Label>
              <select
                id="availability"
                value={filters.availability || ""}
                onChange={(e) => handleFilterChange("availability", e.target.value || undefined)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Cualquier disponibilidad</option>
                {AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workArrangement">Modalidad de Trabajo</Label>
              <select
                id="workArrangement"
                value={filters.workArrangement || ""}
                onChange={(e) => handleFilterChange("workArrangement", e.target.value || undefined)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Cualquier modalidad</option>
                {WORK_ARRANGEMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortBy">Ordenar por</Label>
              <select
                id="sortBy"
                value={filters.sortBy || "relevance"}
                onChange={(e) => handleFilterChange("sortBy", e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros Avanzados
          </Button>
          
          {hasActiveFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="space-y-6 border-t pt-6">
            {/* Skills */}
            <div className="space-y-3">
              <Label>Habilidades Técnicas</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Agregar habilidad..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {filters.skills?.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                Habilidades populares: {COMMON_SKILLS.slice(0, 10).join(", ")}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-3">
              <Label>Idiomas</Label>
              <div className="flex gap-2">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Agregar idioma..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                />
                <Button type="button" onClick={addLanguage} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {filters.languages?.map((language) => (
                  <Badge key={language} variant="outline" className="flex items-center gap-1">
                    {language}
                    <button
                      type="button"
                      onClick={() => removeLanguage(language)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                Idiomas populares: {COMMON_LANGUAGES.slice(0, 10).join(", ")}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <Label htmlFor="education">Educación</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="education"
                  placeholder="Título, universidad, campo de estudio..."
                  value={filters.education || ""}
                  onChange={(e) => handleFilterChange("education", e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Salary Expectations */}
            <div className="space-y-3">
              <Label>Expectativas Salariales</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Salario Mínimo</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder="0"
                      value={filters.salaryMin || ""}
                      onChange={(e) => handleFilterChange("salaryMin", e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Salario Máximo</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder="0"
                      value={filters.salaryMax || ""}
                      onChange={(e) => handleFilterChange("salaryMax", e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <select
                    id="currency"
                    value={filters.currency || "USD"}
                    onChange={(e) => handleFilterChange("currency", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="USD">USD</option>
                    <option value="BOB">BOB</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filtros Activos:</Label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Búsqueda: {filters.search}
                  <button
                    type="button"
                    onClick={() => handleFilterChange("search", undefined)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.experienceLevel && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Experiencia: {EXPERIENCE_LEVELS.find(exp => exp.value === filters.experienceLevel)?.label}
                  <button
                    type="button"
                    onClick={() => handleFilterChange("experienceLevel", undefined)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Ubicación: {filters.location}
                  <button
                    type="button"
                    onClick={() => handleFilterChange("location", undefined)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.availability && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Disponibilidad: {AVAILABILITY_OPTIONS.find(avail => avail.value === filters.availability)?.label}
                  <button
                    type="button"
                    onClick={() => handleFilterChange("availability", undefined)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.skills?.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.languages?.map((language) => (
                <Badge key={language} variant="outline" className="flex items-center gap-1">
                  {language}
                  <button
                    type="button"
                    onClick={() => removeLanguage(language)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
