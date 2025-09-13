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
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Plus,
  X,
  Clock,
  Star,
  Target
} from "lucide-react";
import { JobPosting, EmploymentType, ExperienceLevel, EmploymentTypeLabels, ExperienceLevelLabels } from "@/types/company";

const jobFormSchema = z.object({
  title: z.string().min(1, "El título del trabajo es requerido"),
  description: z.string().min(1, "La descripción del trabajo es requerida"),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  location: z.string().min(1, "La ubicación es requerida"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  remoteWork: z.boolean().default(false),
  hybridWork: z.boolean().default(false),
  officeWork: z.boolean().default(true),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "TEMPORARY"]),
  experienceLevel: z.enum(["ENTRY_LEVEL", "MID_LEVEL", "SENIOR_LEVEL", "EXECUTIVE", "INTERN"]),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().default("USD"),
  applicationDeadline: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  department: z.string().optional(),
  reportingTo: z.string().optional(),
  isUrgent: z.boolean().default(false),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobPostingFormProps {
  job?: JobPosting;
  onSubmit: (data: JobFormData) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function JobPostingForm({ 
  job, 
  onSubmit, 
  isLoading = false,
  mode = "create" 
}: JobPostingFormProps) {
  const [newRequirement, setNewRequirement] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: job ? {
      title: job.title,
      description: job.description,
      requirements: job.requirements || [],
      responsibilities: job.responsibilities || [],
      benefits: job.benefits || [],
      location: job.location,
      city: job.city || "",
      state: job.state || "",
      country: job.country || "",
      remoteWork: job.remoteWork,
      hybridWork: job.hybridWork,
      officeWork: job.officeWork,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      currency: job.currency,
      applicationDeadline: job.applicationDeadline || "",
      startDate: job.startDate || "",
      tags: job.tags || [],
      skills: job.skills || [],
      department: job.department || "",
      reportingTo: job.reportingTo || "",
      isUrgent: job.isUrgent,
    } : {
      requirements: [],
      responsibilities: [],
      benefits: [],
      tags: [],
      skills: [],
      remoteWork: false,
      hybridWork: false,
      officeWork: true,
      currency: "USD",
      isUrgent: false,
    },
  });

  const watchedValues = watch();

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const currentRequirements = watchedValues.requirements || [];
      setValue("requirements", [...currentRequirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    const currentRequirements = watchedValues.requirements || [];
    setValue("requirements", currentRequirements.filter((_, i) => i !== index));
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      const currentResponsibilities = watchedValues.responsibilities || [];
      setValue("responsibilities", [...currentResponsibilities, newResponsibility.trim()]);
      setNewResponsibility("");
    }
  };

  const removeResponsibility = (index: number) => {
    const currentResponsibilities = watchedValues.responsibilities || [];
    setValue("responsibilities", currentResponsibilities.filter((_, i) => i !== index));
  };

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

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = watchedValues.tags || [];
      setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    const currentTags = watchedValues.tags || [];
    setValue("tags", currentTags.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = watchedValues.skills || [];
      setValue("skills", [...currentSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    const currentSkills = watchedValues.skills || [];
    setValue("skills", currentSkills.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Trabajo *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ej: Desarrollador Frontend Senior"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Trabajo *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe las responsabilidades principales del trabajo..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                {...register("department")}
                placeholder="Ej: Tecnología, Marketing, Ventas"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reportingTo">Reporta a</Label>
              <Input
                id="reportingTo"
                {...register("reportingTo")}
                placeholder="Ej: Director de Tecnología"
              />
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
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación Principal *</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="Ej: La Paz, Bolivia"
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

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
        </CardContent>
      </Card>

      {/* Work Arrangements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Modalidades de Trabajo
          </CardTitle>
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

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Detalles del Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employmentType">Tipo de Empleo *</Label>
              <Select
                value={watchedValues.employmentType || ""}
                onValueChange={(value) => setValue("employmentType", value as EmploymentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EmploymentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Nivel de Experiencia *</Label>
              <Select
                value={watchedValues.experienceLevel || ""}
                onValueChange={(value) => setValue("experienceLevel", value as ExperienceLevel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el nivel" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ExperienceLevelLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Salario Mínimo</Label>
              <div className="flex gap-2">
                <DollarSign className="h-4 w-4 mt-3 text-muted-foreground" />
                <Input
                  id="salaryMin"
                  type="number"
                  {...register("salaryMin", { valueAsNumber: true })}
                  placeholder="Ej: 3000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Salario Máximo</Label>
              <div className="flex gap-2">
                <DollarSign className="h-4 w-4 mt-3 text-muted-foreground" />
                <Input
                  id="salaryMax"
                  type="number"
                  {...register("salaryMax", { valueAsNumber: true })}
                  placeholder="Ej: 5000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={watchedValues.currency || "USD"}
                onValueChange={(value) => setValue("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="BOB">BOB</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Requisitos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Agregar requisito..."
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
            />
            <Button type="button" onClick={addRequirement} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {watchedValues.requirements?.map((requirement, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <span className="flex-1 text-sm">{requirement}</span>
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Responsabilidades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newResponsibility}
              onChange={(e) => setNewResponsibility(e.target.value)}
              placeholder="Agregar responsabilidad..."
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResponsibility())}
            />
            <Button type="button" onClick={addResponsibility} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {watchedValues.responsibilities?.map((responsibility, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <span className="flex-1 text-sm">{responsibility}</span>
                <button
                  type="button"
                  onClick={() => removeResponsibility(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
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

      {/* Skills and Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Habilidades y Etiquetas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Habilidades Técnicas</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Agregar habilidad..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedValues.skills?.map((skill, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Etiquetas</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Agregar etiqueta..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedValues.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fechas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">Fecha Límite de Aplicación</Label>
              <Input
                id="applicationDeadline"
                type="datetime-local"
                {...register("applicationDeadline")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register("startDate")}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isUrgent"
              checked={watchedValues.isUrgent}
              onCheckedChange={(checked) => setValue("isUrgent", !!checked)}
            />
            <Label htmlFor="isUrgent">Trabajo Urgente</Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => reset()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : mode === "create" ? "Publicar Trabajo" : "Actualizar Trabajo"}
        </Button>
      </div>
    </form>
  );
}
