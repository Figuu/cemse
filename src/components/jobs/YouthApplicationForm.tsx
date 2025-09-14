"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, 
  Upload, 
  User, 
  MapPin,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const youthApplicationSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(50, "La descripción debe tener al menos 50 caracteres"),
  cvFile: z.string().optional(),
  coverLetterFile: z.string().optional(),
  cvUrl: z.string().optional(),
  coverLetterUrl: z.string().optional(),
  isPublic: z.boolean(),
});

type YouthApplicationFormData = z.infer<typeof youthApplicationSchema>;

interface YouthApplicationFormProps {
  onSubmit: (data: YouthApplicationFormData) => void;
  isLoading?: boolean;
  currentUser?: {
    id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      city?: string;
      skillsWithLevel?: Array<{ name: string; level?: number } | string>;
      workExperience?: Array<{ company: string; position: string; description?: string }>;
      educationLevel?: string;
    };
  };
  existingApplication?: {
    id: string;
    title: string;
    description: string;
    status: string;
    isPublic: boolean;
    cvFile?: string;
    coverLetterFile?: string;
    cvUrl?: string;
    coverLetterUrl?: string;
  };
}

export function YouthApplicationForm({ 
  onSubmit, 
  isLoading = false,
  currentUser,
  existingApplication
}: YouthApplicationFormProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<YouthApplicationFormData>({
    resolver: zodResolver(youthApplicationSchema),
    defaultValues: {
      title: existingApplication?.title || "",
      description: existingApplication?.description || "",
      cvFile: existingApplication?.cvFile || "",
      coverLetterFile: existingApplication?.coverLetterFile || "",
      cvUrl: existingApplication?.cvUrl || "",
      coverLetterUrl: existingApplication?.coverLetterUrl || "",
      isPublic: existingApplication?.isPublic ?? true,
    },
  });

  const watchedValues = watch();

  const handleCvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvFile(file);
      // In a real app, you would upload the file and get a URL
      // For now, we'll just store the file name
      setValue("cvFile", file.name);
    }
  };

  const handleCoverLetterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverLetterFile(file);
      setValue("coverLetterFile", file.name);
    }
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    const total = 5;

    if (watchedValues.title) completed++;
    if (watchedValues.description && watchedValues.description.length >= 50) completed++;
    if (watchedValues.cvFile || watchedValues.cvUrl) completed++;
    if (currentUser?.profile?.firstName && currentUser?.profile?.lastName) completed++;
    if (currentUser?.profile?.skillsWithLevel && currentUser.profile.skillsWithLevel.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completion = getCompletionPercentage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {existingApplication ? "Editar Aplicación Abierta" : "Crear Aplicación Abierta"}
          </CardTitle>
          <p className="text-muted-foreground">
            {existingApplication 
              ? "Actualiza tu aplicación abierta para que las empresas puedan encontrarte"
              : "Crea una aplicación abierta para que las empresas interesadas puedan contactarte directamente"
            }
          </p>
        </CardHeader>
        <CardContent>
          {/* Profile Completion */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Completitud del Perfil</span>
              <span className="text-sm text-muted-foreground">{completion}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${completion}%` } as React.CSSProperties}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              {completion >= 80 ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Perfil completo y listo para publicar</span>
                </>
              ) : completion >= 60 ? (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600">Casi listo, completa algunos campos más</span>
                </>
              ) : (
                <>
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Completa más información para mejorar tu visibilidad</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Vista Previa del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {currentUser?.profile?.firstName || ""} {currentUser?.profile?.lastName || ""}
              </h3>
              <p className="text-muted-foreground">{currentUser?.email}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                {currentUser?.profile?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{currentUser.profile.city}</span>
                  </div>
                )}
                {currentUser?.profile?.educationLevel && (
                  <Badge variant="outline" className="text-xs">
                    {currentUser.profile.educationLevel}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Skills Preview */}
          {currentUser?.profile?.skillsWithLevel && currentUser.profile.skillsWithLevel.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Habilidades</h4>
              <div className="flex flex-wrap gap-2">
                {currentUser.profile.skillsWithLevel.slice(0, 5).map((skill: { name: string; level?: number } | string, index) => (
                  <Badge key={index} variant="outline">
                    {typeof skill === 'string' ? skill : skill.name || 'Skill'}
                  </Badge>
                ))}
                {currentUser.profile.skillsWithLevel.length > 5 && (
                  <Badge variant="outline">+{currentUser.profile.skillsWithLevel.length - 5} más</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Aplicación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => onSubmit(data as YouthApplicationFormData))} className="space-y-6">
            {/* Application Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título de tu Aplicación *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="ej. Desarrollador Frontend Junior buscando oportunidades"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Un título atractivo ayudará a las empresas a encontrarte más fácilmente
              </p>
            </div>

            {/* Application Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Cuéntanos sobre ti, tus objetivos profesionales, experiencia y qué tipo de oportunidades buscas..."
                rows={8}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mínimo 50 caracteres</span>
                <span>{watchedValues.description?.length || 0} caracteres</span>
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-6">
              <h4 className="font-medium">Documentos (Opcional)</h4>
              
              {/* CV Upload */}
              <div className="space-y-2">
                <Label htmlFor="cv">CV/Resume</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cv"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvUpload}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Subir
                  </Button>
                </div>
                {cvFile && (
                  <p className="text-sm text-muted-foreground">
                    Archivo seleccionado: {cvFile.name}
                  </p>
                )}
              </div>

              {/* Cover Letter Upload */}
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Carta de Presentación</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="coverLetter"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCoverLetterUpload}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Subir
                  </Button>
                </div>
                {coverLetterFile && (
                  <p className="text-sm text-muted-foreground">
                    Archivo seleccionado: {coverLetterFile.name}
                  </p>
                )}
              </div>

              {/* URL Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cvUrl">URL del CV (alternativo)</Label>
                  <Input
                    id="cvUrl"
                    {...register("cvUrl")}
                    placeholder="https://mi-cv.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverLetterUrl">URL de Carta de Presentación</Label>
                  <Input
                    id="coverLetterUrl"
                    {...register("coverLetterUrl")}
                    placeholder="https://mi-carta.com"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Configuración de Privacidad</h4>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {watchedValues.isPublic ? (
                    <Eye className="h-5 w-5 text-green-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <h5 className="font-medium">Aplicación Pública</h5>
                    <p className="text-sm text-muted-foreground">
                      {watchedValues.isPublic 
                        ? "Las empresas pueden ver y contactarte sobre esta aplicación"
                        : "Solo tú puedes ver esta aplicación"
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  checked={watchedValues.isPublic}
                  onCheckedChange={(checked) => setValue("isPublic", checked)}
                />
              </div>
            </div>

            {/* Application Summary */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Resumen de tu Aplicación</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Título:</span>
                    <span className="text-right max-w-xs truncate">
                      {watchedValues.title || "Sin título"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Descripción:</span>
                    <span>{watchedValues.description?.length || 0} caracteres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CV:</span>
                    <span>{cvFile?.name || watchedValues.cvUrl || "No adjuntado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carta:</span>
                    <span>{coverLetterFile?.name || watchedValues.coverLetterUrl || "No adjuntada"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visibilidad:</span>
                    <Badge variant={watchedValues.isPublic ? "default" : "secondary"}>
                      {watchedValues.isPublic ? "Pública" : "Privada"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || completion < 40}>
                {isLoading 
                  ? "Guardando..." 
                  : existingApplication 
                    ? "Actualizar Aplicación" 
                    : "Crear Aplicación"
                }
              </Button>
            </div>

            {completion < 40 && (
              <p className="text-sm text-muted-foreground text-center">
                Completa al menos el 40% del perfil para poder publicar tu aplicación
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
