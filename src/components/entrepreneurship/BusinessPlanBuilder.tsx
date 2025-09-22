"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PDFExportButton from './PDFExportButton';
import FinancialCalculator from './FinancialCalculator';
import { 
  FileText, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Grid3X3
} from "lucide-react";
import { BusinessPlanData, BusinessPlanService } from "@/lib/businessPlanService";
import { useSession } from "next-auth/react";

interface BusinessPlanBuilderProps {
  businessPlanId?: string;
  onSave?: (plan: BusinessPlanData) => void;
  className?: string;
}

export function BusinessPlanBuilder({ 
  businessPlanId, 
  onSave, 
  className 
}: BusinessPlanBuilderProps) {
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<BusinessPlanData>({
    userId: "",
    title: "",
    description: "",
    industry: "",
    stage: "idea",
    fundingGoal: 0,
    currentFunding: 0,
    teamSize: 1,
    marketSize: 0,
    targetMarket: "",
    problemStatement: "",
    solution: "",
    valueProposition: "",
    businessModel: "",
    revenueStreams: [],
    costStructure: [],
    keyMetrics: [],
    competitiveAdvantage: "",
    marketingStrategy: "",
    operationsPlan: "",
    
    // Triple Impact Assessment
    tripleImpactAssessment: {
      problemSolved: "",
      beneficiaries: "",
      resourcesUsed: "",
      communityInvolvement: "",
      longTermImpact: "",
    },
    
    // Business Model Canvas
    businessModelCanvas: {
      keyPartners: "",
      keyActivities: "",
      valuePropositions: "",
      customerRelationships: "",
      customerSegments: "",
      keyResources: "",
      channels: "",
      costStructure: "",
      revenueStreams: "",
    },
    
    // Enhanced Financial Projections
    financialProjections: {
      startupCosts: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      breakEvenMonth: 0,
      revenueStreams: [],
      // New financial calculator fields
      initialInvestment: 0,
      monthlyOperatingCosts: 0,
      revenueProjection: 0,
      breakEvenPoint: 0,
      estimatedROI: 0,
      year1: { revenue: 0, expenses: 0, profit: 0, cashFlow: 0, customers: 0, growthRate: 0 },
      year2: { revenue: 0, expenses: 0, profit: 0, cashFlow: 0, customers: 0, growthRate: 0 },
      year3: { revenue: 0, expenses: 0, profit: 0, cashFlow: 0, customers: 0, growthRate: 0 }
    },
    
    // Additional fields from simulator
    executiveSummary: "",
    businessDescription: "",
    marketAnalysis: "",
    competitiveAnalysis: "",
    operationalPlan: "",
    managementTeam: "",
    riskAnalysis: "",
    appendices: "",
    
    // Legacy fields
    team: [],
    milestones: [],
    risks: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completion, setCompletion] = useState(0);

  const loadBusinessPlan = useCallback(async () => {
    if (!businessPlanId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/business-plans/${businessPlanId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("API response data:", data);
        console.log("Business plan object:", data.businessPlan);
        
        // The business plan data is already transformed and flattened by the service
        const businessPlanData = data.businessPlan || {};
        
        // Ensure all required fields are present with proper defaults
        const fullPlanData = {
          userId: businessPlanData.userId || "",
          title: businessPlanData.title || "",
          description: businessPlanData.description || "",
          industry: businessPlanData.industry || "",
          stage: businessPlanData.stage || "idea",
          fundingGoal: businessPlanData.fundingGoal || 0,
          currentFunding: businessPlanData.currentFunding || 0,
          teamSize: businessPlanData.teamSize || 1,
          marketSize: businessPlanData.marketSize || 0,
          targetMarket: businessPlanData.targetMarket || "",
          problemStatement: businessPlanData.problemStatement || "",
          solution: businessPlanData.solution || "",
          valueProposition: businessPlanData.valueProposition || "",
          businessModel: businessPlanData.businessModel || "",
          revenueStreams: businessPlanData.revenueStreams || [],
          costStructure: businessPlanData.costStructure || [],
          keyMetrics: businessPlanData.keyMetrics || [],
          competitiveAdvantage: businessPlanData.competitiveAdvantage || "",
          marketingStrategy: businessPlanData.marketingStrategy || "",
          operationsPlan: businessPlanData.operationsPlan || "",
          
          // Triple Impact Assessment
          tripleImpactAssessment: businessPlanData.tripleImpactAssessment || {
            problemSolved: "",
            beneficiaries: "",
            resourcesUsed: "",
            communityInvolvement: "",
            longTermImpact: "",
          },
          
          // Business Model Canvas
          businessModelCanvas: businessPlanData.businessModelCanvas || {
            keyPartners: "",
            keyActivities: "",
            valuePropositions: "",
            customerRelationships: "",
            customerSegments: "",
            keyResources: "",
            channels: "",
            costStructure: "",
            revenueStreams: "",
          },
          
          // Enhanced Financial Projections
          financialProjections: businessPlanData.financialProjections || {
            startupCosts: 0,
            monthlyRevenue: 0,
            monthlyExpenses: 0,
            breakEvenMonth: 0,
            revenueStreams: [],
            initialInvestment: 0,
            monthlyOperatingCosts: 0,
            revenueProjection: 0,
            breakEvenPoint: 0,
            estimatedROI: 0,
            year1: { revenue: 0, expenses: 0, profit: 0, cashFlow: 0, customers: 0, growthRate: 0 },
            year2: { revenue: 0, expenses: 0, profit: 0, cashFlow: 0, customers: 0, growthRate: 0 },
            year3: { revenue: 0, expenses: 0, profit: 0, cashFlow: 0, customers: 0, growthRate: 0 }
          },
          
          // Additional fields from simulator
          executiveSummary: businessPlanData.executiveSummary || "",
          businessDescription: businessPlanData.businessDescription || "",
          marketAnalysis: businessPlanData.marketAnalysis || "",
          competitiveAnalysis: businessPlanData.competitiveAnalysis || "",
          operationalPlan: businessPlanData.operationalPlan || "",
          managementTeam: businessPlanData.managementTeam || "",
          riskAnalysis: businessPlanData.riskAnalysis || "",
          appendices: businessPlanData.appendices || "",
          
          // Legacy fields
          team: businessPlanData.team || [],
          milestones: businessPlanData.milestones || [],
          risks: businessPlanData.risks || []
        };
        
        setPlan(fullPlanData);
      } else {
        console.error("Failed to load business plan. Status:", response.status);
        const errorData = await response.json();
        console.error("Error data:", errorData);
      }
    } catch (error) {
      console.error("Error loading business plan:", error);
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanId]);

  // Load business plan if ID provided
  useEffect(() => {
    if (businessPlanId) {
      loadBusinessPlan();
    }
  }, [businessPlanId, loadBusinessPlan]);

  // Calculate completion percentage
  useEffect(() => {
    const completionPercentage = BusinessPlanService.calculateCompletionPercentage(plan);
    setCompletion(completionPercentage);
  }, [plan]);

  const handleSave = async () => {
    if (status === "loading") {
      console.log("Session is loading, please wait...");
      return;
    }

    if (!session) {
      console.error("User not authenticated. Please log in to save business plans.");
      return;
    }

    setIsSaving(true);
    try {
      const url = businessPlanId ? `/api/business-plans/${businessPlanId}` : "/api/business-plans";
      const method = businessPlanId ? "PUT" : "POST";

      // Ensure the plan has the correct userId (user ID)
      const planToSave = {
        ...plan,
        userId: session.user.id
      };

      console.log(`Making ${method} request to ${url}`, { 
        session: !!session, 
        userId: session?.user?.id,
        planTitle: planToSave.title
      });

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planToSave)
      });

      console.log(`Response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        onSave?.(data.businessPlan);
        console.log("Business plan saved successfully:", data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to save business plan:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
      }
    } catch (error) {
      console.error("Error saving business plan:", error);
    } finally {
      setIsSaving(false);
    }
  };


  const handleInputChange = (field: keyof BusinessPlanData, value: any) => {
    setPlan(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: keyof BusinessPlanData, item: string) => {
    if (!item.trim()) return;
    setPlan(prev => ({
      ...prev,
      [field]: [...((prev[field] as string[]) || []), item]
    }));
  };

  const removeArrayItem = (field: keyof BusinessPlanData, index: number) => {
    setPlan(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Plan de Negocio
                <Badge variant="outline" className="ml-2 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Builder
                </Badge>
              </CardTitle>
              <CardDescription>
                Crea y gestiona tu plan de negocio paso a paso
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-sm font-medium">{completion}% completado</div>
                <Progress value={completion} className="w-24 h-2" />
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
              <PDFExportButton businessPlan={plan} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Business Plan Form */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="impact">Impacto</TabsTrigger>
          <TabsTrigger value="market">Mercado</TabsTrigger>
          <TabsTrigger value="business">Negocio</TabsTrigger>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="financial">Financiero</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="execution">Ejecución</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título del Proyecto</Label>
                  <Input
                    id="title"
                    value={plan.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Nombre de tu proyecto"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industria</Label>
                  <Select
                    value={plan.industry}
                    onValueChange={(value) => handleInputChange("industry", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar industria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Tecnología</SelectItem>
                      <SelectItem value="healthcare">Salud</SelectItem>
                      <SelectItem value="finance">Finanzas</SelectItem>
                      <SelectItem value="education">Educación</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufactura</SelectItem>
                      <SelectItem value="services">Servicios</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={plan.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe tu proyecto en pocas palabras"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="executiveSummary">Resumen Ejecutivo</Label>
                <Textarea
                  id="executiveSummary"
                  value={plan.executiveSummary}
                  onChange={(e) => handleInputChange("executiveSummary", e.target.value)}
                  placeholder="Resumen ejecutivo de tu plan de negocio"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stage">Etapa</Label>
                  <Select
                    value={plan.stage}
                    onValueChange={(value) => handleInputChange("stage", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Etapa actual" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="growth">Crecimiento</SelectItem>
                      <SelectItem value="mature">Maduro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="teamSize">Tamaño del Equipo</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    value={plan.teamSize || ""}
                    onChange={(e) => handleInputChange("teamSize", parseInt(e.target.value) || 1)}
                    placeholder="Número de personas"
                  />
                </div>
                <div>
                  <Label htmlFor="marketSize">Tamaño del Mercado (USD)</Label>
                  <Input
                    id="marketSize"
                    type="number"
                    value={plan.marketSize || ""}
                    onChange={(e) => handleInputChange("marketSize", parseInt(e.target.value) || 0)}
                    placeholder="Tamaño del mercado"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Triple Impact Assessment Tab */}
        <TabsContent value="impact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Evaluación de Triple Impacto
              </CardTitle>
              <CardDescription>
                Define el impacto social, económico y ambiental de tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="problemSolved">Problema Resuelto</Label>
                <Textarea
                  id="problemSolved"
                  value={plan.tripleImpactAssessment.problemSolved}
                  onChange={(e) => handleInputChange("tripleImpactAssessment", {
                    ...plan.tripleImpactAssessment,
                    problemSolved: e.target.value
                  })}
                  placeholder="¿Qué problema específico resuelve tu negocio en la sociedad?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="beneficiaries">Beneficiarios</Label>
                <Textarea
                  id="beneficiaries"
                  value={plan.tripleImpactAssessment.beneficiaries}
                  onChange={(e) => handleInputChange("tripleImpactAssessment", {
                    ...plan.tripleImpactAssessment,
                    beneficiaries: e.target.value
                  })}
                  placeholder="¿Quiénes son los beneficiarios directos e indirectos de tu solución?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="resourcesUsed">Recursos Utilizados</Label>
                <Textarea
                  id="resourcesUsed"
                  value={plan.tripleImpactAssessment.resourcesUsed}
                  onChange={(e) => handleInputChange("tripleImpactAssessment", {
                    ...plan.tripleImpactAssessment,
                    resourcesUsed: e.target.value
                  })}
                  placeholder="¿Qué recursos naturales, humanos o tecnológicos utiliza tu negocio?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="communityInvolvement">Involucramiento Comunitario</Label>
                <Textarea
                  id="communityInvolvement"
                  value={plan.tripleImpactAssessment.communityInvolvement}
                  onChange={(e) => handleInputChange("tripleImpactAssessment", {
                    ...plan.tripleImpactAssessment,
                    communityInvolvement: e.target.value
                  })}
                  placeholder="¿Cómo involucra tu negocio a la comunidad local?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="longTermImpact">Impacto a Largo Plazo</Label>
                <Textarea
                  id="longTermImpact"
                  value={plan.tripleImpactAssessment.longTermImpact}
                  onChange={(e) => handleInputChange("tripleImpactAssessment", {
                    ...plan.tripleImpactAssessment,
                    longTermImpact: e.target.value
                  })}
                  placeholder="¿Cuál será el impacto transformador de tu negocio en 5-10 años?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Tab */}
        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Mercado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="targetMarket">Mercado Objetivo</Label>
                <Textarea
                  id="targetMarket"
                  value={plan.targetMarket}
                  onChange={(e) => handleInputChange("targetMarket", e.target.value)}
                  placeholder="Describe tu mercado objetivo"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="problemStatement">Problema</Label>
                <Textarea
                  id="problemStatement"
                  value={plan.problemStatement}
                  onChange={(e) => handleInputChange("problemStatement", e.target.value)}
                  placeholder="¿Qué problema resuelve tu producto/servicio?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="solution">Solución</Label>
                <Textarea
                  id="solution"
                  value={plan.solution}
                  onChange={(e) => handleInputChange("solution", e.target.value)}
                  placeholder="¿Cómo resuelves el problema?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="valueProposition">Propuesta de Valor</Label>
                <Textarea
                  id="valueProposition"
                  value={plan.valueProposition}
                  onChange={(e) => handleInputChange("valueProposition", e.target.value)}
                  placeholder="¿Por qué los clientes elegirían tu producto/servicio?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="competitiveAdvantage">Ventaja Competitiva</Label>
                <Textarea
                  id="competitiveAdvantage"
                  value={plan.competitiveAdvantage}
                  onChange={(e) => handleInputChange("competitiveAdvantage", e.target.value)}
                  placeholder="¿Qué te hace diferente de la competencia?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="marketAnalysis">Análisis de Mercado</Label>
                <Textarea
                  id="marketAnalysis"
                  value={plan.marketAnalysis}
                  onChange={(e) => handleInputChange("marketAnalysis", e.target.value)}
                  placeholder="Análisis detallado del mercado objetivo"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="competitiveAnalysis">Análisis Competitivo</Label>
                <Textarea
                  id="competitiveAnalysis"
                  value={plan.competitiveAnalysis}
                  onChange={(e) => handleInputChange("competitiveAnalysis", e.target.value)}
                  placeholder="Análisis de la competencia"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modelo de Negocio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessModel">Modelo de Negocio</Label>
                <Textarea
                  id="businessModel"
                  value={plan.businessModel}
                  onChange={(e) => handleInputChange("businessModel", e.target.value)}
                  placeholder="Describe cómo generas ingresos"
                  rows={3}
                />
              </div>

              <div>
                <Label>Fuentes de Ingresos</Label>
                <div className="space-y-2">
                  {(plan.revenueStreams || []).map((stream, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input value={stream} readOnly />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("revenueStreams", index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Nueva fuente de ingresos"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addArrayItem("revenueStreams", e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input.value) {
                          addArrayItem("revenueStreams", input.value);
                          input.value = "";
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>Estructura de Costos</Label>
                <div className="space-y-2">
                  {(plan.costStructure || []).map((cost, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input value={cost} readOnly />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("costStructure", index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Nuevo costo"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addArrayItem("costStructure", e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input.value) {
                          addArrayItem("costStructure", input.value);
                          input.value = "";
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="marketingStrategy">Estrategia de Marketing</Label>
                <Textarea
                  id="marketingStrategy"
                  value={plan.marketingStrategy}
                  onChange={(e) => handleInputChange("marketingStrategy", e.target.value)}
                  placeholder="¿Cómo planeas llegar a tus clientes?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="operationsPlan">Plan de Operaciones</Label>
                <Textarea
                  id="operationsPlan"
                  value={plan.operationsPlan}
                  onChange={(e) => handleInputChange("operationsPlan", e.target.value)}
                  placeholder="¿Cómo operarás tu negocio día a día?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="operationalPlan">Plan Operacional Detallado</Label>
                <Textarea
                  id="operationalPlan"
                  value={plan.operationalPlan}
                  onChange={(e) => handleInputChange("operationalPlan", e.target.value)}
                  placeholder="Plan operacional detallado de tu negocio"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="managementTeam">Equipo de Gestión</Label>
                <Textarea
                  id="managementTeam"
                  value={plan.managementTeam}
                  onChange={(e) => handleInputChange("managementTeam", e.target.value)}
                  placeholder="Descripción del equipo de gestión y liderazgo"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Model Canvas Tab */}
        <TabsContent value="canvas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                Business Model Canvas
              </CardTitle>
              <CardDescription>
                Define los 9 bloques fundamentales de tu modelo de negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyPartners">Socios Clave</Label>
                    <Textarea
                      id="keyPartners"
                      value={plan.businessModelCanvas.keyPartners}
                      onChange={(e) => handleInputChange("businessModelCanvas", {
                        ...plan.businessModelCanvas,
                        keyPartners: e.target.value
                      })}
                      placeholder="¿Quiénes son tus socios estratégicos?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="keyActivities">Actividades Clave</Label>
                    <Textarea
                      id="keyActivities"
                      value={plan.businessModelCanvas.keyActivities}
                      onChange={(e) => handleInputChange("businessModelCanvas", {
                        ...plan.businessModelCanvas,
                        keyActivities: e.target.value
                      })}
                      placeholder="¿Qué actividades principales realiza tu negocio?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="valuePropositions">Propuestas de Valor</Label>
                    <Textarea
                      id="valuePropositions"
                      value={plan.businessModelCanvas.valuePropositions}
                      onChange={(e) => handleInputChange("businessModelCanvas", {
                        ...plan.businessModelCanvas,
                        valuePropositions: e.target.value
                      })}
                      placeholder="¿Qué valor único ofreces a tus clientes?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerRelationships">Relaciones con Clientes</Label>
                    <Textarea
                      id="customerRelationships"
                      value={plan.businessModelCanvas.customerRelationships}
                      onChange={(e) => handleInputChange("businessModelCanvas", {
                        ...plan.businessModelCanvas,
                        customerRelationships: e.target.value
                      })}
                      placeholder="¿Qué tipo de relación estableces con tus clientes?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerSegments">Segmentos de Clientes</Label>
                    <Textarea
                      id="customerSegments"
                      value={plan.businessModelCanvas.customerSegments}
                      onChange={(e) => handleInputChange("businessModelCanvas", {
                        ...plan.businessModelCanvas,
                        customerSegments: e.target.value
                      })}
                      placeholder="¿A quién te diriges? ¿Cuáles son tus segmentos de clientes?"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyResources">Recursos Clave</Label>
                    <Textarea
                      id="keyResources"
                      value={plan.businessModelCanvas.keyResources}
                      onChange={(e) => handleInputChange("businessModelCanvas", {
                        ...plan.businessModelCanvas,
                        keyResources: e.target.value
                      })}
                      placeholder="¿Qué recursos necesitas para crear valor?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="channels">Canales</Label>
                    <Textarea
                      id="channels"
                      value={plan.businessModelCanvas.channels}
                      onChange={(e) => handleInputChange("businessModelCanvas", {
                        ...plan.businessModelCanvas,
                        channels: e.target.value
                      })}
                      placeholder="¿Cómo llegas a tus clientes?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="costStructure">Estructura de Costos</Label>
                    <Textarea
                      id="costStructure"
                      value={plan.businessModelCanvas.costStructure}
                      onChange={(e) => handleInputChange("businessModelCanvas", {
                        ...plan.businessModelCanvas,
                        costStructure: e.target.value
                      })}
                      placeholder="¿Cuáles son los costos más importantes de tu negocio?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="revenueStreams">Fuentes de Ingresos</Label>
                    <Textarea
                      id="revenueStreams"
                      value={plan.businessModelCanvas.revenueStreams}
                      onChange={(e) => handleInputChange("businessModelCanvas", {
                        ...plan.businessModelCanvas,
                        revenueStreams: e.target.value
                      })}
                      placeholder="¿Cómo genera ingresos tu negocio?"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          {/* Basic Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información Financiera Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fundingGoal">Meta de Financiamiento (BOB)</Label>
                  <Input
                    id="fundingGoal"
                    type="number"
                    value={plan.fundingGoal || ""}
                    onChange={(e) => handleInputChange("fundingGoal", parseInt(e.target.value) || 0)}
                    placeholder="Cantidad que necesitas"
                  />
                </div>
                <div>
                  <Label htmlFor="currentFunding">Financiamiento Actual (BOB)</Label>
                  <Input
                    id="currentFunding"
                    type="number"
                    value={plan.currentFunding || ""}
                    onChange={(e) => handleInputChange("currentFunding", parseInt(e.target.value) || 0)}
                    placeholder="Cantidad que tienes"
                  />
                </div>
              </div>

              <div>
                <Label>Métricas Clave</Label>
                <div className="space-y-2">
                  {(plan.keyMetrics || []).map((metric, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input value={metric} readOnly />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("keyMetrics", index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Nueva métrica"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addArrayItem("keyMetrics", e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input.value) {
                          addArrayItem("keyMetrics", input.value);
                          input.value = "";
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Calculator */}
          <FinancialCalculator
            financialData={{
              initialInvestment: plan.financialProjections?.initialInvestment || 0,
              monthlyOperatingCosts: plan.financialProjections?.monthlyOperatingCosts || 0,
              revenueProjection: plan.financialProjections?.revenueProjection || 0,
              breakEvenPoint: plan.financialProjections?.breakEvenPoint || 0,
              estimatedROI: plan.financialProjections?.estimatedROI || 0,
            }}
            onUpdate={(data) => {
              handleInputChange("financialProjections", {
                ...plan.financialProjections,
                ...data
              });
            }}
          />
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {(plan.team || []).map((member, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre</Label>
                        <Input
                          value={member.name}
                          onChange={(e) => {
                            const newTeam = [...plan.team];
                            newTeam[index] = { ...member, name: e.target.value };
                            handleInputChange("team", newTeam);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Rol</Label>
                        <Input
                          value={member.role}
                          onChange={(e) => {
                            const newTeam = [...plan.team];
                            newTeam[index] = { ...member, role: e.target.value };
                            handleInputChange("team", newTeam);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Experiencia</Label>
                        <Input
                          value={member.experience}
                          onChange={(e) => {
                            const newTeam = [...plan.team];
                            newTeam[index] = { ...member, experience: e.target.value };
                            handleInputChange("team", newTeam);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Equity (%)</Label>
                        <Input
                          type="number"
                          value={member.equity}
                          onChange={(e) => {
                            const newTeam = [...plan.team];
                            newTeam[index] = { ...member, equity: parseInt(e.target.value) };
                            handleInputChange("team", newTeam);
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newTeam = plan.team.filter((_, i) => i !== index);
                          handleInputChange("team", newTeam);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => {
                    const newTeam = [...plan.team, {
                      name: "",
                      role: "",
                      experience: "",
                      skills: [],
                      equity: 0,
                      isFounder: false
                    }];
                    handleInputChange("team", newTeam);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Miembro del Equipo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Execution Tab */}
        <TabsContent value="execution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Plan de Ejecución
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hitos</Label>
                <div className="space-y-4">
                  {(plan.milestones || []).map((milestone, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Título</Label>
                          <Input
                            value={milestone.title}
                            onChange={(e) => {
                              const newMilestones = [...plan.milestones];
                              newMilestones[index] = { ...milestone, title: e.target.value };
                              handleInputChange("milestones", newMilestones);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Fecha Objetivo</Label>
                          <Input
                            type="date"
                            value={milestone.targetDate.toISOString().split('T')[0]}
                            onChange={(e) => {
                              const newMilestones = [...plan.milestones];
                              newMilestones[index] = { ...milestone, targetDate: new Date(e.target.value) };
                              handleInputChange("milestones", newMilestones);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Estado</Label>
                          <Select
                            value={milestone.status}
                            onValueChange={(value) => {
                              const newMilestones = [...plan.milestones];
                              newMilestones[index] = { ...milestone, status: value as 'pending' | 'in_progress' | 'completed' | 'delayed' };
                              handleInputChange("milestones", newMilestones);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4" />
                                  Pendiente
                                </div>
                              </SelectItem>
                              <SelectItem value="in_progress">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  En Progreso
                                </div>
                              </SelectItem>
                              <SelectItem value="completed">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  Completado
                                </div>
                              </SelectItem>
                              <SelectItem value="delayed">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  Retrasado
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Prioridad</Label>
                          <Select
                            value={milestone.priority}
                            onValueChange={(value) => {
                              const newMilestones = [...plan.milestones];
                              newMilestones[index] = { ...milestone, priority: value as 'low' | 'medium' | 'high' };
                              handleInputChange("milestones", newMilestones);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baja</SelectItem>
                              <SelectItem value="medium">Media</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label>Descripción</Label>
                        <Textarea
                          value={milestone.description}
                          onChange={(e) => {
                            const newMilestones = [...plan.milestones];
                            newMilestones[index] = { ...milestone, description: e.target.value };
                            handleInputChange("milestones", newMilestones);
                          }}
                          rows={2}
                        />
                      </div>
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newMilestones = plan.milestones.filter((_, i) => i !== index);
                            handleInputChange("milestones", newMilestones);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={() => {
                      const newMilestones = [...plan.milestones, {
                        id: Date.now().toString(),
                        title: "",
                        description: "",
                        targetDate: new Date(),
                        status: "pending" as const,
                        priority: "medium" as const,
                        dependencies: []
                      }];
                      handleInputChange("milestones", newMilestones);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Hito
                  </Button>
                </div>
              </div>

              <div>
                <Label>Análisis de Riesgos</Label>
                <Textarea
                  value={plan.riskAnalysis}
                  onChange={(e) => handleInputChange("riskAnalysis", e.target.value)}
                  placeholder="Identifica los principales riesgos del negocio y las estrategias para mitigarlos"
                  rows={4}
                />
              </div>

              <div>
                <Label>Apéndices</Label>
                <Textarea
                  value={plan.appendices}
                  onChange={(e) => handleInputChange("appendices", e.target.value)}
                  placeholder="Información adicional, gráficos, tablas, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
