"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Building, 
  Briefcase, 
  FileText, 
  GraduationCap, 
  BookOpen, 
  MessageSquare, 
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface OverviewMetricsProps {
  data: {
    totalUsers: number;
    totalCompanies: number;
    totalJobs: number;
    totalApplications: number;
    totalCourses: number;
    totalEnrollments: number;
    totalMessages: number;
    totalBusinessPlans: number;
  };
}

export function OverviewMetrics({ data }: OverviewMetricsProps) {
  const metrics = [
    {
      title: "Usuarios Totales",
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeType: "positive" as const
    },
    {
      title: "Empresas",
      value: data.totalCompanies.toLocaleString(),
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8%",
      changeType: "positive" as const
    },
    {
      title: "Trabajos Publicados",
      value: data.totalJobs.toLocaleString(),
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+15%",
      changeType: "positive" as const
    },
    {
      title: "Aplicaciones",
      value: data.totalApplications.toLocaleString(),
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "+22%",
      changeType: "positive" as const
    },
    {
      title: "Cursos",
      value: data.totalCourses.toLocaleString(),
      icon: GraduationCap,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      change: "+5%",
      changeType: "positive" as const
    },
    {
      title: "Inscripciones",
      value: data.totalEnrollments.toLocaleString(),
      icon: BookOpen,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      change: "+18%",
      changeType: "positive" as const
    },
    {
      title: "Mensajes",
      value: data.totalMessages.toLocaleString(),
      icon: MessageSquare,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      change: "+35%",
      changeType: "positive" as const
    },
    {
      title: "Planes de Negocio",
      value: data.totalBusinessPlans.toLocaleString(),
      icon: Lightbulb,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      change: "+25%",
      changeType: "positive" as const
    }
  ];

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "positive":
        return <TrendingUp className="h-3 w-3" />;
      case "negative":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                <div className={`flex items-center space-x-1 ${getChangeColor(metric.changeType)}`}>
                  {getChangeIcon(metric.changeType)}
                  <span>{metric.change}</span>
                </div>
                <span className="text-muted-foreground">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
