"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  X, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  GraduationCap,
  Wifi,
  Filter
} from "lucide-react";
import { useJobSkills } from "@/hooks/useJobSkills";

interface JobFiltersProps {
  filters: {
    type: string;
    experience: string;
    salaryMin: string;
    salaryMax: string;
    remote: string;
    skills: string[];
  };
  selectedMunicipality: string;
  onMunicipalityChange: (value: string) => void;
  municipalityInstitutions: Array<{ id: string; name: string }>;
  onFiltersChange: (filters: {
    type: string;
    experience: string;
    salaryMin: string;
    salaryMax: string;
    remote: string;
    skills: string[];
  }) => void;
  onClearFilters: () => void;
}


const jobTypes = [
  { value: "full-time", label: "Tiempo Completo" },
  { value: "part-time", label: "Medio Tiempo" },
  { value: "contract", label: "Contrato" },
  { value: "internship", label: "Prácticas" }
];

const experienceLevels = [
  { value: "0-1", label: "0-1 años" },
  { value: "2-3", label: "2-3 años" },
  { value: "4-5", label: "4-5 años" },
  { value: "6-10", label: "6-10 años" },
  { value: "10+", label: "10+ años" }
];

export function JobFilters({ filters, selectedMunicipality, onMunicipalityChange, municipalityInstitutions, onFiltersChange, onClearFilters }: JobFiltersProps) {
  const { data: skillsData, isLoading: skillsLoading } = useJobSkills();
  const availableSkills = skillsData?.skills || [];

  const handleFilterChange = (key: string, value: string | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    } as {
      type: string;
      experience: string;
      salaryMin: string;
      salaryMax: string;
      remote: string;
      skills: string[];
    });
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    
    handleFilterChange("skills", newSkills);
  };

  const removeSkill = (skill: string) => {
    handleFilterChange("skills", filters.skills.filter(s => s !== skill));
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== "all" && value !== ""
  ) || selectedMunicipality !== "all";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
        <CardDescription>
          Refina tu búsqueda para encontrar el trabajo perfecto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Municipality Filter */}
        <div>
          <Label className="flex items-center mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            Municipio
          </Label>
          <Select
            value={selectedMunicipality}
            onValueChange={onMunicipalityChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona municipio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los municipios</SelectItem>
              {municipalityInstitutions.map((institution) => (
                <SelectItem key={institution.id} value={institution.name}>
                  {institution.name}
                </SelectItem>
              ))}
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Type Filter */}
        <div>
          <Label className="flex items-center mb-2">
            <Briefcase className="h-4 w-4 mr-2" />
            Tipo de Trabajo
          </Label>
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tipo" />
            </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Todos los tipos</SelectItem>
               {jobTypes.map(type => (
                 <SelectItem key={type.value} value={type.value}>
                   {type.label}
                 </SelectItem>
               ))}
             </SelectContent>
          </Select>
        </div>

        {/* Experience Level Filter */}
        <div>
          <Label className="flex items-center mb-2">
            <GraduationCap className="h-4 w-4 mr-2" />
            Nivel de Experiencia
          </Label>
          <Select
            value={filters.experience}
            onValueChange={(value) => handleFilterChange("experience", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona experiencia" />
            </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Todos los niveles</SelectItem>
               {experienceLevels.map(level => (
                 <SelectItem key={level.value} value={level.value}>
                   {level.label}
                 </SelectItem>
               ))}
             </SelectContent>
          </Select>
        </div>

        {/* Salary Range Filter */}
        <div>
          <Label className="flex items-center mb-2">
            <DollarSign className="h-4 w-4 mr-2" />
            Rango Salarial (BOB)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="salaryMin" className="text-sm text-muted-foreground">
                Salario Mínimo
              </Label>
              <Input
                id="salaryMin"
                type="number"
                placeholder="Ej: 5000"
                value={filters.salaryMin}
                onChange={(e) => handleFilterChange("salaryMin", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="salaryMax" className="text-sm text-muted-foreground">
                Salario Máximo
              </Label>
              <Input
                id="salaryMax"
                type="number"
                placeholder="Ej: 15000"
                value={filters.salaryMax}
                onChange={(e) => handleFilterChange("salaryMax", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Remote Work Filter */}
        <div>
          <Label className="flex items-center mb-2">
            <Wifi className="h-4 w-4 mr-2" />
            Trabajo Remoto
          </Label>
          <Select
            value={filters.remote}
            onValueChange={(value) => handleFilterChange("remote", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona opción" />
            </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Todas las opciones</SelectItem>
               <SelectItem value="yes">Solo remoto</SelectItem>
               <SelectItem value="no">Solo presencial</SelectItem>
               <SelectItem value="hybrid">Híbrido</SelectItem>
             </SelectContent>
          </Select>
        </div>

        {/* Skills Filter */}
        <div>
          <Label className="mb-2 block">Habilidades</Label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {filters.skills.map(skill => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeSkill(skill)}
                >
                  {skill}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            {skillsLoading ? (
              <div className="text-sm text-muted-foreground">Cargando habilidades...</div>
            ) : (
              <div className="max-h-32 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {availableSkills.map(skill => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={filters.skills.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <Label
                        htmlFor={skill}
                        className="text-sm cursor-pointer"
                      >
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Filtros activos:</span>
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                Limpiar todos
              </Button>
            </div>
             <div className="flex flex-wrap gap-2">
               {filters.type && filters.type !== "all" && (
                 <Badge variant="outline">
                   Tipo: {jobTypes.find(t => t.value === filters.type)?.label}
                   <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("type", "all")} />
                 </Badge>
               )}
               {filters.experience && filters.experience !== "all" && (
                 <Badge variant="outline">
                   Experiencia: {experienceLevels.find(e => e.value === filters.experience)?.label}
                   <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("experience", "all")} />
                 </Badge>
               )}
               {(filters.salaryMin || filters.salaryMax) && (
                 <Badge variant="outline">
                   Salario: {filters.salaryMin && filters.salaryMax 
                     ? `${filters.salaryMin} - ${filters.salaryMax} BOB`
                     : filters.salaryMin 
                       ? `Desde ${filters.salaryMin} BOB`
                       : `Hasta ${filters.salaryMax} BOB`
                   }
                   <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => {
                     handleFilterChange("salaryMin", "");
                     handleFilterChange("salaryMax", "");
                   }} />
                 </Badge>
               )}
               {filters.remote && filters.remote !== "all" && (
                 <Badge variant="outline">
                   Remoto: {filters.remote === "yes" ? "Sí" : filters.remote === "no" ? "No" : "Híbrido"}
                   <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("remote", "all")} />
                 </Badge>
               )}
               {selectedMunicipality !== "all" && (
                 <Badge variant="outline">
                   Municipio: {selectedMunicipality}
                   <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onMunicipalityChange("all")} />
                 </Badge>
               )}
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
