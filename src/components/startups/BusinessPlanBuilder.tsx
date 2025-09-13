"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Save, 
  Download, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  Target,
  BarChart3
} from "lucide-react";
import { BusinessPlanTemplate, BusinessPlanSection, BusinessPlanField } from "@/lib/businessPlanTemplates";
import { BusinessPlanFieldRenderer } from "./BusinessPlanFieldRenderer";

interface BusinessPlanBuilderProps {
  template: BusinessPlanTemplate;
  initialData?: any;
  onSave?: (data: any) => Promise<void>;
  onExport?: (data: any) => Promise<void>;
  onPreview?: (data: any) => void;
  isLoading?: boolean;
  className?: string;
}

export function BusinessPlanBuilder({
  template,
  initialData = {},
  onSave,
  onExport,
  onPreview,
  isLoading = false,
  className = "",
}: BusinessPlanBuilderProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const currentSectionData = template.sections[currentSection];
  const progress = ((currentSection + 1) / template.sections.length) * 100;
  const isLastSection = currentSection === template.sections.length - 1;
  const isFirstSection = currentSection === 0;

  useEffect(() => {
    // Check which sections are completed
    const completed = new Set<number>();
    template.sections.forEach((section, index) => {
      const isCompleted = section.fields.every(field => {
        const value = formData[field.id];
        if (field.required) {
          if (field.type === "table") {
            return value && value.rows && value.rows.length > 0;
          }
          return value !== undefined && value !== null && value !== "";
        }
        return true;
      });
      if (isCompleted) {
        completed.add(index);
      }
    });
    setCompletedSections(completed);
  }, [formData, template.sections]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ""
      }));
    }
  };

  const validateCurrentSection = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    currentSectionData.fields.forEach(field => {
      if (field.required) {
        const value = formData[field.id];
        if (value === undefined || value === null || value === "") {
          newErrors[field.id] = `${field.label} es requerido`;
          isValid = false;
        } else if (field.validation) {
          const { minLength, maxLength, min, max } = field.validation;
          
          if (typeof value === "string") {
            if (minLength && value.length < minLength) {
              newErrors[field.id] = `Mínimo ${minLength} caracteres`;
              isValid = false;
            }
            if (maxLength && value.length > maxLength) {
              newErrors[field.id] = `Máximo ${maxLength} caracteres`;
              isValid = false;
            }
          }
          
          if (typeof value === "number") {
            if (min !== undefined && value < min) {
              newErrors[field.id] = `Mínimo ${min}`;
              isValid = false;
            }
            if (max !== undefined && value > max) {
              newErrors[field.id] = `Máximo ${max}`;
              isValid = false;
            }
          }
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      if (!isLastSection) {
        setCurrentSection(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(formData);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleExport = async () => {
    if (onExport) {
      await onExport(formData);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(formData);
    }
  };

  const getSectionStatus = (index: number) => {
    if (completedSections.has(index)) {
      return "completed";
    }
    if (index === currentSection) {
      return "current";
    }
    return "pending";
  };

  const getSectionIcon = (index: number) => {
    const status = getSectionStatus(index);
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "current":
        return <Target className="h-4 w-4 text-blue-600" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {template.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  {template.description}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {template.estimatedTime} min
                </Badge>
                <Badge variant="secondary">
                  {template.difficulty}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progreso del Plan de Negocios</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Section Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {template.sections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        index === currentSection
                          ? "bg-blue-100 text-blue-700"
                          : completedSections.has(index)
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      onClick={() => setCurrentSection(index)}
                    >
                      {getSectionIcon(index)}
                      <span className="text-sm font-medium">{section.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getSectionIcon(currentSection)}
                  {currentSectionData.title}
                </CardTitle>
                <CardDescription>
                  {currentSectionData.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentSectionData.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <BusinessPlanFieldRenderer
                      field={field}
                      value={formData[field.id]}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      error={errors[field.id]}
                    />
                  </div>
                ))}

                {/* Section Tips */}
                {currentSectionData.tips.length > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-2">Consejos</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            {currentSectionData.tips.map((tip, index) => (
                              <li key={index}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navegación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstSection}
                  className="w-full justify-start"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isLastSection}
                  className="w-full justify-start"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                  className="w-full justify-start"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  className="w-full justify-start"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Secciones completadas</span>
                    <span>{completedSections.size}/{template.sections.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Campos requeridos</span>
                    <span>
                      {template.sections.reduce((acc, section) => 
                        acc + section.fields.filter(field => field.required).length, 0
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
