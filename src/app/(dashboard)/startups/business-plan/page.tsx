"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  ArrowLeft, 
  Save, 
  Download, 
  Eye, 
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  BarChart3
} from "lucide-react";
import { BusinessPlanTemplate, getAllTemplates, getTemplateById } from "@/lib/businessPlanTemplates";
import { BusinessPlanTemplateSelector } from "@/components/startups/BusinessPlanTemplateSelector";
import { BusinessPlanBuilder } from "@/components/startups/BusinessPlanBuilder";
import { BusinessPlanValidationService, ValidationResult } from "@/lib/businessPlanValidationService";
import { BusinessPlanExportService } from "@/lib/businessPlanExportService";
import { useStartups } from "@/hooks/useStartups";

export default function BusinessPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startupId = searchParams.get("startupId");
  const templateId = searchParams.get("templateId");

  const [currentStep, setCurrentStep] = useState<"select" | "build" | "preview">("select");
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessPlanTemplate | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { updateBusinessPlan, isLoading: isUpdating } = useStartups();

  useEffect(() => {
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setSelectedTemplate(template);
        setCurrentStep("build");
      }
    }
  }, [templateId]);

  const handleSelectTemplate = (template: BusinessPlanTemplate) => {
    setSelectedTemplate(template);
    setFormData({});
    setValidationResult(null);
    setCurrentStep("build");
  };

  const handleSave = async (data: any) => {
    if (!selectedTemplate || !startupId) return;

    setIsLoading(true);
    setError(null);

    try {
      await updateBusinessPlan(startupId, {
        executiveSummary: data.executiveSummary || "",
        marketAnalysis: data.marketAnalysis || "",
        financialProjections: data.financialProjections || {},
        marketingStrategy: data.marketingStrategy || "",
        operationsPlan: data.operationsPlan || "",
        riskAnalysis: data.riskAnalysis || "",
      });

      setSuccess("Plan de negocios guardado exitosamente");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el plan de negocios");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (data: any) => {
    if (!selectedTemplate) return;

    try {
      const blob = await BusinessPlanExportService.exportToPDF(selectedTemplate, data);
      const filename = BusinessPlanExportService.getFilename(selectedTemplate, "pdf");
      BusinessPlanExportService.downloadFile(blob, filename);
    } catch (err) {
      setError("Error al exportar el plan de negocios");
    }
  };

  const handlePreview = (data: any) => {
    if (!selectedTemplate) return;

    // Validate the data
    const validation = BusinessPlanValidationService.validateBusinessPlan(selectedTemplate, data);
    setValidationResult(validation);
    setFormData(data);
    setCurrentStep("preview");
  };

  const handleBackToBuilder = () => {
    setCurrentStep("build");
  };

  const handleBackToSelection = () => {
    setCurrentStep("select");
    setSelectedTemplate(null);
    setFormData({});
    setValidationResult(null);
  };

  const getValidationStatus = () => {
    if (!validationResult) return null;

    const { percentage } = validationResult;
    if (percentage >= 90) return { status: "excellent", color: "text-green-600", bg: "bg-green-50" };
    if (percentage >= 75) return { status: "good", color: "text-blue-600", bg: "bg-blue-50" };
    if (percentage >= 50) return { status: "fair", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { status: "poor", color: "text-red-600", bg: "bg-red-50" };
  };

  const getStatusMessage = () => {
    if (!validationResult) return "";

    const { percentage } = validationResult;
    if (percentage >= 90) return "¡Excelente! Tu plan de negocios está muy completo.";
    if (percentage >= 75) return "Buen trabajo. Tu plan está bien desarrollado.";
    if (percentage >= 50) return "Tu plan tiene una base sólida pero necesita más desarrollo.";
    return "Tu plan necesita trabajo significativo para ser efectivo.";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Constructor de Plan de Negocios</h1>
            <p className="text-muted-foreground">
              Crea un plan de negocios profesional paso a paso
            </p>
          </div>
        </div>
        {currentStep === "build" && selectedTemplate && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {selectedTemplate.name}
            </Badge>
            <Badge variant="secondary">
              {selectedTemplate.difficulty}
            </Badge>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Template Selection */}
      {currentStep === "select" && (
        <BusinessPlanTemplateSelector
          onSelectTemplate={handleSelectTemplate}
        />
      )}

      {/* Step 2: Business Plan Builder */}
      {currentStep === "build" && selectedTemplate && (
        <BusinessPlanBuilder
          template={selectedTemplate}
          initialData={formData}
          onSave={handleSave}
          onExport={handleExport}
          onPreview={handlePreview}
          isLoading={isLoading || isUpdating}
        />
      )}

      {/* Step 3: Preview and Validation */}
      {currentStep === "preview" && selectedTemplate && validationResult && (
        <div className="space-y-6">
          {/* Validation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumen de Validación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Overall Score */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getValidationStatus()?.bg} ${getValidationStatus()?.color}`}>
                    {Math.round(validationResult.percentage)}%
                  </div>
                  <p className="mt-2 text-lg font-medium">{getStatusMessage()}</p>
                </div>

                {/* Section Scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {validationResult.sectionScores.map((section) => (
                    <Card key={section.sectionId} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{section.sectionName}</h4>
                        <span className="text-sm font-bold">{Math.round(section.percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${section.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {section.score}/{section.maxScore} puntos
                      </p>
                    </Card>
                  ))}
                </div>

                {/* Errors and Warnings */}
                {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                  <div className="space-y-4">
                    {validationResult.errors.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Errores que corregir:</h4>
                        <div className="space-y-2">
                          {validationResult.errors.map((error, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-800">{error.message}</p>
                                <p className="text-xs text-red-600">{error.fieldId}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {validationResult.warnings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-600 mb-2">Advertencias:</h4>
                        <div className="space-y-2">
                          {validationResult.warnings.map((warning, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">{warning.message}</p>
                                {warning.suggestion && (
                                  <p className="text-xs text-yellow-600">{warning.suggestion}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Suggestions */}
                {validationResult.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">Sugerencias de mejora:</h4>
                    <div className="space-y-2">
                      {validationResult.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">{suggestion.message}</p>
                            <p className="text-xs text-blue-600">{suggestion.fieldId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBackToBuilder}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Editor
            </Button>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleSave(formData)}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Plan
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport(formData)}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
