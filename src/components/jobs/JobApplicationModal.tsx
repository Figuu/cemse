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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Upload, 
  User, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Loader2
} from "lucide-react";
import { useApplications } from "@/hooks/useApplications";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useSession } from "next-auth/react";
import { EmploymentTypeLabels, ExperienceLevelLabels } from "@/types/company";
import { toast } from "sonner";

const applicationFormSchema = z.object({
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
  cvData: z.any().optional(),
  cvFile: z.string().optional(),
  coverLetterFile: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
  job: any; // Job object with all details
}

export function JobApplicationModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  companyName,
  job,
}: JobApplicationModalProps) {
  const { data: session } = useSession();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [cvUploadUrl, setCvUploadUrl] = useState<string | null>(null);
  const [coverLetterUploadUrl, setCoverLetterUploadUrl] = useState<string | null>(null);
  
  // Check if user has a CV URL in their profile
  const userCvUrl = session?.user?.profile?.cvUrl;

  const { uploadFile: uploadCvFile, isUploading: isUploadingCv, error: cvUploadError } = useFileUpload();
  const { uploadFile: uploadCoverLetterFile, isUploading: isUploadingCoverLetter, error: coverLetterUploadError } = useFileUpload();
  const { createApplication } = useApplications();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
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

  const formatSalary = () => {
    const salaryMin = job.salaryMin;
    const salaryMax = job.salaryMax;
    const currency = job.salaryCurrency || "USD";
    
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

    try {
      await createApplication({
        jobId,
        coverLetter: data.coverLetter,
        notes: data.notes,
        cvFile: data.cvFile,
        coverLetterFile: data.coverLetterFile,
      });
      
      toast.success("¡Aplicación enviada exitosamente!");
      handleClose();
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error("Error al enviar la aplicación. Intenta nuevamente.");
    }
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

  const handleClose = () => {
    reset();
    setCvFile(null);
    setCoverLetterFile(null);
    setCvUploadUrl(null);
    setCoverLetterUploadUrl(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Aplicar a Trabajo
          </DialogTitle>
          <DialogDescription>
            Envía tu aplicación para el puesto de <strong>{jobTitle}</strong> en <strong>{companyName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
                  <h3 className="text-lg sm:text-xl font-semibold">{jobTitle}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{companyName}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{job.location || "Ubicación no especificada"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">
                      {job.contractType || 
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
                        const requirements = job.requirements;
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
                          {session?.user?.profile?.firstName || ""} {session?.user?.profile?.lastName || ""}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Email</Label>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{session?.user?.email}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-sm">Teléfono</Label>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">
                          {session?.user?.profile?.phone || "No proporcionado"}
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

                {/* Submit Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClose}
                    disabled={createApplication.isPending}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createApplication.isPending}
                    className="w-full sm:w-auto"
                  >
                    {createApplication.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando Aplicación...
                      </>
                    ) : (
                      "Enviar Aplicación"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}