"use client";

import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback,
  redirectTo = "/dashboard" 
}: RoleGuardProps) {
  const { hasAccess, isLoading } = useRoleAccess({ 
    allowedRoles, 
    redirectTo 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta página.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

