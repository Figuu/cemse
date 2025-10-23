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
  onItemClick?: () => void;
}

export function RoleBasedNavigation({ role, institutionType, className, onItemClick }: RoleBasedNavigationProps) {
  const pathname = usePathname();
  const sidebarData = getSidebarDataByRole(role, institutionType);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={cn("space-y-4", className)}>
      {sidebarData.navGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {group.title}
          </h3>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={onItemClick}
                  className={cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive(item.url)
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
                  )}
                >
                  <Icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                      isActive(item.url)
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-600"
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
