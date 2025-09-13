"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Star,
  Clock,
  RefreshCw
} from "lucide-react";

export interface StartupFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  businessStage?: string;
  municipality?: string;
  department?: string;
  minEmployees?: number;
  maxEmployees?: number;
  minRevenue?: number;
  maxRevenue?: number;
  foundedAfter?: string;
  foundedBefore?: string;
  hasWebsite?: boolean;
  hasSocialMedia?: boolean;
  isPublic?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface StartupFiltersProps {
  filters: StartupFilters;
  onFiltersChange: (filters: StartupFilters) => void;
  onReset: () => void;
  onApply: () => void;
  isLoading?: boolean;
  className?: string;
}

const categories = [
  "AgTech",
  "FinTech", 
  "EdTech",
  "HealthTech",
  "E-commerce",
  "SaaS",
  "IoT",
  "AI/ML",
  "Blockchain",
  "GreenTech",
  "FoodTech",
  "PropTech",
  "TravelTech",
  "Other"
];

const subcategories = {
  "AgTech": ["Precision Agriculture", "Food Processing", "Supply Chain", "Other"],
  "FinTech": ["Payments", "Lending", "Insurance", "Investment", "Other"],
  "EdTech": ["Online Learning", "Educational Tools", "Student Management", "Other"],
  "HealthTech": ["Telemedicine", "Medical Devices", "Health Data", "Other"],
  "E-commerce": ["Marketplace", "B2B", "B2C", "D2C", "Other"],
  "SaaS": ["CRM", "ERP", "Project Management", "Analytics", "Other"],
  "IoT": ["Smart Home", "Industrial IoT", "Wearables", "Other"],
  "AI/ML": ["Computer Vision", "NLP", "Predictive Analytics", "Other"],
  "Blockchain": ["DeFi", "NFTs", "Supply Chain", "Other"],
  "GreenTech": ["Renewable Energy", "Waste Management", "Carbon Tracking", "Other"],
  "FoodTech": ["Food Delivery", "Meal Planning", "Food Safety", "Other"],
  "PropTech": ["Real Estate", "Property Management", "Construction", "Other"],
  "TravelTech": ["Booking", "Travel Planning", "Transportation", "Other"],
  "Other": ["Other"]
};

const businessStages = [
  { value: "IDEA", label: "Idea", color: "bg-blue-100 text-blue-800" },
  { value: "STARTUP", label: "Startup", color: "bg-yellow-100 text-yellow-800" },
  { value: "GROWING", label: "Creciendo", color: "bg-green-100 text-green-800" },
  { value: "ESTABLISHED", label: "Establecida", color: "bg-purple-100 text-purple-800" }
];

const municipalities = [
  "Cochabamba",
  "Sacaba", 
  "Quillacollo",
  "Villa Tunari",
  "Puerto Villarroel",
  "Shinahota",
  "Aiquile",
  "Tarata",
  "Cliza",
  "Punata",
  "Arani",
  "Vacas",
  "Tolata",
  "Tiraque",
  "Mizque",
  "Omereque",
  "Pasorapa",
  "Pojo",
  "Totora",
  "Villa Rivero",
  "Other"
];

const departments = [
  "Cochabamba",
  "La Paz",
  "Santa Cruz",
  "Potosí",
  "Oruro",
  "Chuquisaca",
  "Tarija",
  "Beni",
  "Pando"
];

const sortOptions = [
  { value: "createdAt", label: "Fecha de creación" },
  { value: "name", label: "Nombre" },
  { value: "viewsCount", label: "Vistas" },
  { value: "rating", label: "Rating" },
  { value: "employees", label: "Número de empleados" },
  { value: "annualRevenue", label: "Ingresos anuales" },
  { value: "founded", label: "Fecha de fundación" }
];

