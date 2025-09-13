"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Star,
  Filter,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileSearchFiltersProps {
  onFiltersChange: (filters: ProfileFilters) => void;
  className?: string;
}

export interface ProfileFilters {
  search: string;
  location: string;
  experience: string;
  educationLevel: string;
  skills: string[];
  sortBy: string;
  minRating: number;
  isAvailable: boolean | null;
  isVerified: boolean | null;
  page: number;
  limit: number;
}

const locations = [
  "all", "La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", 
  "Tarija", "Beni", "Pando", "Chuquisaca"
];

const experienceLevels = [
  { value: "all", label: "Todos los niveles" },
  { value: "NO_EXPERIENCE", label: "Sin experiencia" },
  { value: "ENTRY_LEVEL", label: "Nivel inicial (0-2 años)" },
  { value: "MID_LEVEL", label: "Nivel medio (3-5 años)" },
  { value: "SENIOR_LEVEL", label: "Nivel senior (5+ años)" }
];

const educationLevels = [
  { value: "all", label: "Todos los niveles" },
  { value: "HIGH_SCHOOL", label: "Bachillerato" },
  { value: "TECHNICAL", label: "Técnico" },
  { value: "BACHELOR", label: "Licenciatura" },
  { value: "MASTER", label: "Maestría" },
  { value: "PHD", label: "Doctorado" }
];

const sortOptions = [
  { value: "relevance", label: "Relevancia" },
  { value: "name", label: "Nombre A-Z" },
  { value: "name-desc", label: "Nombre Z-A" },
  { value: "rating", label: "Mejor calificados" },
  { value: "recent", label: "Más recientes" },
  { value: "lastActive", label: "Última actividad" },
  { value: "experience", label: "Más experiencia" }
];

const popularSkills = [
  "React", "TypeScript", "Node.js", "MongoDB", "PostgreSQL", "AWS", "Docker",
  "Python", "Java", "JavaScript", "Vue.js", "Angular", "PHP", "Laravel",
  "Google Ads", "Facebook Ads", "Analytics", "SEO", "Figma", "Adobe XD",
  "Marketing Digital", "Ventas", "Atención al Cliente", "Gestión de Proyectos"
];

export function ProfileSearchFilters({ onFiltersChange, className }: ProfileSearchFiltersProps) {
  const [filters, setFilters] = useState<ProfileFilters>({
    search: "",
    location: "all",
    experience: "all",
    educationLevel: "all",
    skills: [],
    sortBy: "relevance",
    minRating: 0,
    isAvailable: null,
    isVerified: null,
    page: 1,
    limit: 20
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const updateFilters = (newFilters: Partial<ProfileFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset to page 1 when filters change
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSkills);
    updateFilters({ skills: newSkills });
  };

  const clearFilters = () => {
    const clearedFilters: ProfileFilters = {
      search: "",
      location: "all",
      experience: "all",
      educationLevel: "all",
      skills: [],
      sortBy: "relevance",
      minRating: 0,
      isAvailable: null,
      isVerified: null,
      page: 1,
      limit: 20
    };
    setFilters(clearedFilters);
    setSelectedSkills([]);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.search || 
    filters.location !== "all" || 
    filters.experience !== "all" || 
    filters.educationLevel !== "all" || 
    filters.skills.length > 0 || 
    filters.minRating > 0 || 
    filters.isAvailable !== null || 
    filters.isVerified !== null;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros de Búsqueda
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAdvancedFilters ? "Menos" : "Más"} filtros
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, habilidades, universidad, título..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Ubicación</label>
            <Select value={filters.location} onValueChange={(value) => updateFilters({ location: value })}>
              <SelectTrigger>
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Seleccionar ubicación" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location === "all" ? "Todas las ubicaciones" : location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Experiencia</label>
            <Select value={filters.experience} onValueChange={(value) => updateFilters({ experience: value })}>
              <SelectTrigger>
                <Briefcase className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Seleccionar experiencia" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Ordenar por</label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar orden" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Skills Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Habilidades</label>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map(skill => (
              <Button
                key={skill}
                variant={selectedSkills.includes(skill) ? "default" : "outline"}
                size="sm"
                onClick={() => handleSkillToggle(skill)}
                className="h-8"
              >
                {skill}
                {selectedSkills.includes(skill) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Button>
            ))}
          </div>
          {selectedSkills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedSkills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Filtros Avanzados</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nivel de Educación</label>
                <Select value={filters.educationLevel} onValueChange={(value) => updateFilters({ educationLevel: value })}>
                  <SelectTrigger>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Seleccionar educación" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Calificación Mínima</label>
                <div className="space-y-2">
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={([value]) => updateFilters({ minRating: value })}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>0</span>
                    <span className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {filters.minRating}
                    </span>
                    <span>5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAvailable"
                  checked={filters.isAvailable === true}
                  onCheckedChange={(checked) => 
                    updateFilters({ isAvailable: checked ? true : null })
                  }
                />
                <label htmlFor="isAvailable" className="text-sm font-medium">
                  Solo disponibles para trabajo
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVerified"
                  checked={filters.isVerified === true}
                  onCheckedChange={(checked) => 
                    updateFilters({ isVerified: checked ? true : null })
                  }
                />
                <label htmlFor="isVerified" className="text-sm font-medium">
                  Solo perfiles verificados
                </label>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

