"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Briefcase, 
  Edit,
  Save,
  FileText,
  BarChart3
} from "lucide-react";
import { SkillsAssessment } from "@/components/profile/SkillsAssessment";
import { ResumeBuilder } from "@/components/profile/ResumeBuilder";
import { ProfileCompletion } from "@/components/profile/ProfileCompletion";
import { ProfileVerification } from "@/components/profile/ProfileVerification";
import { UserPreferences } from "@/components/profile/UserPreferences";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);

  if (!session?.user) {
    return <div>Cargando...</div>;
  }

  const profile = session.user.profile;
  const completionPercentage = calculateProfileCompletion(profile || {});

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-card shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.avatarUrl ? (
                  <Image 
                    src={profile.avatarUrl} 
                    alt={`${profile.firstName} ${profile.lastName}`}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <p className="text-muted-foreground">{session.user.email}</p>
                <div className="mt-2">
                  <Badge variant="secondary">
                    {getRoleDisplayName(session.user.role)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
              {isEditing && (
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <ProfileCompletion percentage={completionPercentage} />

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="skills">Habilidades</TabsTrigger>
          <TabsTrigger value="resume">CV</TabsTrigger>
          <TabsTrigger value="verification">Verificación</TabsTrigger>
          <TabsTrigger value="files">Archivos</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={profile?.firstName || ""}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={profile?.lastName || ""}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={session.user.email || ""}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={profile?.phone || ""}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Textarea
                    id="address"
                    value={profile?.address || ""}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Información Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título Profesional</Label>
                  <Input
                    id="title"
                    value={profile?.jobTitle || ""}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={profile?.professionalSummary || ""}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Cuéntanos sobre ti..."
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Años de Experiencia</Label>
                  <Select disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona experiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 años</SelectItem>
                      <SelectItem value="2-3">2-3 años</SelectItem>
                      <SelectItem value="4-5">4-5 años</SelectItem>
                      <SelectItem value="6-10">6-10 años</SelectItem>
                      <SelectItem value="10+">10+ años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <SkillsAssessment />
        </TabsContent>

        <TabsContent value="resume">
          <ResumeBuilder />
        </TabsContent>

        <TabsContent value="verification">
          <ProfileVerification />
        </TabsContent>

        <TabsContent value="files">
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Gestión de Archivos
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Sube y gestiona tus archivos personales
            </p>
            <div className="mt-6">
              <Button asChild>
                <a href="/profile/files">Gestionar Archivos</a>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Analíticas del Perfil
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Insights y métricas sobre tu perfil profesional
            </p>
            <div className="mt-6">
              <Button disabled>
                Ver Analíticas (No disponible)
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <UserPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getRoleDisplayName(role: string) {
  switch (role) {
    case "YOUTH":
      return "Joven";
    case "COMPANIES":
      return "Empresa";
    case "INSTITUTION":
      return "Institución";
    case "SUPERADMIN":
      return "Administrador";
    default:
      return role;
  }
}

function calculateProfileCompletion(profile: Record<string, unknown>): number {
  if (!profile) return 0;
  
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.phone,
    profile.address,
    profile.jobTitle,
    profile.professionalSummary,
    profile.skills,
    profile.workExperience,
    profile.educationHistory
  ];
  
  const completedFields = fields.filter(field => 
    field && typeof field === 'string' && field.trim().length > 0
  ).length;
  
  return Math.round((completedFields / fields.length) * 100);
}
