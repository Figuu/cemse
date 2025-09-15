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
  Share2,
  Copy,
  Trash2
} from "lucide-react";
import { useJob, useJobApplications, useDeleteJob } from "@/hooks/useJobs";
import { useSession } from "next-auth/react";
import { useCompanyByUser } from "@/hooks/useCompanies";
import { EmploymentTypeLabels, ExperienceLevelLabels } from "@/types/company";
import Link from "next/link";
import { safePercentage } from "@/lib/utils";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const jobId = params.id as string;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get the company for the current user
  const { data: company, isLoading: companyLoading } = useCompanyByUser(session?.user?.id || "");
  const { data: job, isLoading: jobLoading } = useJob(company?.id || "", jobId);
  const { data: applicationsData, isLoading: applicationsLoading } = useJobApplications({
    companyId: company?.id,
    jobId: jobId,
  });

  const applications = applicationsData?.applications || [];
  const deleteJobMutation = useDeleteJob(company?.id || "", jobId);

  const handleDelete = async () => {
    try {
      await deleteJobMutation.mutateAsync();
      router.push("/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleShare = async () => {
    const jobUrl = `${window.location.origin}/jobs/${jobId}`;
    try {
      await navigator.clipboard.writeText(jobUrl);
      // You could add a toast notification here
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  if (companyLoading || jobLoading) {
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

  if (!company) {
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            {job.title}
          </h1>
          <p className="text-muted-foreground">
            Gestiona este trabajo y sus aplicaciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
          <Link href={`/jobs/${jobId}/edit`}>
            <Button variant="outline" size="sm">
              Editar
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Vistas</span>
            </div>
            <p className="text-2xl font-bold">{job.totalViews || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Aplicaciones</span>
            </div>
            <p className="text-2xl font-bold">{applications.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Tasa de Conversión</span>
            </div>
            <p className="text-2xl font-bold">
              {safePercentage(applications.length, job.totalViews)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Días Activo</span>
            </div>
            <p className="text-2xl font-bold">
              {Math.ceil((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
            </p>
          </CardContent>
        </Card>
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
                <span className="text-sm text-muted-foreground">{job.location}</span>
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
              {job.salaryMin && job.salaryMax && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Salario:</span>
                  <span className="text-sm text-muted-foreground">
                    {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} {job.currency}
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
              
              {job.applicationDeadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Fecha límite:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(job.applicationDeadline).toLocaleDateString()}
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
                {job.requirements.map((req, index) => (
                  <li key={index}>• {req}</li>
                ))}
              </ul>
            </div>
          )}
          
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Beneficios</h4>
              <ul className="text-muted-foreground space-y-1">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>• {benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/jobs/${jobId}/applications`}>
              <Button className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Ver Aplicaciones ({applications.length})
              </Button>
            </Link>
            
            <Link href={`/jobs/${jobId}/analytics`}>
              <Button variant="outline" className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Ver Analytics
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

      {/* Recent Applications Preview */}
      {applications.length > 0 && (
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
                      {application.applicant.profile?.firstName} {application.applicant.profile?.lastName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {application.applicant.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aplicó el {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      application.status === "HIRED" ? "default" :
                      application.status === "INTERVIEWED" ? "secondary" :
                      application.status === "REJECTED" ? "destructive" :
                      "outline"
                    }>
                      {application.status}
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
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
    </div>
  );
}
