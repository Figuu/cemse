"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, X } from "lucide-react";
import { EntrepreneurshipsFilters } from "@/hooks/useEntrepreneurships";
import { BusinessStage } from "@prisma/client";

const businessStages: { value: BusinessStage; label: string }[] = [
  { value: "IDEA", label: "Idea" },
  { value: "STARTUP", label: "Startup" },
  { value: "GROWTH", label: "Crecimiento" },
  { value: "MATURE", label: "Maduro" },
  { value: "SCALE", label: "Escalado" },
];

const categories = [
  "Tecnología",
  "Salud",
  "Educación",
  "Finanzas",
  "Comercio",
  "Servicios",
  "Manufactura",
  "Agricultura",
  "Turismo",
  "Entretenimiento",
  "Otros",
];

const municipalities = [
  "Cochabamba",
  "Quillacollo",
  "Sacaba",
  "Tiquipaya",
  "Colcapirhua",
  "Vinto",
  "Sipe Sipe",
  "Tarata",
  "Anzaldo",
  "Arbieto",
  "Capinota",
  "Santivañez",
  "Sicaya",
  "Villa Tunari",
  "Entre Ríos",
  "Shinahota",
  "Puerto Villarroel",
  "Chimoré",
  "Villa 14 de Septiembre",
  "Totora",
  "Pojo",
  "Pocona",
  "Chimboata",
  "Aiquile",
  "Pasorapa",
  "Omereque",
  "Mizque",
  "Vila Vila",
  "Alalay",
  "Independencia",
  "Morochata",
  "Cocapata",
  "Villa José Quintín Mendoza",
  "Arque",
  "Tacopaya",
];

interface EntrepreneurshipFiltersProps {
  filters: EntrepreneurshipsFilters;
  onFiltersChange: (filters: EntrepreneurshipsFilters) => void;
}

export function EntrepreneurshipFilters({ filters, onFiltersChange }: EntrepreneurshipFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: keyof EntrepreneurshipsFilters, value: string) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      category: undefined,
      businessStage: undefined,
      municipality: undefined,
      search: undefined,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setIsOpen(false);
  };

  const hasActiveFilters = filters.category || filters.businessStage || filters.municipality || filters.search;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <span className="absolute -top-2 -right-2 h-5 w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
              {[filters.category, filters.businessStage, filters.municipality, filters.search].filter(Boolean).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2 text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar emprendimientos..."
                  value={localFilters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={localFilters.category || ""}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessStage">Etapa del Negocio</Label>
              <Select
                value={localFilters.businessStage || ""}
                onValueChange={(value) => handleFilterChange("businessStage", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las etapas</SelectItem>
                  {businessStages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="municipality">Municipio</Label>
              <Select
                value={localFilters.municipality || ""}
                onValueChange={(value) => handleFilterChange("municipality", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar municipio" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="">Todos los municipios</SelectItem>
                  {municipalities.map((municipality) => (
                    <SelectItem key={municipality} value={municipality}>
                      {municipality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
