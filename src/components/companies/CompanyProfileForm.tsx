"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Calendar,
  Plus,
  X,
  Upload
} from "lucide-react";
import { Company, CompanySize, CompanySizeLabels } from "@/types/company";

const companyFormSchema = z.object({
  name: z.string().min(1, "El nombre de la empresa es requerido"),
  description: z.string().optional(),
  website: z.string().optional().refine((val) => {
    if (!val || val === "") return true; // Allow empty strings
    // Allow relative URLs (starting with /) or absolute URLs (starting with http/https)
    return val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://");
  }, {
    message: "Debe ser una URL válida (relativa o absoluta) o estar vacío"
  }).or(z.literal("")),
  logo: z.string().optional().refine((val) => {
    if (!val || val === "") return true; // Allow empty strings
    // Allow relative URLs (starting with /) or absolute URLs (starting with http/https)
    return val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://");
  }, {
    message: "Debe ser una URL válida (relativa o absoluta) o estar vacío"
  }).or(z.literal("")),
  industry: z.string().optional(),
  size: z.nativeEnum(CompanySize).optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  socialMedia: z.object({
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
  benefits: z.array(z.string()),
  culture: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  values: z.array(z.string()),
  technologies: z.array(z.string()),
  languages: z.array(z.string()),
  remoteWork: z.boolean(),
  hybridWork: z.boolean(),
  officeWork: z.boolean(),
  totalEmployees: z.number().int().positive().optional(),
  isPublic: z.boolean(),
  isFeatured: z.boolean(),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

interface CompanyProfileFormProps {
  company?: Company;
  onSubmit: (data: CompanyFormData) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function CompanyProfileForm({ 
  company, 
  onSubmit, 
  isLoading = false,
  mode = "create" 
}: CompanyProfileFormProps) {
  const [newBenefit, setNewBenefit] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newTechnology, setNewTechnology] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: company ? {
      name: company.name,
      description: company.description || "",
      website: company.website || "",
      logo: company.logo || "",
      industry: company.industry || "",
      size: company.size,
      location: company.location || "",
      address: company.address || "",
      city: company.city || "",
      state: company.state || "",
      country: company.country || "",
      postalCode: company.postalCode || "",
      phone: company.phone || "",
      email: company.email || "",
      foundedYear: company.foundedYear,
      socialMedia: company.socialMedia || {},
      benefits: company.benefits || [],
      culture: company.culture || "",
      mission: company.mission || "",
      vision: company.vision || "",
      values: company.values || [],
      technologies: company.technologies || [],
      languages: company.languages || [],
      remoteWork: company.remoteWork,
      hybridWork: company.hybridWork,
      officeWork: company.officeWork,
      totalEmployees: company.totalEmployees,
      isPublic: company.isPublic,
      isFeatured: company.isFeatured,
    } : {
      benefits: [],
      values: [],
      technologies: [],
      languages: [],
      socialMedia: {},
      remoteWork: false,
      hybridWork: false,
      officeWork: true,
      isPublic: true,
      isFeatured: false,
    },
  });

  const watchedValues = watch();

  const addBenefit = () => {
    if (newBenefit.trim()) {
      const currentBenefits = watchedValues.benefits || [];
      setValue("benefits", [...currentBenefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    const currentBenefits = watchedValues.benefits || [];
    setValue("benefits", currentBenefits.filter((_, i) => i !== index));
  };

  const addValue = () => {
    if (newValue.trim()) {
      const currentValues = watchedValues.values || [];
      setValue("values", [...currentValues, newValue.trim()]);
      setNewValue("");
    }
  };

  const removeValue = (index: number) => {
    const currentValues = watchedValues.values || [];
    setValue("values", currentValues.filter((_, i) => i !== index));
  };

  const addTechnology = () => {
    if (newTechnology.trim()) {
      const currentTechnologies = watchedValues.technologies || [];
      setValue("technologies", [...currentTechnologies, newTechnology.trim()]);
      setNewTechnology("");
    }
  };

  const removeTechnology = (index: number) => {
    const currentTechnologies = watchedValues.technologies || [];
    setValue("technologies", currentTechnologies.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      const currentLanguages = watchedValues.languages || [];
      setValue("languages", [...currentLanguages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    const currentLanguages = watchedValues.languages || [];
    setValue("languages", currentLanguages.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Empresa *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ej: Tech Solutions Inc."
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industria</Label>
              <Input
                id="industry"
                {...register("industry")}
                placeholder="Ej: Tecnología, Salud, Finanzas"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe brevemente tu empresa..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <div className="flex gap-2">
                <Globe className="h-4 w-4 mt-3 text-muted-foreground" />
                <Input
                  id="website"
                  {...register("website")}
                  placeholder="https://www.ejemplo.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo">Logo (URL)</Label>
              <div className="flex gap-2">
                <Upload className="h-4 w-4 mt-3 text-muted-foreground" />
                <Input
                  id="logo"
                  {...register("logo")}
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="Ej: La Paz"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">Estado/Departamento</Label>
              <Input
                id="state"
                {...register("state")}
                placeholder="Ej: La Paz"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                {...register("country")}
                placeholder="Ej: Bolivia"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Dirección completa"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+591 2 1234567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="contacto@empresa.com"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Detalles de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Tamaño de la Empresa</Label>
              <Select
                value={watchedValues.size || ""}
                onValueChange={(value) => setValue("size", value as CompanySize)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tamaño" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CompanySizeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalEmployees">Número de Empleados</Label>
              <Input
                id="totalEmployees"
                type="number"
                {...register("totalEmployees", { valueAsNumber: true })}
                placeholder="Ej: 50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foundedYear">Año de Fundación</Label>
            <div className="flex gap-2">
              <Calendar className="h-4 w-4 mt-3 text-muted-foreground" />
              <Input
                id="foundedYear"
                type="number"
                {...register("foundedYear", { valueAsNumber: true })}
                placeholder="Ej: 2020"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Arrangements */}
      <Card>
        <CardHeader>
          <CardTitle>Modalidades de Trabajo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="officeWork"
              checked={watchedValues.officeWork}
              onCheckedChange={(checked) => setValue("officeWork", !!checked)}
            />
            <Label htmlFor="officeWork">Trabajo en oficina</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remoteWork"
              checked={watchedValues.remoteWork}
              onCheckedChange={(checked) => setValue("remoteWork", !!checked)}
            />
            <Label htmlFor="remoteWork">Trabajo remoto</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hybridWork"
              checked={watchedValues.hybridWork}
              onCheckedChange={(checked) => setValue("hybridWork", !!checked)}
            />
            <Label htmlFor="hybridWork">Trabajo híbrido</Label>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Beneficios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              placeholder="Agregar beneficio..."
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
            />
            <Button type="button" onClick={addBenefit} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {watchedValues.benefits?.map((benefit, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {benefit}
                <button
                  type="button"
                  onClick={() => removeBenefit(index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technologies */}
      <Card>
        <CardHeader>
          <CardTitle>Tecnologías</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTechnology}
              onChange={(e) => setNewTechnology(e.target.value)}
              placeholder="Agregar tecnología..."
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechnology())}
            />
            <Button type="button" onClick={addTechnology} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {watchedValues.technologies?.map((tech, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Culture */}
      <Card>
        <CardHeader>
          <CardTitle>Cultura de la Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mission">Misión</Label>
            <Textarea
              id="mission"
              {...register("mission")}
              placeholder="¿Cuál es la misión de tu empresa?"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vision">Visión</Label>
            <Textarea
              id="vision"
              {...register("vision")}
              placeholder="¿Cuál es la visión de tu empresa?"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="culture">Cultura</Label>
            <Textarea
              id="culture"
              {...register("culture")}
              placeholder="Describe la cultura de tu empresa..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Values */}
      <Card>
        <CardHeader>
          <CardTitle>Valores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Agregar valor..."
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addValue())}
            />
            <Button type="button" onClick={addValue} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {watchedValues.values?.map((value, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {value}
                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => reset()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : mode === "create" ? "Crear Empresa" : "Actualizar Empresa"}
        </Button>
      </div>
    </form>
  );
}
