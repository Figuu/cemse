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
import { Building2, Edit, Save } from "lucide-react";

interface CompanyFormData {
  name: string;
  description: string;
  taxId: string;
  legalRepresentative: string;
  businessSector: string;
  companySize: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  foundedYear: string;
  logoUrl: string;
}

export function CompanySection() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);
  
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    description: "",
    taxId: "",
    legalRepresentative: "",
    businessSector: "",
    companySize: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    foundedYear: "",
    logoUrl: "",
  });

  // Fetch company data
  useEffect(() => {
    const fetchCompany = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/companies/by-user/${session.user.id}`);
        if (response.ok) {
          const company = await response.json();
          setCompany(company);
          if (company) {
            setFormData({
              name: company.name || "",
              description: company.description || "",
              taxId: company.taxId || "",
              legalRepresentative: company.legalRepresentative || "",
              businessSector: company.businessSector || "",
              companySize: company.companySize || "",
              website: company.website || "",
              email: company.email || "",
              phone: company.phone || "",
              address: company.address || "",
              foundedYear: company.foundedYear?.toString() || "",
              logoUrl: company.logoUrl || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching company:", error);
      }
    };

    fetchCompany();
  }, [session?.user?.id]);

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditToggle = () => {
    if (isEditing && company) {
      // Reset form data to original values when canceling
      setFormData({
        name: company.name || "",
        description: company.description || "",
        taxId: company.taxId || "",
        legalRepresentative: company.legalRepresentative || "",
        businessSector: company.businessSector || "",
        companySize: company.companySize || "",
        website: company.website || "",
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        foundedYear: company.foundedYear?.toString() || "",
        logoUrl: company.logoUrl || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!company) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la empresa');
      }

      const result = await response.json();
      setCompany(result);
      
      toast.success("Empresa actualizada", {
        description: "La información de la empresa se ha actualizado correctamente.",
      });

      setIsEditing(false);
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo actualizar la empresa. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!company) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Información de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No se encontró información de empresa asociada a tu cuenta.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Información de la Empresa
          </CardTitle>
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="companyName">Nombre de la Empresa</Label>
            <Input
              id="companyName"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="taxId">NIT/RUC</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => handleInputChange('taxId', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={!isEditing}
            rows={3}
            placeholder="Describe tu empresa..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="legalRepresentative">Representante Legal</Label>
            <Input
              id="legalRepresentative"
              value={formData.legalRepresentative}
              onChange={(e) => handleInputChange('legalRepresentative', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="businessSector">Sector de Negocio</Label>
            <Input
              id="businessSector"
              value={formData.businessSector}
              onChange={(e) => handleInputChange('businessSector', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="companySize">Tamaño de la Empresa</Label>
          <Select 
            value={formData.companySize} 
            onValueChange={(value) => handleInputChange('companySize', value)}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tamaño" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MICRO">Micro (1-10 empleados)</SelectItem>
              <SelectItem value="SMALL">Pequeña (11-50 empleados)</SelectItem>
              <SelectItem value="MEDIUM">Mediana (51-200 empleados)</SelectItem>
              <SelectItem value="LARGE">Grande (200+ empleados)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            <Label htmlFor="foundedYear">Año de Fundación</Label>
            <Input
              id="foundedYear"
              type="number"
              value={formData.foundedYear}
              onChange={(e) => handleInputChange('foundedYear', e.target.value)}
              disabled={!isEditing}
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="companyEmail">Email de la Empresa</Label>
            <Input
              id="companyEmail"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="companyPhone">Teléfono de la Empresa</Label>
            <Input
              id="companyPhone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
            />
          </div>
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

        <div>
          <Label htmlFor="logoUrl">URL del Logo</Label>
          <Input
            id="logoUrl"
            value={formData.logoUrl}
            onChange={(e) => handleInputChange('logoUrl', e.target.value)}
            disabled={!isEditing}
            placeholder="https://ejemplo.com/logo.png"
          />
        </div>
      </CardContent>
    </Card>
  );
}
