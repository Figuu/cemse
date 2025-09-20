"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EntrepreneurshipConnectionStatus } from "@prisma/client";

interface ConnectionStatusBadgeProps {
  status: EntrepreneurshipConnectionStatus | null;
  className?: string;
}

const statusConfig = {
  PENDING: {
    label: "Pendiente",
    variant: "secondary" as const,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  ACCEPTED: {
    label: "Conectado",
    variant: "default" as const,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  DECLINED: {
    label: "Rechazado",
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function ConnectionStatusBadge({ status, className }: ConnectionStatusBadgeProps) {
  if (!status) return null;

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}




