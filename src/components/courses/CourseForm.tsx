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
import { X, Plus, Upload, BookOpen, Clock, Target, Award } from "lucide-react";
import { VideoUpload } from "./VideoUpload";
import { ThumbnailUpload } from "./ThumbnailUpload";
import { cn } from "@/lib/utils";

const courseFormSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  shortDescription: z.string().min(1, "La descripción corta es requerida"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  category: z.enum([
    "SOFT_SKILLS",
    "BASIC_COMPETENCIES", 
    "JOB_PLACEMENT",
    "ENTREPRENEURSHIP",
    "TECHNICAL_SKILLS",
    "DIGITAL_LITERACY",
    "COMMUNICATION",
    "LEADERSHIP"
  ]),
  duration: z.number().min(1, "La duración debe ser mayor a 0"),
  isMandatory: z.boolean(),
  certification: z.boolean(),
  thumbnail: z.string().optional(),
  videoPreview: z.string().optional(),
  objectives: z.array(z.string()).min(1, "Debe agregar al menos un objetivo"),
  prerequisites: z.array(z.string()),
  tags: z.array(z.string()).min(1, "Debe agregar al menos una etiqueta"),
  includedMaterials: z.array(z.string()),
  institutionName: z.string().min(1, "El nombre de la institución es requerido"),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  onSubmit: (data: CourseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CourseFormData>;
}

const levelLabels = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio", 
  ADVANCED: "Avanzado",
};

const categoryLabels = {
  SOFT_SKILLS: "Habilidades Blandas",
  BASIC_COMPETENCIES: "Competencias Básicas",
  JOB_PLACEMENT: "Colocación Laboral",
  ENTREPRENEURSHIP: "Emprendimiento",
  TECHNICAL_SKILLS: "Habilidades Técnicas",
  DIGITAL_LITERACY: "Alfabetización Digital",
  COMMUNICATION: "Comunicación",
  LEADERSHIP: "Liderazgo",
};

