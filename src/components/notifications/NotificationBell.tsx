"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageCircle, 
  Briefcase,
  BookOpen,
  Settings,
  MarkAsRead,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { useNotifications, Notification } from "@/hooks/useNotifications";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
  } = useNotifications({
    limit: 10,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPLICATION_STATUS_CHANGE":
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case "JOB_ALERT":
        return <Bell className="h-4 w-4 text-yellow-600" />;
      case "MESSAGE":
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      case "COURSE_UPDATE":
        return <BookOpen className="h-4 w-4 text-purple-600" />;
      case "SYSTEM":
        return <Settings className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "APPLICATION_STATUS_CHANGE":
        return "border-l-blue-500 bg-blue-50";
      case "JOB_ALERT":
        return "border-l-yellow-500 bg-yellow-50";
      case "MESSAGE":
        return "border-l-green-500 bg-green-50";
      case "COURSE_UPDATE":
        return "border-l-purple-500 bg-purple-50";
      case "SYSTEM":
        return "border-l-gray-500 bg-gray-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notificaciones</CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="secondary">
                    {unreadCount} sin leer
                  </Badge>
                )}
              </div>
              <CardDescription>
                {notifications.length} notificaciones totales
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay notificaciones
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors",
                        !notification.read && "border-l-4",
                        !notification.read && getNotificationColor(notification.type)
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={cn(
                              "text-sm font-medium truncate",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>

                          {notification.jobApplication && (
                            <div className="bg-white/50 rounded p-2 mb-2">
                              <p className="text-xs text-muted-foreground">
                                <strong>{notification.jobApplication.jobTitle}</strong> en {notification.jobApplication.company}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Marcar como leída
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {notifications.length > 5 && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setIsOpen(false);
                      // Navigate to full notification center
                      window.location.href = "/notifications";
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver todas las notificaciones
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
