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
import { toast } from "sonner";
import { 
  User, 
  Briefcase, 
  Edit,
  Save,
  Building2,
  School
} from "lucide-react";
import { UserPreferences } from "@/components/profile/UserPreferences";
import { InstitutionSection } from "@/components/profile/InstitutionSection";
import { CompanySection } from "@/components/profile/CompanySection";
import { ProfileImageUpload } from "@/components/profile/ProfileImageUpload";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  jobTitle: string;
  professionalSummary: string;
  experienceLevel: string;
  avatarUrl: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
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
    avatarUrl: "",
  });

  // Initialize form data when session loads
  useEffect(() => {
    if (session?.user?.id) {
      // Always fetch fresh data from API instead of relying on session
      const fetchProfile = async () => {
        try {
          const response = await fetch('/api/profile/me');
          if (response.ok) {
            const data = await response.json();
            if (data.profile) {
              setFormData({
                firstName: data.profile.firstName || "",
                lastName: data.profile.lastName || "",
                phone: data.profile.phone || "",
                address: data.profile.address || "",
                jobTitle: data.profile.jobTitle || "",
                professionalSummary: data.profile.professionalSummary || "",
                experienceLevel: data.profile.experienceLevel || "",
                avatarUrl: data.profile.avatarUrl || "",
              });
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      fetchProfile();
    }
  }, [session?.user?.id]);

  // Handle form field changes
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle image update
  const handleImageUpdate = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      avatarUrl: imageUrl
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
          avatarUrl: profile.avatarUrl || "",
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el perfil');
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
          avatarUrl: result.profile.avatarUrl || "",
        });
      }

      toast.success("Perfil actualizado", {
        description: "Tu perfil se ha actualizado correctamente.",
      });

      // Fetch the updated profile data from the API
      try {
        const profileResponse = await fetch('/api/profile/me');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.profile) {
            // Update the form data with the fresh data from the database
            setFormData({
              firstName: profileData.profile.firstName || "",
              lastName: profileData.profile.lastName || "",
              phone: profileData.profile.phone || "",
              address: profileData.profile.address || "",
              jobTitle: profileData.profile.jobTitle || "",
              professionalSummary: profileData.profile.professionalSummary || "",
              experienceLevel: profileData.profile.experienceLevel || "",
              avatarUrl: profileData.profile.avatarUrl || "",
            });
          }
        }
      } catch (error) {
        console.error('Error fetching updated profile:', error);
      }

      // Force refresh the form data from the database
      try {
        const refreshResponse = await fetch('/api/profile/me');
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.profile) {
            setFormData({
              firstName: refreshData.profile.firstName || "",
              lastName: refreshData.profile.lastName || "",
              phone: refreshData.profile.phone || "",
              address: refreshData.profile.address || "",
              jobTitle: refreshData.profile.jobTitle || "",
              professionalSummary: refreshData.profile.professionalSummary || "",
              experienceLevel: refreshData.profile.experienceLevel || "",
              avatarUrl: refreshData.profile.avatarUrl || "",
            });
          }
        }
      } catch (error) {
        console.error('Error force refreshing profile:', error);
      }

      // Update the session
      await update();

      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "No se pudo actualizar el perfil. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return <div>Cargando...</div>;
  }

  const profile = session.user.profile;

  return (
    <div className="space-y-6">

      {/* Profile Header */}
      <div className="bg-card shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ProfileImageUpload
              currentImageUrl={formData.avatarUrl}
              onImageUpdate={handleImageUpdate}
              disabled={!isEditing}
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {formData.firstName} {formData.lastName}
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


      {/* Basic Profile Information */}
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

      {/* Role-specific sections */}
      {session.user.role === "INSTITUTION" && (
        <InstitutionSection />
      )}

      {session.user.role === "COMPANIES" && (
        <CompanySection />
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <UserPreferences />
        </CardContent>
      </Card>
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

