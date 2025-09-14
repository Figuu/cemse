"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Building, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Users, 
  GraduationCap,
  Save,
  X
} from "lucide-react";

interface InstitutionProfileFormProps {
  institution?: {
    id: string;
    name: string;
    description: string;
    type: "MUNICIPALITY" | "NGO" | "TRAINING_CENTER";
    city: string;
    country: string;
    website?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    isActive: boolean;
  } | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  className?: string;
}

export function InstitutionProfileForm({
  institution,
  onSubmit,
  onCancel,
  className
}: InstitutionProfileFormProps) {
  const [formData, setFormData] = useState({
    name: institution?.name || "",
    description: institution?.description || "",
    type: institution?.type || "TRAINING_CENTER",
    city: institution?.city || "",
    country: institution?.country || "",
    website: institution?.website || "",
    phone: institution?.phone || "",
    email: institution?.email || "",
    logoUrl: institution?.logoUrl || "",
    isActive: institution?.isActive ?? true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MUNICIPALITY":
        return Building;
      case "NGO":
        return Users;
      case "TRAINING_CENTER":
        return GraduationCap;
      default:
        return Building;
    }
  };

  const TypeIcon = getTypeIcon(formData.type);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TypeIcon className="h-5 w-5 mr-2" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Datos principales de la institución
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre de la Institución *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nombre de la institución"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo de Institución *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MUNICIPALITY">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Municipio
                      </div>
                    </SelectItem>
                    <SelectItem value="NGO">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        ONG
                      </div>
                    </SelectItem>
                    <SelectItem value="TRAINING_CENTER">
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Centro de Capacitación
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe la misión y objetivos de la institución"
                rows={3}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Institución Activa</Label>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Ubicación
            </CardTitle>
            <CardDescription>
              Información de ubicación de la institución
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Ciudad"
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">País *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="País"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Información de Contacto
            </CardTitle>
            <CardDescription>
              Datos de contacto de la institución
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@institucion.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://www.institucion.com"
              />
            </div>

            <div>
              <Label htmlFor="logoUrl">URL del Logo</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Guardando..." : institution ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  );
}
