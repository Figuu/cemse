"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
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

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  jobTitle: string;
  professionalSummary: string;
  experienceLevel: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    jobTitle: "",
    professionalSummary: "",
    experienceLevel: "",
  });

  // Initialize form data when session loads
  useEffect(() => {
    if (session?.user?.profile) {
      const profile = session.user.profile;
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        address: profile.address || "",
        jobTitle: profile.jobTitle || "",
        professionalSummary: profile.professionalSummary || "",
        experienceLevel: (profile as any).experienceLevel || "",
      });
    }
  }, [session?.user?.profile]);

  // Handle form field changes
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data to original values when canceling
      if (session?.user?.profile) {
        const profile = session.user.profile;
        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          phone: profile.phone || "",
          address: profile.address || "",
          jobTitle: profile.jobTitle || "",
          professionalSummary: profile.professionalSummary || "",
          experienceLevel: (profile as any).experienceLevel || "",
        });
      }
    }
    setIsEditing(!isEditing);
  };

  // Handle save
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profiles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el perfil');
      }

      const result = await response.json();
      
      // Update form data with the response from server
      if (result.profile) {
        setFormData({
          firstName: result.profile.firstName || "",
          lastName: result.profile.lastName || "",
          phone: result.profile.phone || "",
          address: result.profile.address || "",
          jobTitle: result.profile.jobTitle || "",
          professionalSummary: result.profile.professionalSummary || "",
          experienceLevel: result.profile.experienceLevel || "",
        });
      }

      toast.success("Perfil actualizado", {
        description: "Tu perfil se ha actualizado correctamente.",
      });

      // Update the session with new profile data
      await update();

      setIsEditing(false);
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo actualizar el perfil. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                onClick={handleEditToggle}
                disabled={isLoading}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
              {isEditing && (
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Guardando..." : "Guardar"}
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
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
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
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={formData.professionalSummary}
                    onChange={(e) => handleInputChange('professionalSummary', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Cuéntanos sobre ti..."
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Años de Experiencia</Label>
                  <Select 
                    value={formData.experienceLevel} 
                    onValueChange={(value) => handleInputChange('experienceLevel', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona experiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO_EXPERIENCE">Sin experiencia</SelectItem>
                      <SelectItem value="ENTRY_LEVEL">Nivel inicial (0-2 años)</SelectItem>
                      <SelectItem value="MID_LEVEL">Nivel medio (3-5 años)</SelectItem>
                      <SelectItem value="SENIOR_LEVEL">Nivel senior (6+ años)</SelectItem>
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
