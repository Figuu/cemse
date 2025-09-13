"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  Briefcase, 
  Users, 
  Building2, 
  GraduationCap, 
  Lightbulb,
  Settings,
  BarChart3,
  FileText,
  UserCheck,
  MessageSquare,
  Shield,
  Database,
  Globe,
  Award,
  Bookmark,
  Search,
  Sparkles,
  Compass
} from "lucide-react";
import { UserRole } from "@/types";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavigationItem[];
}

interface RoleBasedNavigationProps {
  role: UserRole;
  className?: string;
}

export function RoleBasedNavigation({ role, className }: RoleBasedNavigationProps) {
  const pathname = usePathname();

  const getNavigationForRole = (role: UserRole): NavigationItem[] => {
    switch (role) {
      case "YOUTH":
        return [
          { name: "Inicio", href: "/dashboard", icon: BookOpen },
          { name: "Cursos", href: "/courses", icon: GraduationCap },
          { name: "Recomendaciones", href: "/recommendations", icon: Sparkles },
          { name: "Descubrir", href: "/discover", icon: Compass },
          { name: "Empleos", href: "/jobs", icon: Briefcase },
          { name: "Aplicaciones", href: "/applications", icon: FileText },
          { name: "Trabajos Guardados", href: "/jobs/bookmarked", icon: Bookmark },
          { name: "Búsquedas Guardadas", href: "/jobs/saved-searches", icon: Search },
          { name: "Perfiles", href: "/profiles", icon: Users },
          { name: "Emprendimiento", href: "/entrepreneurship", icon: Lightbulb },
          { name: "Mi Perfil", href: "/profile", icon: Users },
          { name: "Certificados", href: "/certificates", icon: Award },
        ];
      
      case "COMPANIES":
        return [
          { name: "Inicio", href: "/dashboard", icon: BookOpen },
          { name: "Ofertas de Trabajo", href: "/jobs", icon: Briefcase },
          { name: "Candidatos", href: "/candidates", icon: UserCheck },
          { name: "Mi Empresa", href: "/company", icon: Building2 },
          { name: "Mensajes", href: "/messages", icon: MessageSquare },
          { name: "Estadísticas", href: "/analytics", icon: BarChart3 },
          { name: "Configuración", href: "/settings", icon: Settings },
        ];
      
      case "INSTITUTION":
        return [
          { name: "Inicio", href: "/dashboard", icon: BookOpen },
          { name: "Cursos", href: "/courses", icon: GraduationCap },
          { name: "Estudiantes", href: "/students", icon: Users },
          { name: "Mi Institución", href: "/institution", icon: Building2 },
          { name: "Recursos", href: "/resources", icon: FileText },
          { name: "Noticias", href: "/news", icon: Globe },
          { name: "Estadísticas", href: "/analytics", icon: BarChart3 },
          { name: "Configuración", href: "/settings", icon: Settings },
        ];
      
      case "SUPERADMIN":
        return [
          { name: "Inicio", href: "/dashboard", icon: BookOpen },
          { name: "Administración", href: "/admin", icon: Shield },
          { name: "Usuarios", href: "/admin/users", icon: Users },
          { name: "Empresas", href: "/admin/companies", icon: Building2 },
          { name: "Instituciones", href: "/admin/institutions", icon: Building2 },
          { name: "Cursos", href: "/admin/courses", icon: GraduationCap },
          { name: "Empleos", href: "/admin/jobs", icon: Briefcase },
          { name: "Emprendimientos", href: "/admin/entrepreneurship", icon: Lightbulb },
          { name: "Contenido", href: "/admin/content", icon: FileText },
          { name: "Base de Datos", href: "/admin/database", icon: Database },
          { name: "Estadísticas", href: "/admin/analytics", icon: BarChart3 },
          { name: "Configuración", href: "/admin/settings", icon: Settings },
        ];
      
      default:
        return [
          { name: "Inicio", href: "/dashboard", icon: BookOpen },
        ];
    }
  };

  const navigation = getNavigationForRole(role);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={cn("space-y-1", className)}>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
              isActive(item.href)
                ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon
              className={cn(
                "mr-3 h-5 w-5 flex-shrink-0",
                isActive(item.href)
                  ? "text-blue-700"
                  : "text-gray-400 group-hover:text-gray-500"
              )}
            />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
