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
  Globe,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { CreateYouthApplicationData } from "@/types/youth-application";
import { useFileUpload } from "@/hooks/useFileUpload";

const youthApplicationFormSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(100, "El título es muy largo"),
  description: z.string().min(1, "La descripción es requerida").max(2000, "La descripción es muy larga"),
  cvFile: z.string().optional(),
  coverLetterFile: z.string().optional(),
  cvUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  coverLetterUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  isPublic: z.boolean(),
});

type YouthApplicationFormData = z.infer<typeof youthApplicationFormSchema>;

interface YouthApplicationFormProps {
  mode: "create" | "edit";
  initialData?: Partial<YouthApplicationFormData>;
  onSubmit: (data: CreateYouthApplicationData) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

export function YouthApplicationForm({
  mode,
  initialData,
  onSubmit,
  onClose,
  isLoading = false,
}: YouthApplicationFormProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [cvUploadUrl, setCvUploadUrl] = useState<string | null>(null);
  const [coverLetterUploadUrl, setCoverLetterUploadUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { uploadFile: uploadCvFile, isUploading: isUploadingCv, error: cvUploadError } = useFileUpload();
  const { uploadFile: uploadCoverLetterFile, isUploading: isUploadingCoverLetter, error: coverLetterUploadError } = useFileUpload();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<YouthApplicationFormData>({
    resolver: zodResolver(youthApplicationFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      cvFile: initialData?.cvFile || "",
      coverLetterFile: initialData?.coverLetterFile || "",
      cvUrl: initialData?.cvUrl || "",
      coverLetterUrl: initialData?.coverLetterUrl || "",
      isPublic: initialData?.isPublic ?? true,
    },
  });

  const watchedValues = watch();

  const handleCvFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvFile(file);
      setCvUploadUrl(null);
      
      try {
        const uploadUrl = await uploadCvFile(file);
        setCvUploadUrl(uploadUrl);
        setValue("cvUrl", uploadUrl);
        setValue("cvFile", file.name);
      } catch (error) {
        console.error("Error uploading CV file:", error);
        setCvUploadUrl(null);
      }
    }
  };

  const handleCoverLetterFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverLetterFile(file);
      setCoverLetterUploadUrl(null);
      
      try {
        const uploadUrl = await uploadCoverLetterFile(file);
        setCoverLetterUploadUrl(uploadUrl);
        setValue("coverLetterUrl", uploadUrl);
        setValue("coverLetterFile", file.name);
      } catch (error) {
        console.error("Error uploading cover letter file:", error);
        setCoverLetterUploadUrl(null);
      }
    }
  };

  const handleFormSubmit = async (data: YouthApplicationFormData) => {
    console.log("YouthApplicationForm: Form submitted with data:", data);
    
    // Ensure files are uploaded before submitting
    if (cvFile && !cvUploadUrl) {
      try {
        setIsUploading(true);
        const uploadUrl = await uploadCvFile(cvFile);
        setCvUploadUrl(uploadUrl);
        data.cvUrl = uploadUrl;
      } catch (error) {
        console.error("Error uploading CV file during submit:", error);
        return;
      }
    }
    
    if (coverLetterFile && !coverLetterUploadUrl) {
      try {
        setIsUploading(true);
        const uploadUrl = await uploadCoverLetterFile(coverLetterFile);
        setCoverLetterUploadUrl(uploadUrl);
        data.coverLetterUrl = uploadUrl;
      } catch (error) {
        console.error("Error uploading cover letter file during submit:", error);
        return;
      }
    }
    
    setIsUploading(false);
    onSubmit(data as CreateYouthApplicationData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {mode === "create" ? "Crear Aplicación" : "Editar Aplicación"}
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título de tu Aplicación *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Ej: Desarrollador Frontend con experiencia en React"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe tu experiencia, habilidades, y qué tipo de oportunidades buscas..."
                rows={6}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <h4 className="font-medium">Documentos</h4>
              
              <div className="space-y-2">
                <Label htmlFor="cvFile">CV/Resume</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cvFile"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvFileUpload}
                    className="flex-1"
                    disabled={isUploadingCv}
                  />
                  <Button type="button" variant="outline" size="sm" disabled={isUploadingCv}>
                    {isUploadingCv ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir
                      </>
                    )}
                  </Button>
                </div>
                {cvFile && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Archivo seleccionado: {cvFile.name}
                    </p>
                    {cvUploadUrl && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Subido exitosamente</span>
                      </div>
                    )}
                    {cvUploadError && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Error al subir</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetterFile">Carta de Presentación</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="coverLetterFile"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCoverLetterFileUpload}
                    className="flex-1"
                    disabled={isUploadingCoverLetter}
                  />
                  <Button type="button" variant="outline" size="sm" disabled={isUploadingCoverLetter}>
                    {isUploadingCoverLetter ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir
                      </>
                    )}
                  </Button>
                </div>
                {coverLetterFile && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Archivo seleccionado: {coverLetterFile.name}
                    </p>
                    {coverLetterUploadUrl && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Subido exitosamente</span>
                      </div>
                    )}
                    {coverLetterUploadError && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Error al subir</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* URL Fields */}
            <div className="space-y-4">
              <h4 className="font-medium">Enlaces (Opcional)</h4>
              
              <div className="space-y-2">
                <Label htmlFor="cvUrl">URL del CV</Label>
                <Input
                  id="cvUrl"
                  {...register("cvUrl")}
                  placeholder="https://tu-cv.com"
                  className={errors.cvUrl ? "border-red-500" : ""}
                />
                {errors.cvUrl && (
                  <p className="text-sm text-red-500">{errors.cvUrl.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetterUrl">URL de la Carta de Presentación</Label>
                <Input
                  id="coverLetterUrl"
                  {...register("coverLetterUrl")}
                  placeholder="https://tu-carta.com"
                  className={errors.coverLetterUrl ? "border-red-500" : ""}
                />
                {errors.coverLetterUrl && (
                  <p className="text-sm text-red-500">{errors.coverLetterUrl.message}</p>
                )}
              </div>
            </div>

            {/* Public/Private Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {watchedValues.isPublic ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-600" />
                  )}
                  <Label htmlFor="isPublic" className="font-medium">
                    Aplicación Pública
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {watchedValues.isPublic 
                    ? "Las empresas pueden ver y contactarte"
                    : "Solo tú puedes ver esta aplicación"
                  }
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={watchedValues.isPublic}
                onCheckedChange={(checked) => setValue("isPublic", checked)}
              />
            </div>

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">Por favor corrige los siguientes errores:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>• {error?.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button 
                type="submit" 
                disabled={isLoading || isUploading || isUploadingCv || isUploadingCoverLetter}
                className="flex-1"
              >
                {isLoading || isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  mode === "create" ? "Publicar Aplicación" : "Actualizar Aplicación"
                )}
              </Button>
              {onClose && (
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
