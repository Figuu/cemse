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

const applicationFormSchema = z.object({
  coverLetter: z.string().optional(),
  resume: z.string().optional(),
  portfolio: z.string().url().optional().or(z.literal("")),
  linkedinProfile: z.string().url().optional().or(z.literal("")),
  githubProfile: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

interface JobApplicationFormProps {
  job: JobPosting;
  onSubmit: (data: ApplicationFormData) => void;
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
  isLoading = false,
  currentUser
}: JobApplicationFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      coverLetter: "",
      resume: "",
      portfolio: "",
      linkedinProfile: "",
      githubProfile: "",
      notes: "",
    },
  });

  const watchedValues = watch();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      // In a real app, you would upload the file and get a URL
      // For now, we'll just store the file name
    }
  };

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    
    const min = job.salaryMin ? job.salaryMin.toLocaleString() : "";
    const max = job.salaryMax ? job.salaryMax.toLocaleString() : "";
    
    if (min && max) {
      return `${min} - ${max} ${job.currency}`;
    } else if (min) {
      return `Desde ${min} ${job.currency}`;
    } else if (max) {
      return `Hasta ${max} ${job.currency}`;
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
              <p className="text-muted-foreground">{job.company.name}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{job.employmentType}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{job.experienceLevel}</span>
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

            {job.requirements.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Requisitos</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.responsibilities.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Responsabilidades</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      {responsibility}
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Aplicar al Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              </div>
            </div>

            {/* Resume Upload */}
            <div className="space-y-4">
              <h4 className="font-medium">Documentos</h4>
              <div className="space-y-2">
                <Label htmlFor="resume">CV/Resume</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Subir
                  </Button>
                </div>
                {resumeFile && (
                  <p className="text-sm text-muted-foreground">
                    Archivo seleccionado: {resumeFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Portfolio and Profiles */}
            <div className="space-y-4">
              <h4 className="font-medium">Portfolio y Perfiles</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio (URL)</Label>
                  <div className="flex gap-2">
                    <LinkIcon className="h-4 w-4 mt-3 text-muted-foreground" />
                    <Input
                      id="portfolio"
                      {...register("portfolio")}
                      placeholder="https://tu-portfolio.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedinProfile">LinkedIn</Label>
                    <div className="flex gap-2">
                      <LinkIcon className="h-4 w-4 mt-3 text-muted-foreground" />
                      <Input
                        id="linkedinProfile"
                        {...register("linkedinProfile")}
                        placeholder="https://linkedin.com/in/tu-perfil"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="githubProfile">GitHub</Label>
                    <div className="flex gap-2">
                      <LinkIcon className="h-4 w-4 mt-3 text-muted-foreground" />
                      <Input
                        id="githubProfile"
                        {...register("githubProfile")}
                        placeholder="https://github.com/tu-usuario"
                      />
                    </div>
                  </div>
                </div>
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
                    <span>{resumeFile ? resumeFile.name : "No seleccionado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Portfolio:</span>
                    <span>{watchedValues.portfolio || "No proporcionado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LinkedIn:</span>
                    <span>{watchedValues.linkedinProfile || "No proporcionado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GitHub:</span>
                    <span>{watchedValues.githubProfile || "No proporcionado"}</span>
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
              <Button type="button" variant="outline">
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