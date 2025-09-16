"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getSidebarDataByRole } from "@/lib/sidebarData";
import { UserRole, InstitutionType } from "@/types";

interface RoleBasedNavigationProps {
  role: UserRole;
  institutionType?: InstitutionType;
  className?: string;
}

export function RoleBasedNavigation({ role, institutionType, className }: RoleBasedNavigationProps) {
  const pathname = usePathname();
  const sidebarData = getSidebarDataByRole(role, institutionType);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={cn("space-y-6", className)}>
      {sidebarData.navGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {group.title}
          </h3>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive(item.url)
                      ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive(item.url)
                        ? "text-blue-700"
                        : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
