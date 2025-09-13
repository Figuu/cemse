"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Globe, 
  MapPin, 
  Users, 
  DollarSign,
  Lightbulb,
  Upload,
  Plus,
  X
} from "lucide-react";
import { CreateStartupData } from "@/hooks/useStartups";

const startupSchema = z.object({
  // Basic Information
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es muy largo"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(1000, "La descripción es muy larga"),
  category: z.string().min(1, "La categoría es requerida"),
  subcategory: z.string().optional(),
  businessStage: z.enum(["IDEA", "STARTUP", "GROWING", "ESTABLISHED"]),
  
  // Visual Identity
  logo: z.string().url().optional(),
  images: z.array(z.string().url()).optional().default([]),
  
  // Contact Information
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  
  // Location
  address: z.string().optional(),
  municipality: z.string().min(1, "El municipio es requerido"),
  department: z.string().default("Cochabamba"),
  
  // Social Media
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    instagram: z.string().url().optional(),
  }).optional(),
  
  // Business Details
  founded: z.string().optional(),
  employees: z.number().int().min(0).optional(),
  annualRevenue: z.number().min(0).optional(),
  businessModel: z.string().optional(),
  targetMarket: z.string().optional(),
  
  // Visibility
  isPublic: z.boolean().default(true),
});

type StartupFormData = z.infer<typeof startupSchema>;

