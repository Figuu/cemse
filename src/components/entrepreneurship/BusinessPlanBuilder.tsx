"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertTriangle
} from "lucide-react";
import { BusinessPlanData, BusinessPlanService } from "@/lib/businessPlanService";

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
    financialProjections: {
      year1: { revenue: 0, expenses: 0, profit: 0, cashFlow: 0, customers: 0, growthRate: 0 },
      year2: { revenue: 0, expenses: 0, profit: 0, cashFlow: 0, customers: 0, growthRate: 0 },
      year3: { revenue: 0, expenses: 0, profit: 0, cashFlow: 0, customers: 0, growthRate: 0 }
    },
    team: [],
    milestones: [],
    risks: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completion, setCompletion] = useState(0);

  // Load business plan if ID provided
  useEffect(() => {
    if (businessPlanId) {
      loadBusinessPlan();
    }
  }, [businessPlanId]);

  // Calculate completion percentage
  useEffect(() => {
    const completionPercentage = BusinessPlanService.calculateCompletionPercentage(plan);
    setCompletion(completionPercentage);
  }, [plan]);

  const loadBusinessPlan = async () => {
    if (!businessPlanId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/business-plans/${businessPlanId}`);
      if (response.ok) {
        const data = await response.json();
        setPlan(data.businessPlan);
      }
    } catch (error) {
      console.error("Error loading business plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = businessPlanId ? `/api/business-plans/${businessPlanId}` : "/api/business-plans";
      const method = businessPlanId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan)
      });

      if (response.ok) {
        const data = await response.json();
        onSave?.(data.businessPlan);
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
      [field]: [...(prev[field] as string[]), item]
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
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Plan de Negocio
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
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Business Plan Form */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="market">Mercado</TabsTrigger>
          <TabsTrigger value="business">Negocio</TabsTrigger>
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
                    value={plan.teamSize}
                    onChange={(e) => handleInputChange("teamSize", parseInt(e.target.value))}
                    placeholder="Número de personas"
                  />
                </div>
                <div>
                  <Label htmlFor="marketSize">Tamaño del Mercado (USD)</Label>
                  <Input
                    id="marketSize"
                    type="number"
                    value={plan.marketSize}
                    onChange={(e) => handleInputChange("marketSize", parseInt(e.target.value))}
                    placeholder="Tamaño del mercado"
                  />
                </div>
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
                  {plan.revenueStreams.map((stream, index) => (
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
                  {plan.costStructure.map((cost, index) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proyecciones Financieras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fundingGoal">Meta de Financiamiento (USD)</Label>
                  <Input
                    id="fundingGoal"
                    type="number"
                    value={plan.fundingGoal}
                    onChange={(e) => handleInputChange("fundingGoal", parseInt(e.target.value))}
                    placeholder="Cantidad que necesitas"
                  />
                </div>
                <div>
                  <Label htmlFor="currentFunding">Financiamiento Actual (USD)</Label>
                  <Input
                    id="currentFunding"
                    type="number"
                    value={plan.currentFunding}
                    onChange={(e) => handleInputChange("currentFunding", parseInt(e.target.value))}
                    placeholder="Cantidad que tienes"
                  />
                </div>
              </div>

              <div>
                <Label>Métricas Clave</Label>
                <div className="space-y-2">
                  {plan.keyMetrics.map((metric, index) => (
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
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {plan.team.map((member, index) => (
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
              <CardTitle>Plan de Ejecución</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hitos</Label>
                <div className="space-y-4">
                  {plan.milestones.map((milestone, index) => (
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
                              newMilestones[index] = { ...milestone, status: value as any };
                              handleInputChange("milestones", newMilestones);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="in_progress">En Progreso</SelectItem>
                              <SelectItem value="completed">Completado</SelectItem>
                              <SelectItem value="delayed">Retrasado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Prioridad</Label>
                          <Select
                            value={milestone.priority}
                            onValueChange={(value) => {
                              const newMilestones = [...plan.milestones];
                              newMilestones[index] = { ...milestone, priority: value as any };
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
