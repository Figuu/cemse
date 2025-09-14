"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  PieChart,
  BarChart3,
  Target,
  Users
} from "lucide-react";

interface RevenueChartProps {
  data: {
    totalRevenue: number;
    revenueByMonth: Array<{ month: string; amount: number }>;
    revenueBySource: Record<string, number>;
    averageRevenuePerUser: number;
    churnRate: number;
  };
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const totalRevenue = data.totalRevenue;
  const revenueSources = Object.entries(data.revenueBySource);
  const totalBySources = revenueSources.reduce((sum, [, amount]) => sum + amount, 0);

  // Calculate growth rate
  const currentMonth = data.revenueByMonth[data.revenueByMonth.length - 1];
  const previousMonth = data.revenueByMonth[data.revenueByMonth.length - 2];
  const growthRate = previousMonth ? 
    ((currentMonth.amount - previousMonth.amount) / previousMonth.amount) * 100 : 0;

  const revenueMetrics = [
    {
      title: "Ingresos Totales",
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: growthRate > 0 ? `+${growthRate.toFixed(1)}%` : `${growthRate.toFixed(1)}%`,
      changeType: growthRate >= 0 ? "positive" : "negative"
    },
    {
      title: "Ingresos por Usuario",
      value: formatCurrency(data.averageRevenuePerUser),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+5.2%",
      changeType: "positive" as const
    },
    {
      title: "Tasa de Abandono",
      value: formatPercentage(data.churnRate),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
      change: "-2.1%",
      changeType: "positive" as const
    }
  ];

  const getChangeIcon = (changeType: string) => {
    return changeType === "positive" ? 
      <TrendingUp className="h-3 w-3" /> : 
      <TrendingDown className="h-3 w-3" />;
  };

  const getChangeColor = (changeType: string) => {
    return changeType === "positive" ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {revenueMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center space-x-1 text-xs">
                      <div className={`flex items-center space-x-1 ${getChangeColor(metric.changeType)}`}>
                        {getChangeIcon(metric.changeType)}
                        <span>{metric.change}</span>
                      </div>
                      <span className="text-muted-foreground">vs mes anterior</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Ingresos por Mes
            </CardTitle>
            <CardDescription>
              Tendencias de ingresos en los últimos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.revenueByMonth.map((month, index) => {
                const maxAmount = Math.max(...data.revenueByMonth.map(m => m.amount));
                const percentage = (month.amount / maxAmount) * 100;
                const isCurrentMonth = index === data.revenueByMonth.length - 1;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${isCurrentMonth ? 'text-blue-600' : 'text-muted-foreground'}`}>
                        {month.month}
                      </span>
                      {isCurrentMonth && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          Actual
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${isCurrentMonth ? 'bg-blue-600' : 'bg-green-600'}`}
                          style={{ width: `${percentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-20 text-right">
                        {formatCurrency(month.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Source */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Ingresos por Fuente
            </CardTitle>
            <CardDescription>
              Distribución de ingresos por categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueSources.map(([source, amount], index) => {
                const percentage = (amount / totalBySources) * 100;
                const colors = [
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-orange-500',
                  'bg-pink-500'
                ];
                const color = colors[index % colors.length];
                
                const sourceLabels: Record<string, string> = {
                  'subscriptions': 'Suscripciones',
                  'premium_features': 'Características Premium',
                  'certifications': 'Certificaciones'
                };
                
                return (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <span className="font-medium">{sourceLabels[source] || source}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${percentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(amount)}</div>
                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Insights de Ingresos
          </CardTitle>
          <CardDescription>
            Análisis detallado del rendimiento financiero
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(data.totalRevenue)}
              </div>
              <div className="text-sm text-muted-foreground">
                Ingresos Totales
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatCurrency(data.averageRevenuePerUser)}
              </div>
              <div className="text-sm text-muted-foreground">
                ARPU (Ingresos por Usuario)
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {formatPercentage(1 - data.churnRate)}
              </div>
              <div className="text-sm text-muted-foreground">
                Tasa de Retención
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Crecimiento Mensual
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
