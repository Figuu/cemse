"use client";

import { useSession } from "next-auth/react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Briefcase, 
  Users, 
  Building2, 
  GraduationCap, 
  Lightbulb,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  Settings
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "YOUTH":
        return "Joven";
      case "COMPANIES":
        return "Empresa";
      case "INSTITUTION":
        return "Institución";
      case "SUPERADMIN":
        return "Administrador";
      default:
        return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "YOUTH":
        return "Explora cursos, busca empleo y desarrolla tu perfil profesional";
      case "COMPANIES":
        return "Gestiona ofertas de trabajo y conecta con talento joven";
      case "INSTITUTION":
        return "Administra cursos, recursos y usuarios de tu institución";
      case "SUPERADMIN":
        return "Administra toda la plataforma y supervisa el sistema";
      default:
        return "Bienvenido a Emplea Emprende";
    }
  };

  const getRoleActions = (role: string) => {
    switch (role) {
      case "YOUTH":
        return [
          { name: "Explorar Cursos", href: "/courses", icon: GraduationCap, color: "bg-blue-500" },
          { name: "Buscar Empleos", href: "/jobs", icon: Briefcase, color: "bg-green-500" },
          { name: "Mi Perfil", href: "/profile", icon: Users, color: "bg-purple-500" },
          { name: "Emprendimiento", href: "/entrepreneurship", icon: Lightbulb, color: "bg-orange-500" },
        ];
      case "COMPANIES":
        return [
          { name: "Publicar Oferta", href: "/jobs/create", icon: Briefcase, color: "bg-green-500" },
          { name: "Ver Aplicaciones", href: "/jobs/applications", icon: Users, color: "bg-blue-500" },
          { name: "Mi Perfil", href: "/profile", icon: Building2, color: "bg-purple-500" },
          { name: "Estadísticas", href: "/company/stats", icon: TrendingUp, color: "bg-orange-500" },
        ];
      case "INSTITUTION":
        return [
          { name: "Crear Curso", href: "/courses/create", icon: GraduationCap, color: "bg-blue-500" },
          { name: "Gestionar Usuarios", href: "/admin/users", icon: Users, color: "bg-green-500" },
          { name: "Recursos", href: "/resources", icon: BookOpen, color: "bg-purple-500" },
          { name: "Reportes", href: "/admin/reports", icon: TrendingUp, color: "bg-orange-500" },
        ];
      case "SUPERADMIN":
        return [
          { name: "Administración", href: "/admin", icon: Building2, color: "bg-red-500" },
          { name: "Usuarios", href: "/admin/users", icon: Users, color: "bg-blue-500" },
          { name: "Estudiantes", href: "/students", icon: GraduationCap, color: "bg-green-500" },
          { name: "Recursos", href: "/resources", icon: BookOpen, color: "bg-purple-500" },
        ];
      default:
        return [];
    }
  };

  const getRoleStats = (role: string) => {
    // Return empty stats - real data should come from role-specific dashboard components
    // This function is kept for fallback purposes only
    switch (role) {
      case "YOUTH":
        return [
          { title: "Cursos Completados", value: "0", icon: CheckCircle, change: { value: 0, type: "neutral" as const } },
          { title: "Certificados", value: "0", icon: Award, change: { value: 0, type: "neutral" as const } },
          { title: "Aplicaciones Enviadas", value: "0", icon: Briefcase, change: { value: 0, type: "neutral" as const } },
          { title: "Horas de Estudio", value: "0", icon: Clock, description: "Total" },
        ];
      case "COMPANIES":
        return [
          { title: "Ofertas Activas", value: "0", icon: Briefcase, change: { value: 0, type: "neutral" as const } },
          { title: "Aplicaciones Recibidas", value: "0", icon: Users, change: { value: 0, type: "neutral" as const } },
          { title: "Candidatos Contratados", value: "0", icon: CheckCircle, change: { value: 0, type: "neutral" as const } },
          { title: "Vistas de Perfil", value: "0", icon: TrendingUp, change: { value: 0, type: "neutral" as const } },
        ];
      case "INSTITUTION":
        return [
          { title: "Cursos Activos", value: "0", icon: GraduationCap, change: { value: 0, type: "neutral" as const } },
          { title: "Estudiantes", value: "0", icon: Users, change: { value: 0, type: "neutral" as const } },
          { title: "Recursos Publicados", value: "0", icon: BookOpen, change: { value: 0, type: "neutral" as const } },
          { title: "Certificados Emitidos", value: "0", icon: Award, change: { value: 0, type: "neutral" as const } },
        ];
      case "SUPERADMIN":
        return [
          { title: "Usuarios Totales", value: "0", icon: Users, change: { value: 0, type: "neutral" as const } },
          { title: "Cursos Activos", value: "0", icon: GraduationCap, change: { value: 0, type: "neutral" as const } },
          { title: "Ofertas de Trabajo", value: "0", icon: Briefcase, change: { value: 0, type: "neutral" as const } },
          { title: "Instituciones", value: "0", icon: Building2, change: { value: 0, type: "neutral" as const } },
        ];
      default:
        return [];
    }
  };

  const actions = getRoleActions(session?.user.role || "");
  const stats = getRoleStats(session?.user.role || "");

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-card shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-foreground">
            ¡Bienvenido a Emplea Emprende!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {getRoleDescription(session?.user.role || "")}
          </p>
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getRoleDisplayName(session?.user.role || "")}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatsCards stats={stats} />

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-foreground mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${action.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-foreground">
                        {action.name}
                      </h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href={action.href}>
                        Acceder
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={[]} />
    </div>
  );
}
