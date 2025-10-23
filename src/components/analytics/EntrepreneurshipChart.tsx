"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Lightbulb, 
  DollarSign, 
  TrendingUp,
  Building,
  Target,
  Users,
  Award,
  BarChart3
} from "lucide-react";

interface EntrepreneurshipChartProps {
  data: {
    totalBusinessPlans: number;
    plansByStage: Record<string, number>;
    totalFundingRaised: number;
    averageFundingGoal: number;
    topIndustries: Array<{ industry: string; count: number }>;
    successStories: number;
  };
}

export function EntrepreneurshipChart({ data }: EntrepreneurshipChartProps) {
  const stageLabels = {
    'idea': 'Idea',
    'startup': 'Inicio',
    'growth': 'Crecimiento',
    'mature': 'Maduro'
  };

  const stageColors = {
    'idea': 'text-blue-600',
    'startup': 'text-green-600',
    'growth': 'text-purple-600',
    'mature': 'text-orange-600'
  };

  const stageBgColors = {
    'idea': 'bg-blue-100',
    'startup': 'bg-green-100',
    'growth': 'bg-purple-100',
    'mature': 'bg-orange-100'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const successRate = data.totalBusinessPlans > 0 ? 
    (data.successStories / data.totalBusinessPlans) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Lightbulb className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Planes de Negocio
                </div>
                <div className="text-2xl font-bold">{data.totalBusinessPlans.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Financiamiento Total
                </div>
                <div className="text-2xl font-bold">{formatCurrency(data.totalFundingRaised)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Meta Promedio
                </div>
                <div className="text-2xl font-bold">{formatCurrency(data.averageFundingGoal)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Award className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Historias de Éxito
                </div>
                <div className="text-2xl font-bold">{data.successStories}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Tasa de Éxito de Emprendimientos
          </CardTitle>
          <CardDescription>
            Porcentaje de emprendimientos que alcanzan el éxito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <div className="text-4xl font-bold mb-2">{successRate.toFixed(1)}%</div>
            <div className="text-lg font-medium text-muted-foreground mb-4">
              Tasa de Éxito
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-green-600 h-3 rounded-full" 
                style={{ width: `${successRate}%` } as React.CSSProperties}
              ></div>
            </div>
            <div className="text-sm text-muted-foreground">
              {data.successStories} de {data.totalBusinessPlans} emprendimientos exitosos
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plans by Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Planes por Etapa
            </CardTitle>
            <CardDescription>
              Distribución de planes de negocio por etapa de desarrollo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.plansByStage).map(([stage, count]) => {
                const percentage = (count / data.totalBusinessPlans) * 100;
                const color = stageColors[stage as keyof typeof stageColors] || 'text-gray-600';
                const bgColor = stageBgColors[stage as keyof typeof stageBgColors] || 'bg-gray-100';
                const label = stageLabels[stage as keyof typeof stageLabels] || stage;
                
                return (
                  <div key={stage} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${bgColor}`}></div>
                      <span className="font-medium">{label}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${bgColor.replace('bg-', 'bg-').replace('-100', '-500')}`}
                          style={{ width: `${percentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Industries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Industrias Más Populares
            </CardTitle>
            <CardDescription>
              Sectores con más planes de negocio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topIndustries.slice(0, 10).map((industry, index) => {
                const percentage = (industry.count / data.totalBusinessPlans) * 100;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <span className="font-medium">{industry.industry}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {industry.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funding Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Análisis de Financiamiento
          </CardTitle>
          <CardDescription>
            Métricas de financiamiento y metas de los emprendimientos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(data.totalFundingRaised)}
              </div>
              <div className="text-sm text-muted-foreground">
                Financiamiento Total Recaudado
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatCurrency(data.averageFundingGoal)}
              </div>
              <div className="text-sm text-muted-foreground">
                Meta Promedio de Financiamiento
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {((data.totalFundingRaised / (data.averageFundingGoal * data.totalBusinessPlans)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Progreso Promedio hacia la Meta
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
