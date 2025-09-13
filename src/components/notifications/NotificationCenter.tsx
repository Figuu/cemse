"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Trash2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useNotifications, Notification } from "@/hooks/useNotifications";

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    limit: 50,
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

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case "unread":
        return !notification.read;
      case "applications":
        return notification.type === "APPLICATION_STATUS_CHANGE";
      case "jobs":
        return notification.type === "JOB_ALERT";
      case "messages":
        return notification.type === "MESSAGE";
      case "courses":
        return notification.type === "COURSE_UPDATE";
      default:
        return true;
    }
  });

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = async () => {
    for (const notificationId of selectedNotifications) {
      await markAsRead(notificationId);
    }
    setSelectedNotifications([]);
  };

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Centro de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Centro de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar notificaciones</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Centro de Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {notifications.length} notificaciones totales
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
                <MarkAsRead className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">No leídas ({unreadCount})</TabsTrigger>
            <TabsTrigger value="applications">Aplicaciones</TabsTrigger>
            <TabsTrigger value="jobs">Trabajos</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="courses">Cursos</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {filteredNotifications.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSelectAll}
                  >
                    {selectedNotifications.length === filteredNotifications.length ? "Deseleccionar todo" : "Seleccionar todo"}
                  </Button>
                  {selectedNotifications.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkMarkAsRead}
                    >
                      <MarkAsRead className="h-4 w-4 mr-2" />
                      Marcar seleccionadas como leídas
                    </Button>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {filteredNotifications.length} notificaciones
                </span>
              </div>
            )}

            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay notificaciones</h3>
                <p className="text-muted-foreground">
                  {activeTab === "unread" 
                    ? "No tienes notificaciones sin leer"
                    : "No hay notificaciones en esta categoría"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "border rounded-lg p-4 transition-all hover:shadow-md",
                      !notification.read && "border-l-4",
                      !notification.read && getNotificationColor(notification.type),
                      selectedNotifications.includes(notification.id) && "ring-2 ring-blue-500"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={cn(
                            "text-sm font-medium",
                            !notification.read && "font-semibold"
                          )}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">
                                Nuevo
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>

                        {notification.jobApplication && (
                          <div className="bg-white/50 rounded p-2 mb-2">
                            <p className="text-xs text-muted-foreground">
                              <strong>Empleo:</strong> {notification.jobApplication.jobTitle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Empresa:</strong> {notification.jobApplication.company}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Estado:</strong> {notification.jobApplication.status}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSelectNotification(notification.id)}
                            >
                              {selectedNotifications.includes(notification.id) ? "Deseleccionar" : "Seleccionar"}
                            </Button>
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Marcar como leída
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
