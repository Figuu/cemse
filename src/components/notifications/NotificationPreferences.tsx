"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Monitor,
  Briefcase,
  MessageSquare,
  GraduationCap,
  Award,
  Save,
  RotateCcw
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationPreferencesProps {
  className?: string;
}

export function NotificationPreferences({ className }: NotificationPreferencesProps) {
  const { preferences, updatePreferences, isLoading } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState({
    email: true,
    push: true,
    inApp: true,
    jobApplications: true,
    jobOffers: true,
    messages: true,
    courses: true,
    certificates: true
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences(localPreferences);
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  };

  const handleToggle = (key: keyof typeof localPreferences) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Preferencias de Notificaciones</h2>
          <p className="text-muted-foreground">
            Configura cómo y cuándo recibir notificaciones
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Configuración General
            </CardTitle>
            <CardDescription>
              Configura los tipos de notificaciones que deseas recibir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base">
                  Notificaciones por Email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones importantes por correo electrónico
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={localPreferences.email}
                onCheckedChange={() => handleToggle("email")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="text-base">
                  Notificaciones Push
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones en tiempo real en tu dispositivo
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={localPreferences.push}
                onCheckedChange={() => handleToggle("push")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="in-app-notifications" className="text-base">
                  Notificaciones en la Aplicación
                </Label>
                <p className="text-sm text-muted-foreground">
                  Muestra notificaciones dentro de la aplicación
                </p>
              </div>
              <Switch
                id="in-app-notifications"
                checked={localPreferences.inApp}
                onCheckedChange={() => handleToggle("inApp")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Tipos de Contenido
            </CardTitle>
            <CardDescription>
              Selecciona qué tipos de contenido te interesan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <div className="space-y-0.5">
                  <Label htmlFor="job-applications" className="text-base">
                    Aplicaciones de Trabajo
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones sobre aplicaciones de trabajo
                  </p>
                </div>
              </div>
              <Switch
                id="job-applications"
                checked={localPreferences.jobApplications}
                onCheckedChange={() => handleToggle("jobApplications")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-green-600" />
                <div className="space-y-0.5">
                  <Label htmlFor="job-offers" className="text-base">
                    Ofertas de Trabajo
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones sobre nuevas ofertas de trabajo
                  </p>
                </div>
              </div>
              <Switch
                id="job-offers"
                checked={localPreferences.jobOffers}
                onCheckedChange={() => handleToggle("jobOffers")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-red-600" />
                <div className="space-y-0.5">
                  <Label htmlFor="messages" className="text-base">
                    Mensajes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones sobre mensajes recibidos
                  </p>
                </div>
              </div>
              <Switch
                id="messages"
                checked={localPreferences.messages}
                onCheckedChange={() => handleToggle("messages")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 text-orange-600" />
                <div className="space-y-0.5">
                  <Label htmlFor="courses" className="text-base">
                    Cursos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones sobre cursos y actualizaciones
                  </p>
                </div>
              </div>
              <Switch
                id="courses"
                checked={localPreferences.courses}
                onCheckedChange={() => handleToggle("courses")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-yellow-600" />
                <div className="space-y-0.5">
                  <Label htmlFor="certificates" className="text-base">
                    Certificados
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones sobre certificados obtenidos
                  </p>
                </div>
              </div>
              <Switch
                id="certificates"
                checked={localPreferences.certificates}
                onCheckedChange={() => handleToggle("certificates")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Ayuda</CardTitle>
            <CardDescription>
              Información sobre las notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones importantes por correo electrónico
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Smartphone className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium">Push</h4>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones en tiempo real en tu dispositivo
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Monitor className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-medium">En la App</h4>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones dentro de la aplicación
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