export function StartupFilters({
  filters,
  onFiltersChange,
  onReset,
  onApply,
  isLoading = false,
  className = "",
}: StartupFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const updateFilter = (key: keyof StartupFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
    
    // Update active filters
    if (value && value !== "" && value !== false) {
      if (!activeFilters.includes(key)) {
        setActiveFilters([...activeFilters, key]);
      }
    } else {
      setActiveFilters(activeFilters.filter(f => f !== key));
    }
  };

  const removeFilter = (key: keyof StartupFilters) => {
    const newFilters = { ...filters, [key]: undefined };
    onFiltersChange(newFilters);
    setActiveFilters(activeFilters.filter(f => f !== key));
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== "" && value !== false
    ).length;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary">{getActiveFilterCount()}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Refina tu búsqueda de startups
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Ocultar" : "Mostrar"} Detalles
            </Button>
            {getActiveFilterCount() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Búsqueda</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar startups, fundadores, descripciones..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Select
            value={filters.category || ""}
            onValueChange={(value) => updateFilter("category", value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.businessStage || ""}
            onValueChange={(value) => updateFilter("businessStage", value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {businessStages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.municipality || ""}
            onValueChange={(value) => updateFilter("municipality", value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Municipio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {municipalities.map((municipality) => (
                <SelectItem key={municipality} value={municipality}>
                  {municipality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy || "createdAt"}
            onValueChange={(value) => updateFilter("sortBy", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="space-y-2">
            <Label>Filtros Activos</Label>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filterKey) => {
                const value = filters[filterKey as keyof StartupFilters];
                if (!value) return null;

                let displayValue = value;
                if (filterKey === "businessStage") {
                  const stage = businessStages.find(s => s.value === value);
                  displayValue = stage?.label || value;
                } else if (filterKey === "minEmployees" || filterKey === "maxEmployees") {
                  displayValue = `${value} empleados`;
                } else if (filterKey === "minRevenue" || filterKey === "maxRevenue") {
                  displayValue = formatCurrency(value);
                }

                return (
                  <Badge
                    key={filterKey}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {filterKey}: {displayValue}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFilter(filterKey as keyof StartupFilters)}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Subcategory */}
            {filters.category && subcategories[filters.category as keyof typeof subcategories] && (
              <div className="space-y-2">
                <Label>Subcategoría</Label>
                <Select
                  value={filters.subcategory || ""}
                  onValueChange={(value) => updateFilter("subcategory", value === "all" ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {subcategories[filters.category as keyof typeof subcategories].map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Location */}
            <div className="space-y-4">
              <Label>Ubicación</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select
                    value={filters.department || ""}
                    onValueChange={(value) => updateFilter("department", value === "all" ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Team Size */}
            <div className="space-y-4">
              <Label>Tamaño del Equipo</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Mínimo: {filters.minEmployees || 0}</span>
                  <span>Máximo: {filters.maxEmployees || 1000}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.minEmployees || ""}
                    onChange={(e) => updateFilter("minEmployees", e.target.value ? parseInt(e.target.value) : undefined)}
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={filters.maxEmployees || ""}
                    onChange={(e) => updateFilter("maxEmployees", e.target.value ? parseInt(e.target.value) : undefined)}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Revenue Range */}
            <div className="space-y-4">
              <Label>Ingresos Anuales (USD)</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Mínimo: {formatCurrency(filters.minRevenue || 0)}</span>
                  <span>Máximo: {formatCurrency(filters.maxRevenue || 1000000)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.minRevenue || ""}
                    onChange={(e) => updateFilter("minRevenue", e.target.value ? parseInt(e.target.value) : undefined)}
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={filters.maxRevenue || ""}
                    onChange={(e) => updateFilter("maxRevenue", e.target.value ? parseInt(e.target.value) : undefined)}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Founded Date Range */}
            <div className="space-y-4">
              <Label>Fecha de Fundación</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="foundedAfter">Después de</Label>
                  <Input
                    id="foundedAfter"
                    type="date"
                    value={filters.foundedAfter || ""}
                    onChange={(e) => updateFilter("foundedAfter", e.target.value || undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundedBefore">Antes de</Label>
                  <Input
                    id="foundedBefore"
                    type="date"
                    value={filters.foundedBefore || ""}
                    onChange={(e) => updateFilter("foundedBefore", e.target.value || undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="space-y-4">
              <Label>Filtros Adicionales</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasWebsite"
                    checked={filters.hasWebsite || false}
                    onCheckedChange={(checked) => updateFilter("hasWebsite", checked)}
                  />
                  <Label htmlFor="hasWebsite">Tiene sitio web</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasSocialMedia"
                    checked={filters.hasSocialMedia || false}
                    onCheckedChange={(checked) => updateFilter("hasSocialMedia", checked)}
                  />
                  <Label htmlFor="hasSocialMedia">Tiene redes sociales</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={filters.isPublic !== false}
                    onCheckedChange={(checked) => updateFilter("isPublic", checked)}
                  />
                  <Label htmlFor="isPublic">Público</Label>
                </div>
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label>Orden</Label>
              <Select
                value={filters.sortOrder || "desc"}
                onValueChange={(value) => updateFilter("sortOrder", value as "asc" | "desc")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona orden" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascendente</SelectItem>
                  <SelectItem value="desc">Descendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Apply Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onApply} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Aplicando...
              </>
            ) : (
              <>
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
