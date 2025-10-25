"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Briefcase, 
  Users, 
  Eye, 
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Target,
  Trash2
} from "lucide-react";
import { useJob, useJobById, useJobApplications, useDeleteJob } from "@/hooks/useJobs";
import { useSession } from "next-auth/react";
import { useCompanyByUser } from "@/hooks/useCompanies";
import { useJobApplicationStatus } from "@/hooks/useJobApplicationStatus";
import { EmploymentTypeLabels, ExperienceLevelLabels, ApplicationStatusLabels } from "@/types/company";
import Link from "next/link";
import { safePercentage } from "@/lib/utils";
import { JobApplicationModal } from "@/components/jobs/JobApplicationModal";
import { LocationMap } from "@/components/ui/LocationMap";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const jobId = params.id as string;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Determine user role and fetch data accordingly
  const isCompany = session?.user?.role === "COMPANIES";
  const isYouth = session?.user?.role === "YOUTH";

  // Get the company for company users
  const { data: company, isLoading: companyLoading } = useCompanyByUser(session?.user?.id || "");
  
  // Determine if user is a company user (has a company)
  const isCompanyUser = !!company;
  
  // Get job data based on user role
  const { data: companyJob, isLoading: companyJobLoading } = useJob(company?.id || "", jobId);
  const { data: youthJob, isLoading: youthJobLoading } = useJobById(jobId);
  
  // Use appropriate job data
  const job = isCompanyUser ? companyJob : youthJob;
  const jobLoading = isCompanyUser ? companyJobLoading : youthJobLoading;
  
  // Get applications only for company users
  const { data: applicationsData, isLoading: applicationsLoading } = useJobApplications({
    companyId: company?.id,
    jobId: jobId,
  });

  const applications = applicationsData?.applications || [];
  const deleteJobMutation = useDeleteJob(company?.id || "", jobId);
  
  // Check application status for youth users
  const { getApplicationStatus } = useJobApplicationStatus(isYouth ? [jobId] : []);
  const applicationStatus = getApplicationStatus(jobId);

  const handleDelete = async () => {
    try {
      await deleteJobMutation.mutateAsync();
      router.push("/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  // Helper function to parse location data
  const parseLocationData = (location: any) => {
    if (typeof location === 'string') {
      // Handle old string format - default to La Paz coordinates
      return {
        lat: -16.5000,
        lng: -68.1500,
        address: location,
      };
    }
    if (location && typeof location === 'object' && location.lat && location.lng) {
      return {
        lat: location.lat,
        lng: location.lng,
        address: location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      };
    }
    // Default fallback
    return {
      lat: -16.5000,
      lng: -68.1500,
      address: "La Paz, Bolivia",
    };
  };


  if (jobLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="h-8 w-32 bg-muted rounded"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show company not found only for company users
  if (isCompany && companyLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Empresa no encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Primero necesitas crear o configurar tu empresa
          </p>
          <Link href="/company">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ir a Mi Empresa
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Trabajo no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            El trabajo que buscas no existe o no tienes permisos para verlo
          </p>
          <Link href="/jobs">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Trabajos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0 mb-6 sm:mb-8">
        <Link href="/jobs">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="truncate">{job.title}</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isCompanyUser 
              ? "Gestiona este trabajo y sus aplicaciones"
              : `Oferta de trabajo en ${job.company?.name || "Empresa"}`
            }
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          {isCompanyUser && (
            <>
              <Link href={`/jobs/${jobId}/edit`}>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Editar
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDeleteDialog(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </>
          )}
          {isYouth && (
            <Button 
              size="sm" 
              className="w-full sm:w-auto"
              onClick={() => applicationStatus.hasApplied ? router.push(`/applications/${applicationStatus.applicationId}`) : setShowApplicationModal(true)}
              variant={applicationStatus.hasApplied ? "outline" : "default"}
            >
              {applicationStatus.hasApplied ? "Ver Mi Aplicación" : "Aplicar Ahora"}
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {isCompanyUser ? (
          <>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium">Vistas</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold">{(job as any).viewsCount || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium">Aplicaciones</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold">{applications.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="text-xs sm:text-sm font-medium">Días Activo</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold">
                  {Math.ceil((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Publicado</span>
                </div>
                <p className="text-2xl font-bold">
                  {Math.ceil((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))} días
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Experiencia</span>
                </div>
                <p className="text-2xl font-bold">
                  {ExperienceLevelLabels[job.experienceLevel] || job.experienceLevel}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Tipo</span>
                </div>
                <p className="text-2xl font-bold">
                  {EmploymentTypeLabels[(job as any).contractType] || (job as any).contractType}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Salario</span>
                </div>
                <p className="text-2xl font-bold">
                  {job.salaryMin && job.salaryMax 
                    ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${(job as any).salaryCurrency || job.currency}`
                    : "A convenir"
                  }
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Job Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Información del Trabajo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Ubicación:</span>
                <span className="text-sm text-muted-foreground">
                  {parseLocationData(job.location).address}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tipo:</span>
                <Badge variant="outline">
                  {EmploymentTypeLabels[(job as any).contractType] || job.employmentType || (job as any).contractType}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Experiencia:</span>
                <Badge variant="outline">
                  {ExperienceLevelLabels[job.experienceLevel] || job.experienceLevel}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Publicado:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {((job as any).salaryMin || job.salaryMin) && ((job as any).salaryMax || job.salaryMax) && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Salario:</span>
                  <span className="text-sm text-muted-foreground">
                    {((job as any).salaryMin || job.salaryMin)?.toLocaleString()} - {((job as any).salaryMax || job.salaryMax)?.toLocaleString()} {(job as any).salaryCurrency || job.currency || 'USD'}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Badge variant={job.isActive ? "default" : "secondary"}>
                  {job.isActive ? "Activo" : "Inactivo"}
                </Badge>
                {((job as any).featured || job.isFeatured) && (
                  <Badge variant="outline">Destacado</Badge>
                )}
              </div>
              
              {((job as any).applicationDeadline || job.applicationDeadline) && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Fecha límite:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date((job as any).applicationDeadline || job.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Descripción</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
          </div>
          
           {job.requirements && (
             <div>
               <h4 className="font-medium mb-2">Requisitos</h4>
               <ul className="text-muted-foreground space-y-1">
                 {(() => {
                   const requirements = (job as any).requirements;
                   if (Array.isArray(requirements)) {
                     return requirements.map((req, index) => (
                       <li key={index}>• {req}</li>
                     ));
                   } else if (typeof requirements === 'string') {
                     return requirements.split('\n').filter(r => r.trim()).map((req, index) => (
                       <li key={index}>• {req}</li>
                     ));
                   }
                   return null;
                 })()}
               </ul>
             </div>
           )}
           
           {job.benefits && (
             <div>
               <h4 className="font-medium mb-2">Beneficios</h4>
               <ul className="text-muted-foreground space-y-1">
                 {(() => {
                   const benefits = (job as any).benefits;
                   if (Array.isArray(benefits)) {
                     return benefits.map((benefit, index) => (
                       <li key={index}>• {benefit}</li>
                     ));
                   } else if (typeof benefits === 'string') {
                     return benefits.split('\n').filter(b => b.trim()).map((benefit, index) => (
                       <li key={index}>• {benefit}</li>
                     ));
                   }
                   return null;
                 })()}
               </ul>
             </div>
           )}
        </CardContent>
      </Card>

      {/* Location Map - Only for Youth Users */}
      {isYouth && (
        <LocationMap 
          location={parseLocationData(job.location)}
          title="Ubicación del Trabajo"
          height="h-80"
        />
      )}

      {/* Quick Actions - Only for Company Users */}
      {isCompanyUser && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href={`/jobs/${jobId}/applications`}>
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Ver Aplicaciones ({applications.length})
                </Button>
              </Link>
              
              <Link href={`/jobs/${jobId}/edit`}>
                <Button variant="outline" className="w-full">
                  Editar Trabajo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Applications Preview - Only for company users */}
      {isCompanyUser && applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aplicaciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.slice(0, 3).map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">
                      {application.applicant.firstName} {application.applicant.lastName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {application.applicant.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aplicó el {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                     <Badge variant={
                       application.status === "HIRED" ? "default" :
                       application.status === "PRE_SELECTED" ? "secondary" :
                       application.status === "REJECTED" ? "destructive" :
                       "outline"
                     }>
                      {ApplicationStatusLabels[application.status as keyof typeof ApplicationStatusLabels] || application.status}
                    </Badge>
                    <Link href={`/jobs/${jobId}/applications`}>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              
              {applications.length > 3 && (
                <div className="text-center">
                  <Link href={`/jobs/${jobId}/applications`}>
                    <Button variant="outline">
                      Ver todas las aplicaciones ({applications.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog - Only for company users */}
      {isCompanyUser && showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                ¿Eliminar trabajo?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Esta acción no se puede deshacer. Se eliminará permanentemente el trabajo 
                "{job.title}" y todas sus aplicaciones.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteJobMutation.isPending}
                >
                  {deleteJobMutation.isPending ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Job Application Modal */}
      {isYouth && !applicationStatus.hasApplied && (
        <JobApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          jobId={jobId}
          jobTitle={job.title}
          companyName={job.company?.name || "Empresa"}
          job={job}
        />
      )}
    </div>
  );
}
