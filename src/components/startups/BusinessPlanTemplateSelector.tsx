"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Clock, 
  Star, 
  Search, 
  Filter,
  CheckCircle,
  Lightbulb,
  Target,
  Users,
  Building2
} from "lucide-react";
import { BusinessPlanTemplate, getAllTemplates, getTemplatesByCategory, getTemplatesByDifficulty } from "@/lib/businessPlanTemplates";

interface BusinessPlanTemplateSelectorProps {
  onSelectTemplate: (template: BusinessPlanTemplate) => void;
  className?: string;
}

export function BusinessPlanTemplateSelector({
  onSelectTemplate,
  className = "",
}: BusinessPlanTemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessPlanTemplate | null>(null);

  const categories = ["all", "Startup", "Empresa", "Social"];
  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  let filteredTemplates = getAllTemplates();

  if (selectedCategory !== "all") {
    filteredTemplates = getTemplatesByCategory(selectedCategory);
  }

  if (selectedDifficulty !== "all") {
    filteredTemplates = filteredTemplates.filter(template => template.difficulty === selectedDifficulty);
  }

  if (searchTerm) {
    filteredTemplates = filteredTemplates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return <CheckCircle className="h-4 w-4" />;
      case "intermediate":
        return <Target className="h-4 w-4" />;
      case "advanced":
        return <Star className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Startup":
        return <Lightbulb className="h-4 w-4" />;
      case "Empresa":
        return <Building2 className="h-4 w-4" />;
      case "Social":
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleSelectTemplate = (template: BusinessPlanTemplate) => {
    setSelectedTemplate(template);
  };

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Selecciona una Plantilla</h2>
          <p className="text-muted-foreground">
            Elige la plantilla que mejor se adapte a tu tipo de negocio
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar plantillas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Dificultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las dificultades</SelectItem>
                  {difficulties.slice(1).map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty === "beginner" ? "Principiante" : 
                       difficulty === "intermediate" ? "Intermedio" : "Avanzado"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedTemplate?.id === template.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:shadow-md"
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <CardDescription className="mt-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getDifficultyIcon(template.difficulty)}
                    {template.difficulty === "beginner" ? "Principiante" : 
                     template.difficulty === "intermediate" ? "Intermedio" : "Avanzado"}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.estimatedTime} min
                  </Badge>
                  <Badge variant="outline">
                    {template.category}
                  </Badge>
                </div>

                {/* Sections Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Secciones incluidas:</h4>
                  <div className="space-y-1">
                    {template.sections.slice(0, 3).map((section) => (
                      <div key={section.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {section.title}
                      </div>
                    ))}
                    {template.sections.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{template.sections.length - 3} secciones más
                      </div>
                    )}
                  </div>
                </div>

                {/* Tips Preview */}
                {template.tips.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Consejos:</h4>
                    <div className="text-sm text-muted-foreground">
                      {template.tips[0]}
                      {template.tips.length > 1 && (
                        <span> +{template.tips.length - 1} más</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Examples Preview */}
                {template.examples.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Ejemplos:</h4>
                    <div className="text-sm text-muted-foreground">
                      {template.examples[0]}
                      {template.examples.length > 1 && (
                        <span> +{template.examples.length - 1} más</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron plantillas</h3>
              <p className="text-muted-foreground mb-4">
                Intenta ajustar tus filtros de búsqueda
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                }}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Selection Actions */}
        {selectedTemplate && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      {selectedTemplate.name} seleccionada
                    </h3>
                    <p className="text-sm text-blue-700">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>
                <Button onClick={handleConfirmSelection} size="lg">
                  Continuar con esta plantilla
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
