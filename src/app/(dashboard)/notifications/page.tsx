"use client";

import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function NotificationsPage() {
  return (
    <RoleGuard allowedRoles={["YOUTH", "COMPANY", "INSTITUTION", "ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground">
            Mantente al día con las últimas actualizaciones
          </p>
        </div>
        
        <NotificationCenter />
      </div>
    </RoleGuard>
  );
}
