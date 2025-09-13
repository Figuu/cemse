"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Download, 
  Share2, 
  Save, 
  TrendingUp,
  DollarSign,
  Target,
  Lightbulb,
  ArrowLeft
} from "lucide-react";
import { FinancialCalculatorForm } from "@/components/entrepreneurship/FinancialCalculatorForm";
import { FinancialCharts } from "@/components/entrepreneurship/FinancialCharts";
import { StartupFinancials, FinancialProjection, BreakEvenAnalysis, InvestmentAnalysis } from "@/lib/financialCalculatorService";
import Link from "next/link";

export default function FinancialCalculatorPage() {
  const [financials, setFinancials] = useState<StartupFinancials | null>(null);
  const [results, setResults] = useState<{
    projections: FinancialProjection[];
    breakEven: BreakEvenAnalysis;
    investment: InvestmentAnalysis;
    summary: any;
  } | null>(null);

  const handleCalculate = (data: StartupFinancials) => {
    setFinancials(data);
    // Results will be set by the form component
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log("Exporting to PDF...");
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    console.log("Sharing results...");
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving results...");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/entrepreneurship">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            Calculadora Financiera
          </h1>
          <p className="text-muted-foreground">
            Calcula proyecciones financieras, punto de equilibrio y análisis de inversión para tu startup
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Costo de Inicio</span>
            </div>
            <p className="text-2xl font-bold">
              {financials ? `$${financials.equipment + financials.initialInventory + financials.legalFees + financials.otherOneTimeCosts}` : "$0"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Ingresos Mensuales</span>
            </div>
            <p className="text-2xl font-bold">
              {financials ? `$${financials.monthlyRevenue}` : "$0"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Crecimiento</span>
            </div>
            <p className="text-2xl font-bold">
              {financials ? `${financials.revenueGrowthRate}%` : "0%"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">Estado</span>
            </div>
            <p className="text-2xl font-bold">
              {results ? (
                <Badge variant={results.summary.isProfitable ? "default" : "destructive"}>
                  {results.summary.isProfitable ? "Rentable" : "No Rentable"}
                </Badge>
              ) : (
                "Sin Calcular"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="space-y-6">
          <FinancialCalculatorForm 
            onCalculate={handleCalculate}
            initialData={financials || undefined}
          />
        </div>

        {/* Results and Charts */}
        <div className="space-y-6">
          {results && (
            <>
              {/* Action Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleExportPDF} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Exportar PDF
                    </Button>
                    <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Compartir
                    </Button>
                    <Button onClick={handleSave} variant="outline" className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Guardar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Charts */}
              <FinancialCharts 
                projections={results.projections}
                breakEven={results.breakEven}
                investment={results.investment}
                currency={financials?.currency || "USD"}
              />
            </>
          )}

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle>¿Cómo usar la calculadora?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Información Básica</h4>
                <p className="text-sm text-muted-foreground">
                  Completa el nombre de tu negocio y selecciona la moneda que usarás.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">2. Proyección de Ingresos</h4>
                <p className="text-sm text-muted-foreground">
                  Estima tus ingresos mensuales iniciales y la tasa de crecimiento esperada.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">3. Costos y Gastos</h4>
                <p className="text-sm text-muted-foreground">
                  Incluye todos los costos fijos, variables y únicos de inicio.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">4. Análisis de Inversión</h4>
                <p className="text-sm text-muted-foreground">
                  Define tu inversión inicial y adicional para calcular el ROI y TIR.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Consejos para Mejores Resultados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Ingresos Realistas</h4>
              <p className="text-xs text-muted-foreground">
                Basa tus proyecciones en datos del mercado y competencia, no en optimismo.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Costos Completos</h4>
              <p className="text-xs text-muted-foreground">
                Incluye todos los costos ocultos como seguros, impuestos y contingencias.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Crecimiento Conservador</h4>
              <p className="text-xs text-muted-foreground">
                Usa tasas de crecimiento conservadoras para evitar sobreestimaciones.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Punto de Equilibrio</h4>
              <p className="text-xs text-muted-foreground">
                Busca alcanzar el punto de equilibrio en los primeros 12-18 meses.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Reserva de Efectivo</h4>
              <p className="text-xs text-muted-foreground">
                Mantén al menos 6 meses de gastos operativos como reserva.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Revisión Periódica</h4>
              <p className="text-xs text-muted-foreground">
                Actualiza tus proyecciones mensualmente con datos reales.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
