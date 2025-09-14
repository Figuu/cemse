"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, 
  Users, 
  Clock, 
  TrendingUp,
  Building,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface JobPlacementChartProps {
  data: {
    totalApplications: number;
    applicationsByStatus: Record<string, number>;
    applicationsByMonth: Array<{ month: string; count: number }>;
    averageTimeToHire: number;
    placementRate: number;
    topHiringCompanies: Array<{ company: string; count: number }>;
    topJobCategories: Array<{ category: string; count: number }>;
  };
}

export function JobPlacementChart({ data }: JobPlacementChartProps) {
  const statusColors = {
    'PENDING': 'text-yellow-600',
    'REVIEWED': 'text-blue-600',
    'INTERVIEWED': 'text-purple-600',
    'HIRED': 'text-green-600',
    'REJECTED': 'text-red-600'
  };

  const statusIcons = {
    'PENDING': AlertCircle,
    'REVIEWED': Eye,
    'INTERVIEWED': Users,
    'HIRED': CheckCircle,
    'REJECTED': XCircle
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'REVIEWED': 'Revisado',
      'INTERVIEWED': 'Entrevistado',
      'HIRED': 'Contratado',
      'REJECTED': 'Rechazado'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Briefcase className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Aplicaciones
                </div>
                <div className="text-2xl font-bold">{data.totalApplications.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Tasa de Colocación
                </div>
                <div className="text-2xl font-bold">{data.placementRate.toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Tiempo Promedio
                </div>
                <div className="text-2xl font-bold">{data.averageTimeToHire} días</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Contratados
                </div>
                <div className="text-2xl font-bold">
                  {data.applicationsByStatus['HIRED'] || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Aplicaciones por Estado</CardTitle>
            <CardDescription>
              Distribución de aplicaciones según su estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.applicationsByStatus).map(([status, count]) => {
                const percentage = (count / data.totalApplications) * 100;
                const Icon = statusIcons[status as keyof typeof statusIcons] || AlertCircle;
                const color = statusColors[status as keyof typeof statusColors] || 'text-gray-600';
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="font-medium">{getStatusLabel(status)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
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

        {/* Applications by Month */}
        <Card>
          <CardHeader>
            <CardTitle>Aplicaciones por Mes</CardTitle>
            <CardDescription>
              Tendencias de aplicaciones en los últimos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.applicationsByMonth.slice(-6).map((item, index) => {
                const maxCount = Math.max(...data.applicationsByMonth.map(m => m.count));
                const percentage = (item.count / maxCount) * 100;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.month}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Hiring Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Empresas que Más Contratan
            </CardTitle>
            <CardDescription>
              Ranking de empresas por número de contrataciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topHiringCompanies.slice(0, 10).map((company, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium truncate">{company.company}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {company.count} contrataciones
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Job Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Categorías Más Populares
            </CardTitle>
            <CardDescription>
              Categorías de trabajo con más aplicaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topJobCategories.slice(0, 10).map((category, index) => {
                const percentage = (category.count / data.totalApplications) * 100;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
                        {index + 1}
                      </div>
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {category.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
