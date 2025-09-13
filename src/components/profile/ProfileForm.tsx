"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Briefcase } from "lucide-react";

interface ProfileFormProps {
  profile?: Record<string, unknown>;
  onSave?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function ProfileForm({ profile, onSave, onCancel, isEditing = false }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: (profile?.firstName as string) || "",
    lastName: (profile?.lastName as string) || "",
    email: (profile?.email as string) || "",
    phone: (profile?.phone as string) || "",
    address: (profile?.address as string) || "",
    title: (profile?.jobTitle as string) || "",
    bio: (profile?.professionalSummary as string) || "",
    experience: (profile?.workExperience as string) || "",
    birthDate: (profile?.birthDate as string) || "",
    gender: (profile?.gender as string) || "",
    education: (profile?.educationHistory as string) || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información Personal
            </CardTitle>
            <CardDescription>
              Información básica sobre ti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="gender">Género</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange("gender", value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefiero no decir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                disabled={!isEditing}
                rows={3}
                placeholder="Calle, Ciudad, País"
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
            <CardDescription>
              Información sobre tu carrera profesional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título Profesional</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                disabled={!isEditing}
                placeholder="Ej: Desarrollador Frontend, Diseñador UX, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="experience">Años de Experiencia</Label>
              <Select
                value={formData.experience}
                onValueChange={(value) => handleChange("experience", value)}
                disabled={!isEditing}
              >
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
            
            <div>
              <Label htmlFor="education">Nivel de Educación</Label>
              <Select
                value={formData.education}
                onValueChange={(value) => handleChange("education", value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona educación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">Bachillerato</SelectItem>
                  <SelectItem value="technical">Técnico</SelectItem>
                  <SelectItem value="bachelor">Licenciatura</SelectItem>
                  <SelectItem value="master">Maestría</SelectItem>
                  <SelectItem value="phd">Doctorado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                disabled={!isEditing}
                rows={4}
                placeholder="Cuéntanos sobre ti, tus intereses profesionales y objetivos..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar Cambios
          </Button>
        </div>
      )}
    </form>
  );
}
