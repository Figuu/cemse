"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Target, 
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { 
  StartupFinancials, 
  FinancialCalculatorService,
  FinancialProjection,
  BreakEvenAnalysis,
  InvestmentAnalysis
} from "@/lib/financialCalculatorService";

interface FinancialCalculatorFormProps {
  onCalculate?: (financials: StartupFinancials) => void;
  initialData?: Partial<StartupFinancials>;
}

export function FinancialCalculatorForm({ onCalculate, initialData }: FinancialCalculatorFormProps) {
  const [financials, setFinancials] = useState<StartupFinancials>({
    businessName: "",
    currency: "USD",
    monthlyRevenue: 0,
    revenueGrowthRate: 5,
    revenueProjectionMonths: 12,
    rent: 0,
    salaries: 0,
    insurance: 0,
    utilities: 0,
    marketing: 0,
    otherFixedCosts: 0,
    costOfGoodsSold: 30,
    variableCosts: 0,
    equipment: 0,
    initialInventory: 0,
    legalFees: 0,
    otherOneTimeCosts: 0,
    initialInvestment: 0,
    additionalInvestment: 0,
    investmentMonths: 0,
    targetMonthlyProfit: 0,
    targetRevenue: 0,
    ...initialData,
  });

  const [results, setResults] = useState<{
    projections: FinancialProjection[];
    breakEven: BreakEvenAnalysis;
    investment: InvestmentAnalysis;
    summary: any;
  } | null>(null);

  const handleInputChange = (field: keyof StartupFinancials, value: string | number) => {
    setFinancials(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCalculate = () => {
    try {
      const projections = FinancialCalculatorService.calculateMonthlyProjections(financials);
      const breakEven = FinancialCalculatorService.calculateBreakEven(financials);
      const investment = FinancialCalculatorService.calculateInvestmentAnalysis(financials);
      const summary = FinancialCalculatorService.generateFinancialSummary(financials);

      setResults({
        projections,
        breakEven,
        investment,
        summary,
      });

      if (onCalculate) {
        onCalculate(financials);
      }
    } catch (error) {
      console.error("Error calculating financials:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: financials.currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora Financiera para Startups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="revenue">Ingresos</TabsTrigger>
              <TabsTrigger value="costs">Costos</TabsTrigger>
              <TabsTrigger value="investment">Inversión</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre del Negocio</Label>
                  <Input
                    id="businessName"
                    value={financials.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    placeholder="Mi Startup"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select
                    value={financials.currency}
                    onValueChange={(value) => handleInputChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - Dólar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="BOB">BOB - Boliviano</SelectItem>
                      <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                      <SelectItem value="BRL">BRL - Real Brasileño</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyRevenue">Ingresos Mensuales Iniciales</Label>
                  <Input
                    id="monthlyRevenue"
                    type="number"
                    value={financials.monthlyRevenue}
                    onChange={(e) => handleInputChange("monthlyRevenue", e.target.value)}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenueGrowthRate">Tasa de Crecimiento Mensual (%)</Label>
                  <Input
                    id="revenueGrowthRate"
                    type="number"
                    value={financials.revenueGrowthRate}
                    onChange={(e) => handleInputChange("revenueGrowthRate", e.target.value)}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenueProjectionMonths">Meses de Proyección</Label>
                  <Input
                    id="revenueProjectionMonths"
                    type="number"
                    value={financials.revenueProjectionMonths}
                    onChange={(e) => handleInputChange("revenueProjectionMonths", e.target.value)}
                    placeholder="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetRevenue">Ingresos Objetivo Mensual</Label>
                  <Input
                    id="targetRevenue"
                    type="number"
                    value={financials.targetRevenue}
                    onChange={(e) => handleInputChange("targetRevenue", e.target.value)}
                    placeholder="10000"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Costos Fijos Mensuales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rent">Alquiler</Label>
                    <Input
                      id="rent"
                      type="number"
                      value={financials.rent}
                      onChange={(e) => handleInputChange("rent", e.target.value)}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaries">Salarios</Label>
                    <Input
                      id="salaries"
                      type="number"
                      value={financials.salaries}
                      onChange={(e) => handleInputChange("salaries", e.target.value)}
                      placeholder="3000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurance">Seguros</Label>
                    <Input
                      id="insurance"
                      type="number"
                      value={financials.insurance}
                      onChange={(e) => handleInputChange("insurance", e.target.value)}
                      placeholder="200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="utilities">Servicios Públicos</Label>
                    <Input
                      id="utilities"
                      type="number"
                      value={financials.utilities}
                      onChange={(e) => handleInputChange("utilities", e.target.value)}
                      placeholder="300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketing">Marketing</Label>
                    <Input
                      id="marketing"
                      type="number"
                      value={financials.marketing}
                      onChange={(e) => handleInputChange("marketing", e.target.value)}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherFixedCosts">Otros Costos Fijos</Label>
                    <Input
                      id="otherFixedCosts"
                      type="number"
                      value={financials.otherFixedCosts}
                      onChange={(e) => handleInputChange("otherFixedCosts", e.target.value)}
                      placeholder="200"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Costos Variables</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costOfGoodsSold">Costo de Ventas (% de ingresos)</Label>
                    <Input
                      id="costOfGoodsSold"
                      type="number"
                      value={financials.costOfGoodsSold}
                      onChange={(e) => handleInputChange("costOfGoodsSold", e.target.value)}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variableCosts">Otros Costos Variables</Label>
                    <Input
                      id="variableCosts"
                      type="number"
                      value={financials.variableCosts}
                      onChange={(e) => handleInputChange("variableCosts", e.target.value)}
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Costos Únicos de Inicio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipamiento</Label>
                    <Input
                      id="equipment"
                      type="number"
                      value={financials.equipment}
                      onChange={(e) => handleInputChange("equipment", e.target.value)}
                      placeholder="2000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="initialInventory">Inventario Inicial</Label>
                    <Input
                      id="initialInventory"
                      type="number"
                      value={financials.initialInventory}
                      onChange={(e) => handleInputChange("initialInventory", e.target.value)}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legalFees">Gastos Legales</Label>
                    <Input
                      id="legalFees"
                      type="number"
                      value={financials.legalFees}
                      onChange={(e) => handleInputChange("legalFees", e.target.value)}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherOneTimeCosts">Otros Costos Únicos</Label>
                    <Input
                      id="otherOneTimeCosts"
                      type="number"
                      value={financials.otherOneTimeCosts}
                      onChange={(e) => handleInputChange("otherOneTimeCosts", e.target.value)}
                      placeholder="300"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="investment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialInvestment">Inversión Inicial</Label>
                  <Input
                    id="initialInvestment"
                    type="number"
                    value={financials.initialInvestment}
                    onChange={(e) => handleInputChange("initialInvestment", e.target.value)}
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalInvestment">Inversión Adicional Mensual</Label>
                  <Input
                    id="additionalInvestment"
                    type="number"
                    value={financials.additionalInvestment}
                    onChange={(e) => handleInputChange("additionalInvestment", e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investmentMonths">Meses de Inversión Adicional</Label>
                  <Input
                    id="investmentMonths"
                    type="number"
                    value={financials.investmentMonths}
                    onChange={(e) => handleInputChange("investmentMonths", e.target.value)}
                    placeholder="6"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetMonthlyProfit">Utilidad Objetivo Mensual</Label>
                  <Input
                    id="targetMonthlyProfit"
                    type="number"
                    value={financials.targetMonthlyProfit}
                    onChange={(e) => handleInputChange("targetMonthlyProfit", e.target.value)}
                    placeholder="2000"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center mt-6">
            <Button onClick={handleCalculate} size="lg" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calcular Proyecciones
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Costo Total de Inicio</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(results.summary.totalStartupCosts)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Punto de Equilibrio</span>
                </div>
                <p className="text-2xl font-bold">{results.breakEven.breakEvenPoint} meses</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(results.breakEven.breakEvenRevenue)}/mes
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">ROI</span>
                </div>
                <p className="text-2xl font-bold">{results.investment.roi}%</p>
                <p className="text-sm text-muted-foreground">
                  Retorno de inversión
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {results.summary.isProfitable ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">Rentabilidad</span>
                </div>
                <p className="text-2xl font-bold">
                  {results.summary.isProfitable ? "Sí" : "No"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {results.summary.isProfitable ? "Rentable" : "No rentable"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {results.summary.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.summary.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Análisis de Inversión</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Inversión Total:</span>
                      <span className="font-medium">{formatCurrency(results.investment.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retorno Mensual Promedio:</span>
                      <span className="font-medium">{formatCurrency(results.investment.monthlyReturn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Período de Recuperación:</span>
                      <span className="font-medium">{results.investment.paybackPeriod} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NPV (Valor Presente Neto):</span>
                      <span className="font-medium">{formatCurrency(results.investment.npv)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TIR (Tasa Interna de Retorno):</span>
                      <span className="font-medium">{results.investment.irr}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Proyección de los Primeros 6 Meses</h3>
                  <div className="space-y-1">
                    {results.projections.slice(0, 6).map((projection) => (
                      <div key={projection.month} className="flex justify-between text-sm">
                        <span>Mes {projection.month}:</span>
                        <div className="flex gap-4">
                          <span>Ingresos: {formatCurrency(projection.revenue)}</span>
                          <span>Utilidad: {formatCurrency(projection.profit)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
