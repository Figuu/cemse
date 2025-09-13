"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleAccessConfig {
  allowedRoles: string[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export function useRoleAccess(config: RoleAccessConfig) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // Check if authentication is required
    if (config.requireAuth !== false && !session) {
      router.push("/sign-in");
      return;
    }

    // Check if user has required role
    if (session && config.allowedRoles.length > 0) {
      const userRole = session.user?.role;
      if (!userRole || !config.allowedRoles.includes(userRole)) {
        router.push(config.redirectTo || "/dashboard");
        return;
      }
    }
  }, [session, status, router, config]);

  return {
    hasAccess: session?.user?.role ? config.allowedRoles.includes(session.user.role) : false,
    isLoading: status === "loading",
    user: session?.user,
  };
}

// Helper function to check if user has specific role
export function useHasRole(role: string) {
  const { data: session } = useSession();
  return session?.user?.role === role;
}

// Helper function to check if user has any of the specified roles
export function useHasAnyRole(roles: string[]) {
  const { data: session } = useSession();
  return session?.user?.role ? roles.includes(session.user.role) : false;
}