export const CourseForm = ({ onSubmit, onCancel, isLoading = false, initialData }: CourseFormProps) => {
  const [newObjective, setNewObjective] = useState("");
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [uploadedThumbnail, setUploadedThumbnail] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      isMandatory: false,
      certification: true,
      objectives: [],
      prerequisites: [],
      tags: [],
      includedMaterials: [],
      ...initialData,
    },
  });

  const watchedValues = watch();

  const addObjective = () => {
    if (newObjective.trim()) {
      const currentObjectives = watchedValues.objectives || [];
      setValue("objectives", [...currentObjectives, newObjective.trim()]);
      setNewObjective("");
    }
  };

  const removeObjective = (index: number) => {
    const currentObjectives = watchedValues.objectives || [];
    setValue("objectives", currentObjectives.filter((_, i) => i !== index));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      const currentPrerequisites = watchedValues.prerequisites || [];
      setValue("prerequisites", [...currentPrerequisites, newPrerequisite.trim()]);
      setNewPrerequisite("");
    }
  };

  const removePrerequisite = (index: number) => {
    const currentPrerequisites = watchedValues.prerequisites || [];
    setValue("prerequisites", currentPrerequisites.filter((_, i) => i !== index));
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

  const addMaterial = () => {
    if (newMaterial.trim()) {
      const currentMaterials = watchedValues.includedMaterials || [];
      setValue("includedMaterials", [...currentMaterials, newMaterial.trim()]);
      setNewMaterial("");
    }
  };

  const removeMaterial = (index: number) => {
    const currentMaterials = watchedValues.includedMaterials || [];
    setValue("includedMaterials", currentMaterials.filter((_, i) => i !== index));
  };

  const handleThumbnailUploaded = (thumbnailUrl: string) => {
    setUploadedThumbnail(thumbnailUrl);
    setValue("thumbnail", thumbnailUrl);
  };

  const handleThumbnailRemoved = () => {
    setUploadedThumbnail(null);
    setValue("thumbnail", "");
  };

  const handleVideoUploaded = (videoUrl: string) => {
    setUploadedVideo(videoUrl);
    setValue("videoPreview", videoUrl);
  };

  const handleVideoRemoved = () => {
    setUploadedVideo(null);
    setValue("videoPreview", "");
  };

  const handleFormSubmit = async (data: CourseFormData) => {
    try {
      // Use uploaded files if available, otherwise use the form data
      const submitData = {
        ...data,
        thumbnail: uploadedThumbnail || data.thumbnail || "",
        videoPreview: uploadedVideo || data.videoPreview || "",
      };
      
      await onSubmit(submitData);
      reset();
      setUploadedThumbnail(null);
      setUploadedVideo(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Curso *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Ej: Introducción a la Programación"
                className={cn(errors.title && "border-red-500")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionName">Nombre de la Institución *</Label>
              <Input
                id="institutionName"
                {...register("institutionName")}
                placeholder="Ej: Universidad Nacional"
                className={cn(errors.institutionName && "border-red-500")}
              />
              {errors.institutionName && (
                <p className="text-sm text-red-500">{errors.institutionName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Descripción Corta *</Label>
            <Input
              id="shortDescription"
              {...register("shortDescription")}
              placeholder="Una breve descripción del curso (máximo 150 caracteres)"
              maxLength={150}
              className={cn(errors.shortDescription && "border-red-500")}
            />
            {errors.shortDescription && (
              <p className="text-sm text-red-500">{errors.shortDescription.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción Completa *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe detalladamente el contenido del curso, metodología, y beneficios para los estudiantes"
              rows={4}
              className={cn(errors.description && "border-red-500")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Nivel *</Label>
              <Select onValueChange={(value) => setValue("level", value as any)}>
                <SelectTrigger className={cn(errors.level && "border-red-500")}>
                  <SelectValue placeholder="Seleccionar nivel" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(levelLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-red-500">{errors.level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select onValueChange={(value) => setValue("category", value as any)}>
                <SelectTrigger className={cn(errors.category && "border-red-500")}>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración (horas) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                {...register("duration", { valueAsNumber: true })}
                placeholder="Ej: 40"
                className={cn(errors.duration && "border-red-500")}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos del Curso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Agregar objetivo del curso"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addObjective())}
            />
            <Button type="button" onClick={addObjective} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {watchedValues.objectives && watchedValues.objectives.length > 0 && (
            <div className="space-y-2">
              {watchedValues.objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex-1 justify-start">
                    {objective}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeObjective(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {errors.objectives && (
            <p className="text-sm text-red-500">{errors.objectives.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle>Prerrequisitos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newPrerequisite}
              onChange={(e) => setNewPrerequisite(e.target.value)}
              placeholder="Agregar prerrequisito"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPrerequisite())}
            />
            <Button type="button" onClick={addPrerequisite} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {watchedValues.prerequisites && watchedValues.prerequisites.length > 0 && (
            <div className="space-y-2">
              {watchedValues.prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline" className="flex-1 justify-start">
                    {prerequisite}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePrerequisite(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Etiquetas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Agregar etiqueta"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {watchedValues.tags && watchedValues.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {watchedValues.tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Badge variant="default" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeTag(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          {errors.tags && (
            <p className="text-sm text-red-500">{errors.tags.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Included Materials */}
      <Card>
        <CardHeader>
          <CardTitle>Materiales Incluidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              placeholder="Agregar material incluido"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMaterial())}
            />
            <Button type="button" onClick={addMaterial} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {watchedValues.includedMaterials && watchedValues.includedMaterials.length > 0 && (
            <div className="space-y-2">
              {watchedValues.includedMaterials.map((material, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex-1 justify-start">
                    {material}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMaterial(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Medios del Curso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thumbnail Upload */}
          <ThumbnailUpload
            onThumbnailUploaded={handleThumbnailUploaded}
            onThumbnailRemoved={handleThumbnailRemoved}
            initialThumbnailUrl={uploadedThumbnail || watchedValues.thumbnail}
            disabled={isLoading}
          />

          {/* Video Upload */}
          <VideoUpload
            onVideoUploaded={handleVideoUploaded}
            onVideoRemoved={handleVideoRemoved}
            initialVideoUrl={uploadedVideo || watchedValues.videoPreview}
            disabled={isLoading}
          />

          {/* Fallback URL inputs for external media */}
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              O proporciona URLs externas:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">URL Externa de Imagen</Label>
                <Input
                  id="thumbnailUrl"
                  {...register("thumbnail")}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={!!uploadedThumbnail}
                />
                {uploadedThumbnail && (
                  <p className="text-xs text-gray-500">
                    Usando imagen subida. Deja vacío para usar URL externa.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">URL Externa de Video</Label>
                <Input
                  id="videoUrl"
                  {...register("videoPreview")}
                  placeholder="https://ejemplo.com/video.mp4"
                  disabled={!!uploadedVideo}
                />
                {uploadedVideo && (
                  <p className="text-xs text-gray-500">
                    Usando video subido. Deja vacío para usar URL externa.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isMandatory"
                checked={watchedValues.isMandatory}
                onCheckedChange={(checked) => setValue("isMandatory", !!checked)}
              />
              <Label htmlFor="isMandatory">Curso Obligatorio</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="certification"
                checked={watchedValues.certification}
                onCheckedChange={(checked) => setValue("certification", !!checked)}
              />
              <Label htmlFor="certification">Incluye Certificación</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <Award className="h-4 w-4 mr-2" />
              Crear Curso
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
