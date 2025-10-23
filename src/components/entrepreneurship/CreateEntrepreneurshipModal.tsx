"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Link, Calendar, Users, DollarSign } from "lucide-react";
import { useEntrepreneurships, useEntrepreneurship, CreateEntrepreneurshipData } from "@/hooks/useEntrepreneurships";
import { BusinessStage } from "@prisma/client";
import { useFileUpload } from "@/hooks/useFileUpload";

const createEntrepreneurshipSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es muy largo"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(1000, "La descripción es muy larga"),
  category: z.string().min(1, "La categoría es requerida"),
  subcategory: z.string().optional(),
  businessStage: z.enum(["IDEA", "STARTUP", "GROWING", "ESTABLISHED"]),
  website: z.string().optional().refine((val) => {
    if (!val || val === "") return true; // Allow empty strings
    // Allow relative URLs (starting with /) or absolute URLs (starting with http/https)
    return val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://");
  }, {
    message: "Debe ser una URL válida (relativa o absoluta) o estar vacío"
  }).or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  municipality: z.string().min(1, "El municipio es requerido"),
  department: z.string().default("Cochabamba"),
  founded: z.string().optional(),
  employees: z.string().optional(),
  annualRevenue: z.string().optional(),
  businessModel: z.string().optional(),
  targetMarket: z.string().optional(),
  isPublic: z.boolean().default(true),
});

type CreateEntrepreneurshipFormData = z.infer<typeof createEntrepreneurshipSchema>;

interface CreateEntrepreneurshipModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editingEntrepreneurshipId?: string;
}

const businessStages: { value: BusinessStage; label: string }[] = [
  { value: "IDEA", label: "Idea" },
  { value: "STARTUP", label: "Inicio" },
  { value: "GROWING", label: "Crecimiento" },
  { value: "ESTABLISHED", label: "Establecido" },
];

const categories = [
  "Tecnología",
  "Salud",
  "Educación",
  "Finanzas",
  "Comercio",
  "Servicios",
  "Manufactura",
  "Agricultura",
  "Turismo",
  "Entretenimiento",
  "Otros",
];

const municipalities = [
  "Cochabamba",
  "Quillacollo",
  "Sacaba",
  "Tiquipaya",
  "Colcapirhua",
  "Vinto",
  "Sipe Sipe",
  "Tarata",
  "Anzaldo",
  "Arbieto",
  "Capinota",
  "Santivañez",
  "Sicaya",
  "Villa Tunari",
  "Entre Ríos",
  "Shinahota",
  "Puerto Villarroel",
  "Chimoré",
  "Villa 14 de Septiembre",
  "Totora",
  "Pojo",
  "Pocona",
  "Chimboata",
  "Aiquile",
  "Pasorapa",
  "Omereque",
  "Mizque",
  "Vila Vila",
  "Alalay",
  "Independencia",
  "Morochata",
  "Cocapata",
  "Villa José Quintín Mendoza",
  "Arque",
  "Tacopaya",
];

