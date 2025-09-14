"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lightbulb, 
  FileText, 
  Calculator, 
  Users, 
  TrendingUp,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { BusinessPlanBuilder } from "@/components/entrepreneurship/BusinessPlanBuilder";
import { FinancialCalculator } from "@/components/entrepreneurship/FinancialCalculator";

export default function EntrepreneurshipPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showBusinessPlanBuilder, setShowBusinessPlanBuilder] = useState(false);
  const [showFinancialCalculator, setShowFinancialCalculator] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Emprendimiento</h1>
        <p className="text-muted-foreground mt-2">
          Desarrolla tu idea de negocio, crea planes de negocio y calcula métricas financieras
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="business-plans">Planes de Negocio</TabsTrigger>
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="network">Red</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowBusinessPlanBuilder(true)}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Plan de Negocio
                </CardTitle>
                <CardDescription>
                  Crea y gestiona tu plan de negocio paso a paso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowFinancialCalculator(true)}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Calculadora Financiera
                </CardTitle>
                <CardDescription>
                  Calcula métricas financieras y proyecciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Abrir Calculadora
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Red de Emprendedores
                </CardTitle>
                <CardDescription>
                  Conecta con otros emprendedores y mentores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Explorar Red
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Proyectos Destacados
                </CardTitle>
                <CardDescription>
                  Descubre proyectos innovadores de otros emprendedores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Explorar Proyectos
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Ideas de Negocio
                </CardTitle>
                <CardDescription>
                  Comparte y explora ideas de negocio innovadoras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Compartir Idea
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filtros Avanzados
                </CardTitle>
                <CardDescription>
                  Encuentra proyectos por industria, etapa y más
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Aplicar Filtros
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Business Plans Tab */}
        <TabsContent value="business-plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Mis Planes de Negocio</h2>
            <Button onClick={() => setShowBusinessPlanBuilder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder for business plans list */}
            <Card>
              <CardHeader>
                <CardTitle>Mi Primer Plan de Negocio</CardTitle>
                <CardDescription>
                  Plan de negocio para mi startup de tecnología
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso:</span>
                    <span>75%</span>
                  </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" } as React.CSSProperties}></div>
                    </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Última actualización:</span>
                    <span>Hace 2 días</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Calculadora Financiera</h2>
            <Button onClick={() => setShowFinancialCalculator(true)}>
              <Calculator className="h-4 w-4 mr-2" />
              Abrir Calculadora
            </Button>
          </div>

          <FinancialCalculator />
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Red de Emprendedores</h2>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Conectar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder for network connections */}
            <Card>
              <CardHeader>
                <CardTitle>Juan Pérez</CardTitle>
                <CardDescription>
                  Emprendedor en tecnología con 5 años de experiencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Industria:</span> Tecnología
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Etapa:</span> Crecimiento
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Ubicación:</span> Madrid, España
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Business Plan Builder Modal */}
      {showBusinessPlanBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Constructor de Plan de Negocio</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBusinessPlanBuilder(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <BusinessPlanBuilder
                onSave={(plan) => {
                  console.log("Business plan saved:", plan);
                  setShowBusinessPlanBuilder(false);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Calculator Modal */}
      {showFinancialCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Calculadora Financiera</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFinancialCalculator(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <FinancialCalculator />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}