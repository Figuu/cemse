"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

interface JobFiltersProps {
  filters: {
    location: string;
    type: string;
    experience: string;
    salary: string;
    remote: string;
    skills: string[];
  };
  onFiltersChange: (filters: {
    location: string;
    type: string;
    experience: string;
    salary: string;
    remote: string;
    skills: string[];
  }) => void;
  onClearFilters: () => void;
}

const locations = [
  "Ciudad de México",
  "Guadalajara",
  "Monterrey",
  "Puebla",
  "Tijuana",
  "León",
  "Juárez",
  "Torreón",
  "Querétaro",
  "San Luis Potosí"
];

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

const salaryRanges = [
  { value: "0-15000", label: "Hasta $15,000" },
  { value: "15000-25000", label: "$15,000 - $25,000" },
  { value: "25000-40000", label: "$25,000 - $40,000" },
  { value: "40000-60000", label: "$40,000 - $60,000" },
  { value: "60000+", label: "Más de $60,000" }
];

const popularSkills = [
  "JavaScript",
  "React",
  "Python",
  "Java",
  "Node.js",
  "TypeScript",
  "Angular",
  "Vue.js",
  "PHP",
  "Laravel",
  "Django",
  "Flask",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Kubernetes",
  "Git",
  "Figma",
  "Photoshop",
  "Illustrator",
  "Marketing Digital",
  "SEO",
  "Google Ads",
  "Facebook Ads",
  "Analytics",
  "Excel",
  "Power BI",
  "Tableau"
];

export function JobFilters({ filters, onFiltersChange, onClearFilters }: JobFiltersProps) {
  const handleFilterChange = (key: string, value: string | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    } as {
      location: string;
      type: string;
      experience: string;
      salary: string;
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
    Array.isArray(value) ? value.length > 0 : value !== ""
  );

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
        {/* Location Filter */}
        <div>
          <Label className="flex items-center mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            Ubicación
          </Label>
          <Select
            value={filters.location}
            onValueChange={(value) => handleFilterChange("location", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las ubicaciones</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
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
              <SelectItem value="">Todos los tipos</SelectItem>
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
              <SelectItem value="">Todos los niveles</SelectItem>
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
            Rango Salarial
          </Label>
          <Select
            value={filters.salary}
            onValueChange={(value) => handleFilterChange("salary", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los rangos</SelectItem>
              {salaryRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <SelectItem value="">Todas las opciones</SelectItem>
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
            <div className="max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {popularSkills.map(skill => (
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
              {filters.location && (
                <Badge variant="outline">
                  Ubicación: {filters.location}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("location", "")} />
                </Badge>
              )}
              {filters.type && (
                <Badge variant="outline">
                  Tipo: {jobTypes.find(t => t.value === filters.type)?.label}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("type", "")} />
                </Badge>
              )}
              {filters.experience && (
                <Badge variant="outline">
                  Experiencia: {experienceLevels.find(e => e.value === filters.experience)?.label}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("experience", "")} />
                </Badge>
              )}
              {filters.salary && (
                <Badge variant="outline">
                  Salario: {salaryRanges.find(s => s.value === filters.salary)?.label}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("salary", "")} />
                </Badge>
              )}
              {filters.remote && (
                <Badge variant="outline">
                  Remoto: {filters.remote === "yes" ? "Sí" : filters.remote === "no" ? "No" : "Híbrido"}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("remote", "")} />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
