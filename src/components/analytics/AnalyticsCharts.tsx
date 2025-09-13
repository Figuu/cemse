"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity,
  Calendar,
  Users,
  Briefcase,
  Eye,
  Heart,
  Share2
} from "lucide-react";
import { CompanyAnalytics, HiringMetrics, formatNumber, formatPercentage } from "@/hooks/useCompanyAnalytics";

interface AnalyticsChartsProps {
  analytics: CompanyAnalytics;
  hiringMetrics: HiringMetrics;
}

export function AnalyticsCharts({ analytics, hiringMetrics }: AnalyticsChartsProps) {
  // Simple chart components (in a real app, you'd use a charting library like Recharts)
  const SimpleBarChart = ({ data, title, color = "blue" }: { data: Array<{ label: string; value: number }>; title: string; color?: string }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="space-y-4">
        <h4 className="font-semibold">{title}</h4>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-sm text-muted-foreground">{item.label}</div>
              <div className="flex-1 bg-muted rounded-full h-6 relative">
                <div 
                  className={`h-6 rounded-full bg-${color}-500 flex items-center justify-end pr-2`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                >
                  <span className="text-xs text-white font-medium">{formatNumber(item.value)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SimpleLineChart = ({ data, title, color = "blue" }: { data: Array<{ date: string; value: number }>; title: string; color?: string }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="space-y-4">
        <h4 className="font-semibold">{title}</h4>
        <div className="h-64 flex items-end gap-1">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full bg-${color}-500 rounded-t`}
                style={{ height: `${(item.value / maxValue) * 200}px` }}
                title={`${item.date}: ${formatNumber(item.value)}`}
              ></div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(item.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SimplePieChart = ({ data, title }: { data: Array<{ label: string; value: number; color: string }>; title: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="space-y-4">
        <h4 className="font-semibold">{title}</h4>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatNumber(item.value)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatPercentage((item.value / total) * 100)})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Prepare data for charts
  const applicationStatusData = Object.entries(analytics.applicationStatusDistribution).map(([status, count]) => ({
    label: status,
    value: count,
  }));

  const applicationSourceData = Object.entries(analytics.applicationSources).map(([source, count], index) => ({
    label: source,
    value: count,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4],
  }));

  const dailyMetricsData = analytics.dailyMetrics.map(item => ({
    date: item.date,
    value: item.applications,
  }));

  const hiringFunnelData = Object.entries(analytics.hiringFunnel).map(([stage, count]) => ({
    label: stage,
    value: count,
  }));

  const conversionRatesData = Object.entries(hiringMetrics.conversionRates).map(([stage, rate]) => ({
    label: stage.replace(/([A-Z])/g, ' $1').trim(),
    value: rate,
  }));

  const departmentData = Object.entries(hiringMetrics.departmentMetrics).map(([dept, metrics]) => ({
    label: dept,
    value: metrics.total,
  }));

  const employmentTypeData = Object.entries(hiringMetrics.employmentTypeMetrics).map(([type, metrics]) => ({
    label: type,
    value: metrics.total,
  }));

  const experienceLevelData = Object.entries(hiringMetrics.experienceLevelMetrics).map(([level, metrics]) => ({
    label: level,
    value: metrics.total,
  }));

  const dailyHiringData = hiringMetrics.dailyHiringMetrics.map(item => ({
    date: item.date,
    value: item.applications,
  }));

  const topJobsData = analytics.topPerformingJobs.slice(0, 5).map(job => ({
    label: job.title,
    value: job.applications,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Application Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Distribución de Aplicaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimplePieChart 
            data={applicationStatusData.map((item, index) => ({
              ...item,
              color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6],
            }))}
            title=""
          />
        </CardContent>
      </Card>

      {/* Application Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Fuentes de Aplicaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart 
            data={applicationSourceData}
            title=""
            color="green"
          />
        </CardContent>
      </Card>

      {/* Daily Applications Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencia de Aplicaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLineChart 
            data={dailyMetricsData}
            title=""
            color="blue"
          />
        </CardContent>
      </Card>

      {/* Hiring Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Embudo de Contratación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart 
            data={hiringFunnelData}
            title=""
            color="purple"
          />
        </CardContent>
      </Card>

      {/* Conversion Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tasas de Conversión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart 
            data={conversionRatesData}
            title=""
            color="orange"
          />
        </CardContent>
      </Card>

      {/* Department Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Aplicaciones por Departamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart 
            data={departmentData}
            title=""
            color="indigo"
          />
        </CardContent>
      </Card>

      {/* Employment Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tipo de Empleo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimplePieChart 
            data={employmentTypeData.map((item, index) => ({
              ...item,
              color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6],
            }))}
            title=""
          />
        </CardContent>
      </Card>

      {/* Experience Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Nivel de Experiencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart 
            data={experienceLevelData}
            title=""
            color="teal"
          />
        </CardContent>
      </Card>

      {/* Daily Hiring Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tendencia de Contrataciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLineChart 
            data={dailyHiringData}
            title=""
            color="green"
          />
        </CardContent>
      </Card>

      {/* Top Performing Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Trabajos con Mejor Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart 
            data={topJobsData}
            title=""
            color="red"
          />
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Métricas de Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(analytics.engagementMetrics.averageJobViews)}
              </div>
              <div className="text-sm text-muted-foreground">Vistas Promedio</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(analytics.engagementMetrics.averageJobApplications)}
              </div>
              <div className="text-sm text-muted-foreground">Aplicaciones Promedio</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatNumber(analytics.engagementMetrics.averageJobLikes)}
              </div>
              <div className="text-sm text-muted-foreground">Likes Promedio</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(analytics.engagementMetrics.averageJobShares)}
              </div>
              <div className="text-sm text-muted-foreground">Shares Promedio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