export function CreateEntrepreneurshipModal({ onClose, onSuccess, editingEntrepreneurshipId }: CreateEntrepreneurshipModalProps) {
  const [logo, setLogo] = useState<string>("");
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [socialMediaLinks, setSocialMediaLinks] = useState<{ platform: string; url: string }[]>([]);
  const [newSocialPlatform, setNewSocialPlatform] = useState("");
  const [newSocialUrl, setNewSocialUrl] = useState("");

  const { uploadFile } = useFileUpload();
  const { createEntrepreneurship, isCreating } = useEntrepreneurships();
  
  // Load entrepreneurship data when editing
  const { data: entrepreneurshipData, isLoading: isLoadingData } = useEntrepreneurship(
    editingEntrepreneurshipId || ""
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(createEntrepreneurshipSchema),
    defaultValues: {
      department: "Cochabamba",
      isPublic: true,
    },
  });

  // Load data when editing
  useEffect(() => {
    if (editingEntrepreneurshipId && entrepreneurshipData) {
      const data = entrepreneurshipData;
      reset({
        name: data.name || "",
        description: data.description || "",
        category: data.category || "",
        subcategory: data.subcategory || "",
        businessStage: data.businessStage || "IDEA",
        website: data.website || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        municipality: data.municipality || "",
        department: data.department || "Cochabamba",
        founded: data.founded ? new Date(data.founded).toISOString().split('T')[0] : "",
        employees: data.employees?.toString() || "",
        annualRevenue: data.annualRevenue?.toString() || "",
        businessModel: data.businessModel || "",
        targetMarket: data.targetMarket || "",
        isPublic: data.isPublic ?? true,
      });
      
      // Set images and social media
      if (data.logo) setLogo(data.logo);
      if (data.images) setBannerImages(data.images);
      if (data.socialMedia) {
        const socialMedia = typeof data.socialMedia === 'string' 
          ? JSON.parse(data.socialMedia) 
          : data.socialMedia;
        const socialArray = Object.entries(socialMedia).map(([platform, url]) => ({
          platform,
          url: url as string
        }));
        setSocialMediaLinks(socialArray);
      }
    }
  }, [editingEntrepreneurshipId, entrepreneurshipData, reset]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const uploadedUrl = await uploadFile(file, "entrepreneurship/logos");
        setLogo(uploadedUrl);
      } catch (error) {
        console.error("Error uploading logo:", error);
      }
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      try {
        const uploadPromises = Array.from(files).map(file => 
          uploadFile(file, "entrepreneurship/banners")
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        setBannerImages(prev => [...prev, ...uploadedUrls]);
      } catch (error) {
        console.error("Error uploading banner images:", error);
      }
    }
  };

  const removeBannerImage = (index: number) => {
    setBannerImages(prev => prev.filter((_, i) => i !== index));
  };

  const addSocialMediaLink = () => {
    if (newSocialPlatform && newSocialUrl) {
      setSocialMediaLinks(prev => [...prev, { platform: newSocialPlatform, url: newSocialUrl }]);
      setNewSocialPlatform("");
      setNewSocialUrl("");
    }
  };

  const removeSocialMediaLink = (index: number) => {
    setSocialMediaLinks(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateEntrepreneurshipFormData) => {
    try {
      const entrepreneurshipData: CreateEntrepreneurshipData = {
        ...data,
        businessStage: data.businessStage as BusinessStage,
        logo,
        images: bannerImages,
        socialMedia: socialMediaLinks.length > 0 ? JSON.stringify(
          socialMediaLinks.reduce((acc, link) => {
            acc[link.platform] = link.url;
            return acc;
          }, {} as Record<string, string>)
        ) : undefined,
      };

      console.log("Creating entrepreneurship with data:", entrepreneurshipData);
      await createEntrepreneurship(entrepreneurshipData);
      onSuccess();
    } catch (error) {
      console.error("Error creating entrepreneurship:", error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEntrepreneurshipId ? "Editar Emprendimiento" : "Crear Nuevo Emprendimiento"}
          </DialogTitle>
          <DialogDescription>
            {editingEntrepreneurshipId 
              ? "Actualiza la información de tu emprendimiento"
              : "Completa la información de tu emprendimiento para conectarte con otros emprendedores"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Emprendimiento *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Ej: TechStart Bolivia"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoría</Label>
                  <Input
                    id="subcategory"
                    {...register("subcategory")}
                    placeholder="Ej: Desarrollo de Software"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessStage">Etapa del Negocio *</Label>
                  <Select onValueChange={(value) => setValue("businessStage", value as BusinessStage)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessStages.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.businessStage && (
                    <p className="text-sm text-red-600">{errors.businessStage.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe tu emprendimiento, su propósito y lo que lo hace único..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imágenes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center space-x-4">
                  {logo && (
                    <div className="relative">
                      <img
                        src={logo}
                        alt="Logo preview"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => setLogo("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Label htmlFor="logo-upload">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Subir Logo
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Imágenes del Banner</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {bannerImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Banner ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeBannerImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-24">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBannerUpload}
                      className="hidden"
                      id="banner-upload"
                    />
                    <Label htmlFor="banner-upload">
                      <Button type="button" variant="ghost" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Agregar
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      {...register("website")}
                      placeholder="https://tu-sitio.com"
                      className="pl-9"
                    />
                  </div>
                  {errors.website && (
                    <p className="text-sm text-red-600">{errors.website.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email de Contacto</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="contacto@tu-empresa.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+591 4 1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="Calle Principal #123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality">Municipio *</Label>
                  <Select onValueChange={(value) => setValue("municipality", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar municipio" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {municipalities.map((municipality) => (
                        <SelectItem key={municipality} value={municipality}>
                          {municipality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.municipality && (
                    <p className="text-sm text-red-600">{errors.municipality.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    {...register("department")}
                    value="Cochabamba"
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Negocio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="founded">Año de Fundación</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="founded"
                      type="date"
                      {...register("founded")}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employees">Número de Empleados</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="employees"
                      type="number"
                      {...register("employees")}
                      placeholder="0"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualRevenue">Ingresos Anuales (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="annualRevenue"
                      type="number"
                      {...register("annualRevenue")}
                      placeholder="0"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessModel">Modelo de Negocio</Label>
                <Textarea
                  id="businessModel"
                  {...register("businessModel")}
                  placeholder="Describe cómo genera ingresos tu emprendimiento..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetMarket">Mercado Objetivo</Label>
                <Textarea
                  id="targetMarket"
                  {...register("targetMarket")}
                  placeholder="Describe a quién se dirige tu producto o servicio..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Redes Sociales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialMediaLinks.length > 0 && (
                <div className="space-y-2">
                  {socialMediaLinks.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Badge variant="secondary">{link.platform}</Badge>
                      <span className="flex-1 text-sm text-muted-foreground truncate">
                        {link.url}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSocialMediaLink(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Plataforma (ej: Facebook, Instagram)"
                  value={newSocialPlatform}
                  onChange={(e) => setNewSocialPlatform(e.target.value)}
                />
                <Input
                  placeholder="URL"
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                />
                <Button type="button" onClick={addSocialMediaLink}>
                  Agregar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating 
                ? (editingEntrepreneurshipId ? "Actualizando..." : "Creando...") 
                : (editingEntrepreneurshipId ? "Actualizar Emprendimiento" : "Crear Emprendimiento")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
