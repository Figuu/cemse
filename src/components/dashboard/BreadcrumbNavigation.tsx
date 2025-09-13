"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbNavigationProps {
  className?: string;
}

export function BreadcrumbNavigation({ className }: BreadcrumbNavigationProps) {
  const pathname = usePathname();

  const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Inicio', href: '/dashboard' }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Map segment to readable name
      const name = getSegmentName(segment);
      
      breadcrumbs.push({
        name,
        href: currentPath,
        current: isLast
      });
    });

    return breadcrumbs;
  };

  const getSegmentName = (segment: string): string => {
    const segmentMap: Record<string, string> = {
      'admin': 'Administración',
      'company': 'Empresa',
      'institution': 'Institución',
      'courses': 'Cursos',
      'jobs': 'Empleos',
      'entrepreneurship': 'Emprendimiento',
      'profile': 'Perfil',
      'settings': 'Configuración',
      'users': 'Usuarios',
      'companies': 'Empresas',
      'institutions': 'Instituciones',
      'students': 'Estudiantes',
      'candidates': 'Candidatos',
      'messages': 'Mensajes',
      'analytics': 'Estadísticas',
      'resources': 'Recursos',
      'news': 'Noticias',
      'content': 'Contenido',
      'database': 'Base de Datos',
      'applications': 'Aplicaciones',
      'certificates': 'Certificados',
      'create': 'Crear',
      'edit': 'Editar',
      'view': 'Ver'
    };

    return segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbs = generateBreadcrumbs(pathname);

  // Don't show breadcrumbs on the main dashboard
  if (pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className={cn("flex", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
            {item.current ? (
              <span className="text-sm font-medium text-gray-900">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {index === 0 ? (
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    {item.name}
                  </div>
                ) : (
                  item.name
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
