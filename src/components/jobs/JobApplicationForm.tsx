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
import { 
  FileText, 
  Upload, 
  Link as LinkIcon, 
  User, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  ExternalLink
} from "lucide-react";
import { JobPosting, EmploymentTypeLabels, ExperienceLevelLabels } from "@/types/company";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useCompleteProfile } from "@/hooks/useCompleteProfile";
import { formatLocation } from "@/lib/formatLocation";

const applicationFormSchema = z.object({
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
  cvData: z.any().optional(), // JSON field for additional CV data
  cvFile: z.string().optional(), // File path/URL for CV
  coverLetterFile: z.string().optional(), // File path/URL for cover letter
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

interface JobApplicationFormProps {
  job: JobPosting;
  onSubmit: (data: ApplicationFormData) => void;
  onClose?: () => void;
  isLoading?: boolean;
  currentUser?: {
    id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      cvUrl?: string;
    };
  };
}

export function JobApplicationForm({ 
  job, 
  onSubmit, 
  onClose,
  isLoading = false,
  currentUser
}: JobApplicationFormProps) {
  const { profile: completeProfile } = useCompleteProfile();
  
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [cvUploadUrl, setCvUploadUrl] = useState<string | null>(null);
  const [coverLetterUploadUrl, setCoverLetterUploadUrl] = useState<string | null>(null);
  
  // Check if user has CV and Cover Letter URLs in their profile
  const userCvUrl = completeProfile?.cvUrl;
  const userCoverLetterUrl = completeProfile?.coverLetterUrl;

  const { uploadFile: uploadCvFile, isUploading: isUploadingCv, error: cvUploadError } = useFileUpload();
  const { uploadFile: uploadCoverLetterFile, isUploading: isUploadingCoverLetter, error: coverLetterUploadError } = useFileUpload();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      coverLetter: "",
      notes: "",
      cvData: null,
      cvFile: "",
      coverLetterFile: "",
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: ApplicationFormData) => {
    // Use user's CV URL if available, otherwise handle file upload
    if (userCvUrl) {
      data.cvFile = userCvUrl;
    } else if (cvFile && !cvUploadUrl) {
      try {
        const uploadUrl = await uploadCvFile(cvFile);
        setCvUploadUrl(uploadUrl);
        data.cvFile = uploadUrl;
      } catch (error) {
        console.error("Error uploading CV file during submit:", error);
        return;
      }
    } else if (cvUploadUrl) {
      data.cvFile = cvUploadUrl;
    }
    
    // Use user's Cover Letter URL if available, otherwise handle file upload
    if (userCoverLetterUrl) {
      data.coverLetterFile = userCoverLetterUrl;
    } else if (coverLetterFile && !coverLetterUploadUrl) {
      try {
        const uploadUrl = await uploadCoverLetterFile(coverLetterFile);
        setCoverLetterUploadUrl(uploadUrl);
        data.coverLetterFile = uploadUrl;
      } catch (error) {
        console.error("Error uploading cover letter file during submit:", error);
        return;
      }
    } else if (coverLetterUploadUrl) {
      data.coverLetterFile = coverLetterUploadUrl;
    }
    
    onSubmit(data);
  };

  const handleCvFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvFile(file);
      setCvUploadUrl(null);
      
      try {
        const uploadUrl = await uploadCvFile(file);
        setCvUploadUrl(uploadUrl);
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
      } catch (error) {
        console.error("Error uploading cover letter file:", error);
        setCoverLetterUploadUrl(null);
      }
    }
  };

  const formatSalary = () => {
    const salaryMin = (job as any).salaryMin || job.salaryMin;
    const salaryMax = (job as any).salaryMax || job.salaryMax;
    const currency = (job as any).salaryCurrency || job.currency || "USD";
    
    if (!salaryMin && !salaryMax) return null;
    
    const min = salaryMin ? salaryMin.toLocaleString() : "";
    const max = salaryMax ? salaryMax.toLocaleString() : "";
    
    if (min && max) {
      return `${min} - ${max} ${currency}`;
    } else if (min) {
      return `Desde ${min} ${currency}`;
    } else if (max) {
      return `Hasta ${max} ${currency}`;
    }
    
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Job Summary */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
            Resumen del Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">{job.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{(job as any).company?.name || job.company?.name || "Empresa no especificada"}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{formatLocation(job.location) || "Ubicación no especificada"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">
                  {(job as any).contractType || 
                   (job.employmentType && EmploymentTypeLabels[job.employmentType as keyof typeof EmploymentTypeLabels]) || 
                   "No especificado"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">
                  {(job.experienceLevel && ExperienceLevelLabels[job.experienceLevel as keyof typeof ExperienceLevelLabels]) || 
                   "No especificado"}
                </span>
              </div>
              {formatSalary() && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green-600 truncate">{formatSalary()}</span>
                </div>
              )}
            </div>

            {job.description && (
              <div>
                <h4 className="font-medium mb-2">Descripción</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {job.description}
                </p>
              </div>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Requisitos</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {(() => {
                    const requirements = (job as any).requirements;
                    if (Array.isArray(requirements)) return requirements;
                    if (typeof requirements === 'string') return requirements.split('\n').filter(r => r.trim());
                    return [];
                  })().map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(() => {
              const responsibilities = (job as any).responsibilities;
              if (responsibilities && responsibilities.length > 0) {
                return (
                  <div>
                    <h4 className="font-medium mb-2">Responsabilidades</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {responsibilities.map((responsibility: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          {responsibility}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            Aplicar al Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Información Personal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Nombre</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">
                      {currentUser?.profile?.firstName || ""} {currentUser?.profile?.lastName || ""}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Email</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{currentUser?.email}</span>
                  </div>
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm">Teléfono</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">
                      {currentUser?.profile?.phone || "No proporcionado"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Documentos</h4>
              <div className="space-y-2">
                <Label htmlFor="cvFile" className="text-sm">CV/Resume</Label>
                
                {userCvUrl ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-sm font-medium text-green-800">
                        Usando tu CV guardado
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Se utilizará automáticamente tu CV del perfil. Si quieres usar un CV diferente, puedes subir uno nuevo.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      id="cvFile"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvFileUpload}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      disabled={isUploadingCv}
                      onClick={() => {
                        const input = document.getElementById('cvFile') as HTMLInputElement;
                        input?.click();
                      }}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingCv ? "Subiendo..." : "Subir"}
                    </Button>
                  </div>
                )}
                
                {cvFile && (
                  <p className="text-sm text-muted-foreground">
                    Archivo seleccionado: {cvFile.name}
                    {cvUploadUrl && " ✓ Subido"}
                  </p>
                )}
                {cvUploadError && (
                  <p className="text-sm text-destructive">
                    Error al subir CV: {cvUploadError}
                  </p>
                )}
              </div>
            </div>


            {/* Cover Letter */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Carta de Presentación</h4>
              <div className="space-y-2">
                <Label htmlFor="coverLetter" className="text-sm">Carta de Presentación (Opcional)</Label>
                <Textarea
                  id="coverLetter"
                  {...register("coverLetter")}
                  placeholder="Explica por qué eres el candidato ideal para este trabajo..."
                  rows={4}
                  className="resize-none"
                />
                {errors.coverLetter && (
                  <p className="text-sm text-destructive">{errors.coverLetter.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Una carta de presentación personalizada puede aumentar tus posibilidades de ser seleccionado.
                </p>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Notas Adicionales</h4>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">Notas (Opcional)</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Cualquier información adicional que quieras compartir..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Application Summary */}
            <Card className="bg-muted/50">
              <CardContent className="p-3 sm:p-4">
                <h4 className="font-medium mb-3 text-sm sm:text-base">Resumen de tu Aplicación</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground">CV/Resume:</span>
                    <span className="text-right sm:text-left">
                      {userCvUrl 
                        ? "CV del perfil (automático)" 
                        : cvFile 
                          ? cvFile.name 
                          : "No seleccionado"
                      }
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground">Carta de Presentación:</span>
                    <span className="text-right sm:text-left">{watchedValues.coverLetter ? "Incluida" : "No incluida"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Enviando Aplicación..." : "Enviar Aplicación"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}