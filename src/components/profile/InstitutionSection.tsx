"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { School, Edit, Save } from "lucide-react";

interface InstitutionFormData {
  name: string;
  department: string;
  region: string;
  population: string;
  mayorName: string;
  mayorEmail: string;
  mayorPhone: string;
  address: string;
  website: string;
  phone: string;
  email: string;
  institutionType: string;
  customType: string;
  primaryColor: string;
  secondaryColor: string;
}

export function InstitutionSection() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [institution, setInstitution] = useState<any>(null);
  
  const [formData, setFormData] = useState<InstitutionFormData>({
    name: "",
    department: "",
    region: "",
    population: "",
    mayorName: "",
    mayorEmail: "",
    mayorPhone: "",
    address: "",
    website: "",
    phone: "",
    email: "",
    institutionType: "",
    customType: "",
    primaryColor: "",
    secondaryColor: "",
  });

  // Fetch institution data
  useEffect(() => {
    const fetchInstitution = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/institutions/by-user/${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setInstitution(data.institution);
          if (data.institution) {
            setFormData({
              name: data.institution.name || "",
              department: data.institution.department || "",
              region: data.institution.region || "",
              population: data.institution.population?.toString() || "",
              mayorName: data.institution.mayorName || "",
              mayorEmail: data.institution.mayorEmail || "",
              mayorPhone: data.institution.mayorPhone || "",
              address: data.institution.address || "",
              website: data.institution.website || "",
              phone: data.institution.phone || "",
              email: data.institution.email || "",
              institutionType: data.institution.institutionType || "",
              customType: data.institution.customType || "",
              primaryColor: data.institution.primaryColor || "",
              secondaryColor: data.institution.secondaryColor || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching institution:", error);
      }
    };

    fetchInstitution();
  }, [session?.user?.id]);

  const handleInputChange = (field: keyof InstitutionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditToggle = () => {
    if (isEditing && institution) {
      // Reset form data to original values when canceling
      setFormData({
        name: institution.name || "",
        department: institution.department || "",
        region: institution.region || "",
        population: institution.population?.toString() || "",
        mayorName: institution.mayorName || "",
        mayorEmail: institution.mayorEmail || "",
        mayorPhone: institution.mayorPhone || "",
        address: institution.address || "",
        website: institution.website || "",
        phone: institution.phone || "",
        email: institution.email || "",
        institutionType: institution.institutionType || "",
        customType: institution.customType || "",
        primaryColor: institution.primaryColor || "",
        secondaryColor: institution.secondaryColor || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!institution) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/institutions/${institution.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          population: formData.population ? parseInt(formData.population) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la institución');
      }

      const result = await response.json();
      setInstitution(result.institution);
      
      toast.success("Institución actualizada", {
        description: "La información de la institución se ha actualizado correctamente.",
      });

      setIsEditing(false);
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo actualizar la institución. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!institution) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <School className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Información de la Institución
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <p className="text-muted-foreground text-sm sm:text-base">
            No se encontró información de institución asociada a tu cuenta.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <School className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Información de la Institución
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleEditToggle}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
            {isEditing && (
              <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="institutionName">Nombre de la Institución</Label>
            <Input
              id="institutionName"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="department">Departamento</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="region">Región</Label>
            <Input
              id="region"
              value={formData.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="population">Población</Label>
            <Input
              id="population"
              type="number"
              value={formData.population}
              onChange={(e) => handleInputChange('population', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="institutionType">Tipo de Institución</Label>
          <Select 
            value={formData.institutionType} 
            onValueChange={(value) => handleInputChange('institutionType', value)}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MUNICIPALITY">Municipalidad</SelectItem>
              <SelectItem value="NGO">ONG</SelectItem>
              <SelectItem value="TRAINING_CENTER">Centro de Capacitación</SelectItem>
              <SelectItem value="FOUNDATION">Fundación</SelectItem>
              <SelectItem value="OTHER">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.institutionType === "OTHER" && (
          <div>
            <Label htmlFor="customType">Tipo Personalizado</Label>
            <Input
              id="customType"
              value={formData.customType}
              onChange={(e) => handleInputChange('customType', e.target.value)}
              disabled={!isEditing}
              placeholder="Especifica el tipo de institución"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="mayorName">Nombre del Alcalde/Representante</Label>
            <Input
              id="mayorName"
              value={formData.mayorName}
              onChange={(e) => handleInputChange('mayorName', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="mayorEmail">Email del Alcalde/Representante</Label>
            <Input
              id="mayorEmail"
              type="email"
              value={formData.mayorEmail}
              onChange={(e) => handleInputChange('mayorEmail', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="mayorPhone">Teléfono del Alcalde/Representante</Label>
            <Input
              id="mayorPhone"
              value={formData.mayorPhone}
              onChange={(e) => handleInputChange('mayorPhone', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="institutionPhone">Teléfono de la Institución</Label>
            <Input
              id="institutionPhone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="institutionEmail">Email de la Institución</Label>
          <Input
            id="institutionEmail"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div>
          <Label htmlFor="website">Sitio Web</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            disabled={!isEditing}
            placeholder="https://ejemplo.com"
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="primaryColor">Color Primario</Label>
            <Input
              id="primaryColor"
              type="color"
              value={formData.primaryColor}
              onChange={(e) => handleInputChange('primaryColor', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="secondaryColor">Color Secundario</Label>
            <Input
              id="secondaryColor"
              type="color"
              value={formData.secondaryColor}
              onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