interface StartupRegistrationFormProps {
  onSubmit: (data: CreateStartupData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<CreateStartupData>;
  mode?: "create" | "edit";
}

const categories = [
  "AgTech",
  "FinTech", 
  "EdTech",
  "HealthTech",
  "E-commerce",
  "SaaS",
  "IoT",
  "AI/ML",
  "Blockchain",
  "GreenTech",
  "FoodTech",
  "PropTech",
  "TravelTech",
  "Other"
];

const subcategories = {
  "AgTech": ["Precision Agriculture", "Food Processing", "Supply Chain", "Other"],
  "FinTech": ["Payments", "Lending", "Insurance", "Investment", "Other"],
  "EdTech": ["Online Learning", "Educational Tools", "Student Management", "Other"],
  "HealthTech": ["Telemedicine", "Medical Devices", "Health Data", "Other"],
  "E-commerce": ["Marketplace", "B2B", "B2C", "D2C", "Other"],
  "SaaS": ["CRM", "ERP", "Project Management", "Analytics", "Other"],
  "IoT": ["Smart Home", "Industrial IoT", "Wearables", "Other"],
  "AI/ML": ["Computer Vision", "NLP", "Predictive Analytics", "Other"],
  "Blockchain": ["DeFi", "NFTs", "Supply Chain", "Other"],
  "GreenTech": ["Renewable Energy", "Waste Management", "Carbon Tracking", "Other"],
  "FoodTech": ["Food Delivery", "Meal Planning", "Food Safety", "Other"],
  "PropTech": ["Real Estate", "Property Management", "Construction", "Other"],
  "TravelTech": ["Booking", "Travel Planning", "Transportation", "Other"],
  "Other": ["Other"]
};

const municipalities = [
  "Cochabamba",
  "Sacaba", 
  "Quillacollo",
  "Villa Tunari",
  "Puerto Villarroel",
  "Shinahota",
  "Aiquile",
  "Tarata",
  "Cliza",
  "Punata",
  "Arani",
  "Vacas",
  "Tolata",
  "Tiraque",
  "Mizque",
  "Omereque",
  "Pasorapa",
  "Pojo",
  "Totora",
  "Villa Rivero",
  "Other"
];

export function StartupRegistrationForm({
  onSubmit,
  isLoading = false,
  initialData,
  mode = "create"
}: StartupRegistrationFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<StartupFormData>({
    resolver: zodResolver(startupSchema),
    defaultValues: {
      ...initialData,
      images: initialData?.images || [],
      socialMedia: initialData?.socialMedia || {},
    },
  });

  const selectedCategory = watch("category");

  const handleAddImage = () => {
    if (newImageUrl && newImageUrl.startsWith("http")) {
      setImageUrls(prev => [...prev, newImageUrl]);
      setValue("images", [...imageUrls, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);
    setValue("images", newImages);
  };

  const handleFormSubmit = async (data: StartupFormData) => {
    const submitData: CreateStartupData = {
      ...data,
      images: imageUrls,
    };
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
          <TabsTrigger value="business">Negocio</TabsTrigger>
          <TabsTrigger value="media">Medios</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información Básica
              </CardTitle>
              <CardDescription>
                Información fundamental sobre tu startup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Startup *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Ej: EcoTech Solutions"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
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
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe tu startup, su misión y lo que la hace única..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoría</Label>
                  <Select onValueChange={(value) => setValue("subcategory", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory && subcategories[selectedCategory as keyof typeof subcategories]?.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessStage">Etapa del Negocio *</Label>
                  <Select onValueChange={(value) => setValue("businessStage", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDEA">Idea</SelectItem>
                      <SelectItem value="STARTUP">Startup</SelectItem>
                      <SelectItem value="GROWING">Creciendo</SelectItem>
                      <SelectItem value="ESTABLISHED">Establecida</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.businessStage && (
                    <p className="text-sm text-red-500">{errors.businessStage.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Information Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
              <CardDescription>
                Cómo las personas pueden contactarte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    {...register("website")}
                    placeholder="https://www.tustartup.com"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email de Contacto</Label>
                  <Input
                    id="email"
                    {...register("email")}
                    placeholder="contacto@tustartup.com"
                    type="email"
                  />
                </div>
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
                  placeholder="Calle Principal #123, Zona Centro"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="municipality">Municipio *</Label>
                  <Select onValueChange={(value) => setValue("municipality", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((municipality) => (
                        <SelectItem key={municipality} value={municipality}>
                          {municipality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.municipality && (
                    <p className="text-sm text-red-500">{errors.municipality.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    {...register("department")}
                    defaultValue="Cochabamba"
                    readOnly
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Details Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Detalles del Negocio
              </CardTitle>
              <CardDescription>
                Información financiera y operacional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="founded">Fecha de Fundación</Label>
                  <Input
                    id="founded"
                    {...register("founded")}
                    type="date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employees">Número de Empleados</Label>
                  <Input
                    id="employees"
                    {...register("employees", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualRevenue">Ingresos Anuales (USD)</Label>
                <Input
                  id="annualRevenue"
                  {...register("annualRevenue", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessModel">Modelo de Negocio</Label>
                <Textarea
                  id="businessModel"
                  {...register("businessModel")}
                  placeholder="Describe cómo genera ingresos tu startup..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetMarket">Mercado Objetivo</Label>
                <Textarea
                  id="targetMarket"
                  {...register("targetMarket")}
                  placeholder="Describe tu mercado objetivo y clientes ideales..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media and Social Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Medios y Redes Sociales
              </CardTitle>
              <CardDescription>
                Imágenes y presencia en redes sociales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo (URL)</Label>
                <Input
                  id="logo"
                  {...register("logo")}
                  placeholder="https://example.com/logo.png"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label>Imágenes de la Startup</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.png"
                      type="url"
                    />
                    <Button type="button" onClick={handleAddImage} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Startup image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Redes Sociales</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      {...register("socialMedia.facebook")}
                      placeholder="https://facebook.com/tustartup"
                      type="url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      {...register("socialMedia.twitter")}
                      placeholder="https://twitter.com/tustartup"
                      type="url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      {...register("socialMedia.linkedin")}
                      placeholder="https://linkedin.com/company/tustartup"
                      type="url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      {...register("socialMedia.instagram")}
                      placeholder="https://instagram.com/tustartup"
                      type="url"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  {...register("isPublic")}
                  defaultChecked
                />
                <Label htmlFor="isPublic">
                  Hacer mi startup visible públicamente
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => reset()}>
          Limpiar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : mode === "create" ? "Crear Startup" : "Actualizar Startup"}
        </Button>
      </div>
    </form>
  );
}
