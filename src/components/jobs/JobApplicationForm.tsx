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
import { JobPosting } from "@/types/company";
import { useFileUpload } from "@/hooks/useFileUpload";

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
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [cvUploadUrl, setCvUploadUrl] = useState<string | null>(null);
  const [coverLetterUploadUrl, setCoverLetterUploadUrl] = useState<string | null>(null);

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
    // Ensure files are uploaded before submitting
    if (cvFile && !cvUploadUrl) {
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
    
    if (coverLetterFile && !coverLetterUploadUrl) {
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Job Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Resumen del Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{job.title}</h3>
              <p className="text-muted-foreground">{(job as any).company?.name || job.company?.name || "Empresa no especificada"}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{job.location || "Ubicación no especificada"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{(job as any).contractType || job.employmentType || "No especificado"}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{job.experienceLevel || "No especificado"}</span>
              </div>
              {formatSalary() && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green-600">{formatSalary()}</span>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Aplicar al Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Información Personal</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {currentUser?.profile?.firstName || ""} {currentUser?.profile?.lastName || ""}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentUser?.email}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {currentUser?.profile?.phone || "No proporcionado"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Upload */}
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
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploadingCv ? "Subiendo..." : "Subir"}
                  </Button>
                </div>
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
            <div className="space-y-4">
              <h4 className="font-medium">Carta de Presentación</h4>
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Carta de Presentación (Opcional)</Label>
                <Textarea
                  id="coverLetter"
                  {...register("coverLetter")}
                  placeholder="Explica por qué eres el candidato ideal para este trabajo..."
                  rows={6}
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
            <div className="space-y-4">
              <h4 className="font-medium">Notas Adicionales</h4>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Cualquier información adicional que quieras compartir..."
                  rows={3}
                />
              </div>
            </div>

            {/* Application Summary */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Resumen de tu Aplicación</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CV/Resume:</span>
                    <span>{cvFile ? cvFile.name : "No seleccionado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carta de Presentación:</span>
                    <span>{watchedValues.coverLetter ? "Incluida" : "No incluida"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enviando Aplicación..." : "Enviar Aplicación"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}