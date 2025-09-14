"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import { FinancialCalculatorService } from "@/lib/financialCalculatorService";

interface FinancialCalculatorProps {
  className?: string;
}

export function FinancialCalculator({ className }: FinancialCalculatorProps) {
  const [activeTab, setActiveTab] = useState("metrics");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Financial Metrics Inputs
  const [financialInputs, setFinancialInputs] = useState({
    revenue: 0,
    costOfGoodsSold: 0,
    operatingExpenses: 0,
    otherExpenses: 0,
    cashOnHand: 0,
    monthlyExpenses: 0,
    customers: 0,
    acquisitionCost: 0,
    averageOrderValue: 0,
    purchaseFrequency: 0,
    churnRate: 0,
    growthRate: 0
  });

  // Investment Metrics Inputs
  const [investmentInputs, setInvestmentInputs] = useState({
    currentValuation: 0,
    investmentAmount: 0,
    expectedExitValuation: 0,
    expectedExitYears: 0
  });

  // Loan Metrics Inputs
  const [loanInputs, setLoanInputs] = useState({
    principal: 0,
    annualInterestRate: 0,
    termYears: 0
  });

  // Break Even Inputs
  const [breakEvenInputs, setBreakEvenInputs] = useState({
    fixedCosts: 0,
    variableCostPerUnit: 0,
    pricePerUnit: 0
  });

  const calculateFinancialMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/financial-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "financial_metrics",
          inputs: financialInputs
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.result);
      }
    } catch (error) {
      console.error("Error calculating financial metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateInvestmentMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/financial-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "investment_metrics",
          inputs: investmentInputs
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.result);
      }
    } catch (error) {
      console.error("Error calculating investment metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateLoanMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/financial-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "loan_metrics",
          inputs: loanInputs
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.result);
      }
    } catch (error) {
      console.error("Error calculating loan metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBreakEven = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/financial-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "break_even",
          inputs: breakEvenInputs
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.result);
      }
    } catch (error) {
      console.error("Error calculating break even:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Calculadora Financiera
          </CardTitle>
          <CardDescription>
            Calcula métricas financieras, inversiones, préstamos y más
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="investment">Inversión</TabsTrigger>
              <TabsTrigger value="loan">Préstamo</TabsTrigger>
              <TabsTrigger value="breakeven">Punto de Equilibrio</TabsTrigger>
            </TabsList>

            {/* Financial Metrics Tab */}
            <TabsContent value="metrics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Métricas Financieras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="revenue">Ingresos Anuales (USD)</Label>
                      <Input
                        id="revenue"
                        type="number"
                        value={financialInputs.revenue}
                        onChange={(e) => setFinancialInputs(prev => ({ ...prev, revenue: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="costOfGoodsSold">Costo de Bienes Vendidos (USD)</Label>
                      <Input
                        id="costOfGoodsSold"
                        type="number"
                        value={financialInputs.costOfGoodsSold}
                        onChange={(e) => setFinancialInputs(prev => ({ ...prev, costOfGoodsSold: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="operatingExpenses">Gastos Operativos (USD)</Label>
                      <Input
                        id="operatingExpenses"
                        type="number"
                        value={financialInputs.operatingExpenses}
                        onChange={(e) => setFinancialInputs(prev => ({ ...prev, operatingExpenses: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="otherExpenses">Otros Gastos (USD)</Label>
                      <Input
                        id="otherExpenses"
                        type="number"
                        value={financialInputs.otherExpenses}
                        onChange={(e) => setFinancialInputs(prev => ({ ...prev, otherExpenses: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cashOnHand">Efectivo Disponible (USD)</Label>
                      <Input
                        id="cashOnHand"
                        type="number"
                        value={financialInputs.cashOnHand}
                        onChange={(e) => setFinancialInputs(prev => ({ ...prev, cashOnHand: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthlyExpenses">Gastos Mensuales (USD)</Label>
                      <Input
                        id="monthlyExpenses"
                        type="number"
                        value={financialInputs.monthlyExpenses}
                        onChange={(e) => setFinancialInputs(prev => ({ ...prev, monthlyExpenses: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="customers">Número de Clientes</Label>
                      <Input
                        id="customers"
                        type="number"
                        value={financialInputs.customers}
                        onChange={(e) => setFinancialInputs(prev => ({ ...prev, customers: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="acquisitionCost">Costo de Adquisición por Cliente (USD)</Label>
                      <Input
                        id="acquisitionCost"
                        type="number"
                        value={financialInputs.acquisitionCost}
                        onChange={(e) => setFinancialInputs(prev => ({ ...prev, acquisitionCost: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="averageOrderValue">Valor Promedio de Pedido (USD)</Label>
                      <Input
                        id="averageOrderValue"
                        type="number"
                        value={financialInputs.averageOrderValue}
                        onChange={(e) => setFinancialInputs(prev => ({ ...prev, averageOrderValue: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchaseFrequency">Frecuencia de Compra (veces/año)</Label>
                      <Input
                        id="purchaseFrequency"
                        type="number"
                        value={financialInputs.purchaseFrequency}
                        onChange={(e) => setFinancialInputs(prev => ({ ...prev, purchaseFrequency: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="churnRate">Tasa de Abandono (decimal)</Label>
                      <Input
                        id="churnRate"
                        type="number"
                        step="0.01"
                        value={financialInputs.churnRate}
                        onChange={(e) => setFinancialInputs(prev => ({ ...prev, churnRate: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="growthRate">Tasa de Crecimiento (decimal)</Label>
                      <Input
                        id="growthRate"
                        type="number"
                        step="0.01"
                        value={financialInputs.growthRate}
                        onChange={(e) => setFinancialInputs(prev => ({ ...prev, growthRate: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <Button onClick={calculateFinancialMetrics} disabled={isLoading} className="w-full">
                    {isLoading ? "Calculando..." : "Calcular Métricas"}
                  </Button>

                  {results && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Resultados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Ingresos:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.revenue)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Gastos:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.expenses)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Ganancia Bruta:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.grossProfit)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Ganancia Neta:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.netProfit)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Margen de Ganancia:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatPercentage(results.profitMargin)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Flujo de Efectivo:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.cashFlow)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tasa de Quema:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.burnRate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Runway (meses):</span>
                              <span className="font-medium">{results.runway.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>CAC:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.customerAcquisitionCost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>LTV:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.customerLifetimeValue)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>LTV/CAC Ratio:</span>
                              <span className="font-medium">{results.ltvCacRatio.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Investment Metrics Tab */}
            <TabsContent value="investment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Métricas de Inversión
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentValuation">Valoración Actual (USD)</Label>
                      <Input
                        id="currentValuation"
                        type="number"
                        value={investmentInputs.currentValuation}
                        onChange={(e) => setInvestmentInputs(prev => ({ ...prev, currentValuation: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="investmentAmount">Cantidad de Inversión (USD)</Label>
                      <Input
                        id="investmentAmount"
                        type="number"
                        value={investmentInputs.investmentAmount}
                        onChange={(e) => setInvestmentInputs(prev => ({ ...prev, investmentAmount: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expectedExitValuation">Valoración de Salida Esperada (USD)</Label>
                      <Input
                        id="expectedExitValuation"
                        type="number"
                        value={investmentInputs.expectedExitValuation}
                        onChange={(e) => setInvestmentInputs(prev => ({ ...prev, expectedExitValuation: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expectedExitYears">Años hasta la Salida</Label>
                      <Input
                        id="expectedExitYears"
                        type="number"
                        value={investmentInputs.expectedExitYears}
                        onChange={(e) => setInvestmentInputs(prev => ({ ...prev, expectedExitYears: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <Button onClick={calculateInvestmentMetrics} disabled={isLoading} className="w-full">
                    {isLoading ? "Calculando..." : "Calcular Inversión"}
                  </Button>

                  {results && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Resultados de Inversión</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Valoración Pre-Money:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.preMoneyValuation)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Valoración Post-Money:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.postMoneyValuation)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Porcentaje de Propiedad:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatPercentage(results.ownershipPercentage)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Múltiplo de Retorno:</span>
                              <span className="font-medium">{results.returnMultiple.toFixed(2)}x</span>
                            </div>
                            <div className="flex justify-between">
                              <span>TIR:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatPercentage(results.irr)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Equity Ofrecido:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatPercentage(results.equityOffered)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Loan Metrics Tab */}
            <TabsContent value="loan" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Métricas de Préstamo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="principal">Principal (USD)</Label>
                      <Input
                        id="principal"
                        type="number"
                        value={loanInputs.principal}
                        onChange={(e) => setLoanInputs(prev => ({ ...prev, principal: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="annualInterestRate">Tasa de Interés Anual (%)</Label>
                      <Input
                        id="annualInterestRate"
                        type="number"
                        step="0.01"
                        value={loanInputs.annualInterestRate}
                        onChange={(e) => setLoanInputs(prev => ({ ...prev, annualInterestRate: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="termYears">Plazo (años)</Label>
                      <Input
                        id="termYears"
                        type="number"
                        value={loanInputs.termYears}
                        onChange={(e) => setLoanInputs(prev => ({ ...prev, termYears: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <Button onClick={calculateLoanMetrics} disabled={isLoading} className="w-full">
                    {isLoading ? "Calculando..." : "Calcular Préstamo"}
                  </Button>

                  {results && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Resultados del Préstamo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Pago Mensual:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.monthlyPayment)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total de Intereses:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.totalInterest)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total a Pagar:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatCurrency(results.totalPayment)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Plazo (meses):</span>
                              <span className="font-medium">{results.termMonths}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tasa Efectiva:</span>
                              <span className="font-medium">{FinancialCalculatorService.formatPercentage(results.effectiveRate)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Break Even Tab */}
            <TabsContent value="breakeven" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Punto de Equilibrio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fixedCosts">Costos Fijos (USD)</Label>
                      <Input
                        id="fixedCosts"
                        type="number"
                        value={breakEvenInputs.fixedCosts}
                        onChange={(e) => setBreakEvenInputs(prev => ({ ...prev, fixedCosts: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="variableCostPerUnit">Costo Variable por Unidad (USD)</Label>
                      <Input
                        id="variableCostPerUnit"
                        type="number"
                        value={breakEvenInputs.variableCostPerUnit}
                        onChange={(e) => setBreakEvenInputs(prev => ({ ...prev, variableCostPerUnit: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pricePerUnit">Precio por Unidad (USD)</Label>
                      <Input
                        id="pricePerUnit"
                        type="number"
                        value={breakEvenInputs.pricePerUnit}
                        onChange={(e) => setBreakEvenInputs(prev => ({ ...prev, pricePerUnit: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <Button onClick={calculateBreakEven} disabled={isLoading} className="w-full">
                    {isLoading ? "Calculando..." : "Calcular Punto de Equilibrio"}
                  </Button>

                  {results && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Resultados del Punto de Equilibrio</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{results.units}</div>
                            <div className="text-sm text-muted-foreground">Unidades</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{FinancialCalculatorService.formatCurrency(results.revenue)}</div>
                            <div className="text-sm text-muted-foreground">Ingresos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{results.months}</div>
                            <div className="text-sm text-muted-foreground">Meses</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
