"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Bell, 
  Shield, 
  Globe, 
  Save,
  RefreshCw
} from "lucide-react";

interface UserPreferencesProps {
  className?: string;
}

export function UserPreferences({ className }: UserPreferencesProps) {
  const [preferences, setPreferences] = useState({
    // Notification preferences
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    jobAlerts: true,
    courseUpdates: true,
    messageNotifications: true,
    weeklyDigest: true,
    
    // Privacy preferences
    profileVisibility: "public", // public, private, connections
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: true,
    allowJobInvitations: true,
    
    // Language and region
    language: "es",
    timezone: "America/Mexico_City",
    dateFormat: "DD/MM/YYYY",
    currency: "MXN",
    
    // Security preferences
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: "30", // minutes
    
    // Display preferences
    theme: "system", // light, dark, system
    compactView: false,
    showOnlineStatus: true,
    
    // Communication preferences
    preferredContactMethod: "email",
    responseTime: "24", // hours
    autoReply: false,
    autoReplyMessage: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Show success message
  };

  const handleReset = () => {
    // Reset to default preferences
    setPreferences({
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      jobAlerts: true,
      courseUpdates: true,
      messageNotifications: true,
      weeklyDigest: true,
      profileVisibility: "public",
      showEmail: false,
      showPhone: false,
      showLocation: true,
      allowMessages: true,
      allowJobInvitations: true,
      language: "es",
      timezone: "America/Mexico_City",
      dateFormat: "DD/MM/YYYY",
      currency: "MXN",
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: "30",
      theme: "system",
      compactView: false,
      showOnlineStatus: true,
      preferredContactMethod: "email",
      responseTime: "24",
      autoReply: false,
      autoReplyMessage: "",
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Configura cómo y cuándo quieres recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">Tipos de Notificaciones</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones importantes por correo electrónico
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Notificaciones Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones en tu navegador
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">Notificaciones SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones por mensaje de texto
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={preferences.smsNotifications}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, smsNotifications: checked }))
                  }
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Contenido de Notificaciones</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="job-alerts">Alertas de Empleo</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones sobre nuevas ofertas de trabajo
                  </p>
                </div>
                <Switch
                  id="job-alerts"
                  checked={preferences.jobAlerts}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, jobAlerts: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="course-updates">Actualizaciones de Cursos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones sobre cursos y certificaciones
                  </p>
                </div>
                <Switch
                  id="course-updates"
                  checked={preferences.courseUpdates}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, courseUpdates: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="message-notifications">Mensajes</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones sobre nuevos mensajes
                  </p>
                </div>
                <Switch
                  id="message-notifications"
                  checked={preferences.messageNotifications}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, messageNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-digest">Resumen Semanal</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe un resumen semanal de actividad
                  </p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={preferences.weeklyDigest}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, weeklyDigest: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Privacidad
          </CardTitle>
          <CardDescription>
            Controla quién puede ver tu información y contactarte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="profile-visibility">Visibilidad del Perfil</Label>
              <Select
                value={preferences.profileVisibility}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, profileVisibility: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="connections">Solo Conexiones</SelectItem>
                  <SelectItem value="private">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-email">Mostrar Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que otros usuarios vean tu email
                  </p>
                </div>
                <Switch
                  id="show-email"
                  checked={preferences.showEmail}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, showEmail: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-phone">Mostrar Teléfono</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que otros usuarios vean tu teléfono
                  </p>
                </div>
                <Switch
                  id="show-phone"
                  checked={preferences.showPhone}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, showPhone: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-location">Mostrar Ubicación</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que otros usuarios vean tu ubicación
                  </p>
                </div>
                <Switch
                  id="show-location"
                  checked={preferences.showLocation}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, showLocation: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-messages">Permitir Mensajes</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que otros usuarios te envíen mensajes
                  </p>
                </div>
                <Switch
                  id="allow-messages"
                  checked={preferences.allowMessages}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, allowMessages: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-job-invitations">Permitir Invitaciones de Trabajo</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que empresas te envíen invitaciones de trabajo
                  </p>
                </div>
                <Switch
                  id="allow-job-invitations"
                  checked={preferences.allowJobInvitations}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, allowJobInvitations: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language and Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Idioma y Región
          </CardTitle>
          <CardDescription>
            Configura tu idioma, zona horaria y formato de fecha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, timezone: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Mexico_City">México (GMT-6)</SelectItem>
                  <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-format">Formato de Fecha</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, dateFormat: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={preferences.currency}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                  <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Seguridad
          </CardTitle>
          <CardDescription>
            Configura las opciones de seguridad de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor-auth">Autenticación de Dos Factores</Label>
                <p className="text-sm text-muted-foreground">
                  Añade una capa extra de seguridad a tu cuenta
                </p>
              </div>
              <Switch
                id="two-factor-auth"
                checked={preferences.twoFactorAuth}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, twoFactorAuth: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="login-alerts">Alertas de Inicio de Sesión</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones cuando alguien inicie sesión en tu cuenta
                </p>
              </div>
              <Switch
                id="login-alerts"
                checked={preferences.loginAlerts}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, loginAlerts: checked }))
                }
              />
            </div>
            
            <div>
              <Label htmlFor="session-timeout">Tiempo de Expiración de Sesión</Label>
              <Select
                value={preferences.sessionTimeout}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, sessionTimeout: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="240">4 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Restablecer
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
