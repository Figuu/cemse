"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Target, 
  PieChart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface FinancialCalculatorProps {
  financialData: {
    initialInvestment: number;
    monthlyOperatingCosts: number;
    revenueProjection: number;
    breakEvenPoint: number;
    estimatedROI: number;
  };
  onUpdate: (data: any) => void;
}

const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({ 
  financialData, 
  onUpdate 
}) => {
  const [inputs, setInputs] = useState({
    initialInvestment: financialData.initialInvestment || 0,
    monthlyOperatingCosts: financialData.monthlyOperatingCosts || 0,
    revenueProjection: financialData.revenueProjection || 0,
  });

  const [calculations, setCalculations] = useState({
    breakEvenPoint: 0,
    estimatedROI: 0,
    monthlyProfit: 0,
    annualProfit: 0,
    paybackPeriod: 0,
  });

  // Calculate financial metrics
  useEffect(() => {
    const { initialInvestment, monthlyOperatingCosts, revenueProjection } = inputs;
    
    if (monthlyOperatingCosts > 0 && revenueProjection > 0) {
      const monthlyProfit = revenueProjection - monthlyOperatingCosts;
      const annualProfit = monthlyProfit * 12;
      const breakEvenPoint = initialInvestment / (monthlyProfit > 0 ? monthlyProfit : 1);
      const estimatedROI = initialInvestment > 0 ? (annualProfit / initialInvestment) * 100 : 0;
      const paybackPeriod = monthlyProfit > 0 ? initialInvestment / monthlyProfit : 0;

      const newCalculations = {
        breakEvenPoint: Math.ceil(breakEvenPoint),
        estimatedROI: Math.round(estimatedROI * 100) / 100,
        monthlyProfit,
        annualProfit,
        paybackPeriod: Math.ceil(paybackPeriod),
      };

      setCalculations(newCalculations);

      // Update parent component
      onUpdate({
        ...inputs,
        breakEvenPoint: newCalculations.breakEvenPoint,
        estimatedROI: newCalculations.estimatedROI,
      });
    }
  }, [inputs, onUpdate]);

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(amount);
  };

  const getROIColor = (roi: number) => {
    if (roi > 20) return 'text-green-600';
    if (roi > 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getROIBadge = (roi: number) => {
    if (roi > 20) return 'default';
    if (roi > 10) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Costos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="initialInvestment">Inversión Inicial Requerida</Label>
              <Input
                id="initialInvestment"
                type="number"
                value={inputs.initialInvestment}
                onChange={(e) => handleInputChange('initialInvestment', e.target.value)}
                placeholder="0"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Capital inicial para comenzar
              </p>
            </div>

            <div>
              <Label htmlFor="monthlyOperatingCosts">Costos Operativos Mensuales</Label>
              <Input
                id="monthlyOperatingCosts"
                type="number"
                value={inputs.monthlyOperatingCosts}
                onChange={(e) => handleInputChange('monthlyOperatingCosts', e.target.value)}
                placeholder="0"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Gastos fijos mensuales
              </p>
            </div>

            <div>
              <Label htmlFor="revenueProjection">Proyección de Ingresos</Label>
              <Input
                id="revenueProjection"
                type="number"
                value={inputs.revenueProjection}
                onChange={(e) => handleInputChange('revenueProjection', e.target.value)}
                placeholder="0"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ingresos mensuales esperados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Métricas Clave
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Punto de Equilibrio:</span>
              <Badge variant="outline" className="text-lg font-bold">
                {calculations.breakEvenPoint} meses
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ROI Estimado:</span>
              <Badge variant={getROIBadge(calculations.estimatedROI)} className="text-lg font-bold">
                {calculations.estimatedROI.toFixed(1)}%
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Utilidad Mensual:</span>
              <span className={`text-lg font-bold ${calculations.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(calculations.monthlyProfit)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Utilidad Anual:</span>
              <span className={`text-lg font-bold ${calculations.annualProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(calculations.annualProfit)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Período de Recuperación:</span>
              <Badge variant="outline" className="text-lg font-bold">
                {calculations.paybackPeriod} meses
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Salud Financiera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ROI Assessment */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {calculations.estimatedROI > 15 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium">ROI</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {calculations.estimatedROI > 20 
                  ? "Excelente retorno de inversión"
                  : calculations.estimatedROI > 10
                  ? "Buen retorno de inversión"
                  : "ROI bajo, considera optimizar costos"
                }
              </p>
            </div>

            {/* Break-even Assessment */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {calculations.breakEvenPoint <= 12 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium">Punto de Equilibrio</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {calculations.breakEvenPoint <= 12
                  ? "Equilibrio alcanzable en menos de un año"
                  : "Equilibrio tardará más de un año"
                }
              </p>
            </div>

            {/* Profitability Assessment */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {calculations.monthlyProfit > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">Rentabilidad</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {calculations.monthlyProfit > 0
                  ? "El negocio es rentable mensualmente"
                  : "El negocio no es rentable mensualmente"
                }
              </p>
            </div>

            <Separator />

            {/* Summary */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Resumen</h4>
              <p className="text-xs text-muted-foreground">
                {calculations.estimatedROI > 15 && calculations.breakEvenPoint <= 12 && calculations.monthlyProfit > 0
                  ? "✅ Excelente viabilidad financiera"
                  : calculations.estimatedROI > 10 && calculations.monthlyProfit > 0
                  ? "⚠️ Viabilidad financiera moderada"
                  : "❌ Revisar modelo de negocio"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Desglose Detallado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Costos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Inversión inicial:</span>
                  <span className="font-medium">{formatCurrency(inputs.initialInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costos mensuales:</span>
                  <span className="font-medium">{formatCurrency(inputs.monthlyOperatingCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costos anuales:</span>
                  <span className="font-medium">{formatCurrency(inputs.monthlyOperatingCosts * 12)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Ingresos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Ingresos mensuales:</span>
                  <span className="font-medium">{formatCurrency(inputs.revenueProjection)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingresos anuales:</span>
                  <span className="font-medium">{formatCurrency(inputs.revenueProjection * 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Margen mensual:</span>
                  <span className={`font-medium ${calculations.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.monthlyProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialCalculator;