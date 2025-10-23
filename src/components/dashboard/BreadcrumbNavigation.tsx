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

  const truncateBreadcrumbs = (breadcrumbs: BreadcrumbItem[]): BreadcrumbItem[] => {
    // If we have more than 4 items, truncate middle items
    if (breadcrumbs.length > 4) {
      const first = breadcrumbs[0];
      const lastTwo = breadcrumbs.slice(-2);
      const truncated = [
        first,
        { name: '...', href: '#', current: false },
        ...lastTwo
      ];
      return truncated;
    }
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

  const breadcrumbs = truncateBreadcrumbs(generateBreadcrumbs(pathname));

  // Don't show breadcrumbs on the main dashboard
  if (pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className={cn("flex overflow-hidden", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
        {breadcrumbs.map((item, index) => (
          <li key={`${item.href}-${index}`} className="flex items-center min-w-0">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mx-1 sm:mx-2 flex-shrink-0" />
            )}
            {item.name === '...' ? (
              <span className="text-xs sm:text-sm font-medium text-gray-400 px-1">
                ...
              </span>
            ) : item.current ? (
              <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors truncate"
              >
                {index === 0 ? (
                  <div className="flex items-center min-w-0">
                    <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                ) : (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
