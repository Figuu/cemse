"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialProjection, BreakEvenAnalysis, InvestmentAnalysis } from "@/lib/financialCalculatorService";
import { formatCurrency } from "@/lib/utils";

interface FinancialChartsProps {
  projections: FinancialProjection[];
  breakEven: BreakEvenAnalysis;
  investment: InvestmentAnalysis;
  currency: string;
}

export function FinancialCharts({ projections, breakEven, investment, currency }: FinancialChartsProps) {
  const formatCurrencyValue = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const maxRevenue = Math.max(...projections.map(p => p.revenue));
  const maxCosts = Math.max(...projections.map(p => p.costs));
  const maxValue = Math.max(maxRevenue, maxCosts);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Ingresos vs Costos</TabsTrigger>
          <TabsTrigger value="profit">Utilidades</TabsTrigger>
          <TabsTrigger value="cumulative">Utilidad Acumulada</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proyección de Ingresos vs Costos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Simple bar chart representation */}
                <div className="space-y-2">
                  {projections.slice(0, 12).map((projection) => (
                    <div key={projection.month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Mes {projection.month}</span>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Ingresos: {formatCurrencyValue(projection.revenue)}</span>
                          <span>Costos: {formatCurrencyValue(projection.costs)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 h-4">
                        <div 
                          className="bg-green-500 rounded-l"
                          style={{ 
                            width: `${(projection.revenue / maxValue) * 100}%`,
                            minWidth: projection.revenue > 0 ? '4px' : '0px'
                          }}
                        />
                        <div 
                          className="bg-red-500 rounded-r"
                          style={{ 
                            width: `${(projection.costs / maxValue) * 100}%`,
                            minWidth: projection.costs > 0 ? '4px' : '0px'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Ingresos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Costos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilidad Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {projections.slice(0, 12).map((projection) => {
                  const isPositive = projection.profit >= 0;
                  const barWidth = Math.abs(projection.profit) / Math.max(...projections.map(p => Math.abs(p.profit))) * 100;
                  
                  return (
                    <div key={projection.month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Mes {projection.month}</span>
                        <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrencyValue(projection.profit)}
                        </span>
                      </div>
                      <div className="flex justify-start">
                        <div 
                          className={`h-4 rounded ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ 
                            width: `${barWidth}%`,
                            minWidth: Math.abs(projection.profit) > 0 ? '4px' : '0px'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cumulative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilidad Acumulada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {projections.slice(0, 12).map((projection) => {
                  const isPositive = projection.cumulativeProfit >= 0;
                  const maxCumulative = Math.max(...projections.map(p => Math.abs(p.cumulativeProfit)));
                  const barWidth = Math.abs(projection.cumulativeProfit) / maxCumulative * 100;
                  
                  return (
                    <div key={projection.month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Mes {projection.month}</span>
                        <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrencyValue(projection.cumulativeProfit)}
                        </span>
                      </div>
                      <div className="flex justify-start">
                        <div 
                          className={`h-4 rounded ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ 
                            width: `${barWidth}%`,
                            minWidth: Math.abs(projection.cumulativeProfit) > 0 ? '4px' : '0px'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Break-even Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Punto de Equilibrio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {breakEven.breakEvenPoint}
              </div>
              <div className="text-sm text-blue-800">Meses para Equilibrio</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrencyValue(breakEven.breakEvenRevenue)}
              </div>
              <div className="text-sm text-green-800">Ingresos Necesarios</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {breakEven.isProfitable ? "Sí" : "No"}
              </div>
              <div className="text-sm text-purple-800">¿Es Rentable?</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Inversión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-700">
                {formatCurrencyValue(investment.totalInvestment)}
              </div>
              <div className="text-sm text-gray-600">Inversión Total</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {investment.roi}%
              </div>
              <div className="text-sm text-blue-800">ROI</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {investment.paybackPeriod}
              </div>
              <div className="text-sm text-green-800">Meses Recuperación</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {investment.irr}%
              </div>
              <div className="text-sm text-purple-800">TIR</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
