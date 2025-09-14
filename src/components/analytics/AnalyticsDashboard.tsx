"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Download,
  RefreshCw
} from "lucide-react";
import { OverviewMetrics } from "./OverviewMetrics";
import { UserEngagementChart } from "./UserEngagementChart";
import { JobPlacementChart } from "./JobPlacementChart";
import { CourseCompletionChart } from "./CourseCompletionChart";
import { EntrepreneurshipChart } from "./EntrepreneurshipChart";
import { RevenueChart } from "./RevenueChart";
import { DemographicsChart } from "./DemographicsChart";

interface AnalyticsDashboardProps {
  className?: string;
}

interface OverviewData {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  totalCourses: number;
  totalEnrollments: number;
  totalMessages: number;
  totalBusinessPlans: number;
}

interface UserEngagementData {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  pageViews: number;
  bounceRate: number;
}

interface DemographicsData {
  usersByAge: { ageGroup: string; count: number; }[];
  usersByLocation: { location: string; count: number; }[];
  usersByEducation: { education: string; count: number; }[];
  usersByExperience: { experience: string; count: number; }[];
}

interface JobPlacementData {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  applicationsByMonth: { month: string; count: number; }[];
  averageTimeToHire: number;
  placementRate: number;
  topHiringCompanies: { company: string; count: number; }[];
  topJobCategories: { category: string; count: number; }[];
}

interface CourseCompletionData {
  totalEnrollments: number;
  completedCourses: number;
  completionRate: number;
  averageCompletionTime: number;
  topCourses: { course: string; enrollments: number; completions: number; }[];
  certificatesIssued: number;
  courseRatings: { course: string; rating: number; reviews: number; }[];
}

interface EntrepreneurshipData {
  totalBusinessPlans: number;
  plansByStage: Record<string, number>;
  totalFundingRaised: number;
  averageFundingGoal: number;
  topIndustries: { industry: string; count: number; }[];
  successStories: number;
}

interface RevenueData {
  totalRevenue: number;
  revenueByMonth: { month: string; amount: number; }[];
  revenueBySource: Record<string, number>;
  averageRevenuePerUser: number;
  churnRate: number;
}

interface AnalyticsData {
  overview: OverviewData;
  userEngagement: UserEngagementData;
  demographics: DemographicsData;
  jobPlacement: JobPlacementData;
  courseCompletion: CourseCompletionData;
  entrepreneurship: EntrepreneurshipData;
  revenue: RevenueData;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (timeRange !== "all") {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
          case "7d":
            startDate.setDate(endDate.getDate() - 7);
            break;
          case "30d":
            startDate.setDate(endDate.getDate() - 30);
            break;
          case "90d":
            startDate.setDate(endDate.getDate() - 90);
            break;
          case "1y":
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        }
        
        params.append("startDate", startDate.toISOString());
        params.append("endDate", endDate.toISOString());
      }

      const response = await fetch(`/api/analytics?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalyticsData(data.data as AnalyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleExport = () => {
    if (!analyticsData) return;
    
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Cargando analytics...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p className="text-lg font-medium">Error al cargar analytics</p>
              <p className="text-sm mt-2">{error}</p>
              <Button onClick={fetchAnalytics} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-lg font-medium">No hay datos disponibles</p>
              <p className="text-sm text-muted-foreground mt-2">
                No se encontraron datos de analytics para el período seleccionado
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Dashboard de Analytics
              </CardTitle>
              <CardDescription>
                Métricas y análisis completos de la plataforma
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="90d">Últimos 90 días</SelectItem>
                  <SelectItem value="1y">Último año</SelectItem>
                  <SelectItem value="all">Todo el tiempo</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={fetchAnalytics}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="jobs">Trabajos</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="entrepreneurship">Emprendimiento</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <OverviewMetrics data={analyticsData.overview} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserEngagementChart data={analyticsData.userEngagement} />
            <DemographicsChart data={analyticsData.demographics} />
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <UserEngagementChart data={analyticsData.userEngagement} />
          <DemographicsChart data={analyticsData.demographics} />
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <JobPlacementChart data={analyticsData.jobPlacement} />
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <CourseCompletionChart data={analyticsData.courseCompletion} />
        </TabsContent>

        {/* Entrepreneurship Tab */}
        <TabsContent value="entrepreneurship" className="space-y-6">
          <EntrepreneurshipChart data={analyticsData.entrepreneurship} />
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <RevenueChart data={analyticsData.revenue} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
