"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Building2, Mail, Phone, MapPin, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PendingInstitution {
  id: string;
  name: string;
  email: string;
  phone?: string;
  institutionType: string;
  department: string;
  mayorName?: string;
  approvalStatus: string;
  createdAt: string;
}

function PendingInstitutionsManagement() {
  const [selectedInstitution, setSelectedInstitution] = useState<PendingInstitution | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const queryClient = useQueryClient();

  // Fetch pending institutions
  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ['pending-institutions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pending-institutions');
      if (!response.ok) throw new Error('Failed to fetch pending institutions');
      return response.json();
    }
  });

  // Approve institution mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/pending-institutions/${id}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve institution');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-institutions'] });
      setIsApproveDialogOpen(false);
      setSelectedInstitution(null);
      toast.success('Institución aprobada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al aprobar institución: ' + error.message);
    }
  });

  // Reject institution mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/admin/pending-institutions/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to reject institution');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-institutions'] });
      setIsRejectDialogOpen(false);
      setSelectedInstitution(null);
      setRejectionReason("");
      toast.success('Institución rechazada');
    },
    onError: (error) => {
      toast.error('Error al rechazar institución: ' + error.message);
    }
  });

  const handleApprove = (institution: PendingInstitution) => {
    setSelectedInstitution(institution);
    setIsApproveDialogOpen(true);
  };

  const handleReject = (institution: PendingInstitution) => {
    setSelectedInstitution(institution);
    setIsRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedInstitution) {
      approveMutation.mutate(selectedInstitution.id);
    }
  };

  const confirmReject = () => {
    if (selectedInstitution && rejectionReason.trim()) {
      rejectMutation.mutate({ id: selectedInstitution.id, reason: rejectionReason });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInstitutionTypeText = (type: string) => {
    switch (type) {
      case 'MUNICIPALITY': return 'Municipalidad';
      case 'NGO': return 'ONG';
      case 'TRAINING_CENTER': return 'Centro de Capacitación';
      case 'FOUNDATION': return 'Fundación';
      case 'OTHER': return 'Otro';
      default: return type;
    }
  };

  const getInstitutionTypeColor = (type: string) => {
    switch (type) {
      case 'MUNICIPALITY': return 'bg-blue-100 text-blue-800';
      case 'NGO': return 'bg-green-100 text-green-800';
      case 'TRAINING_CENTER': return 'bg-purple-100 text-purple-800';
      case 'FOUNDATION': return 'bg-orange-100 text-orange-800';
      case 'OTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Instituciones Pendientes de Aprobación</h1>
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Instituciones Pendientes de Aprobación</h1>
        <p className="text-muted-foreground">Revisa y aprueba las solicitudes de registro de instituciones</p>
      </div>

      {institutions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay instituciones pendientes</h3>
            <p className="text-muted-foreground">
              Todas las solicitudes han sido procesadas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {institutions.map((institution: PendingInstitution) => (
            <Card key={institution.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base">{institution.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{institution.email}</span>
                        </div>
                        {institution.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{institution.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{institution.department}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendiente
                        </Badge>
                        <Badge className={getInstitutionTypeColor(institution.institutionType)}>
                          {getInstitutionTypeText(institution.institutionType)}
                        </Badge>
                      </div>
                      {institution.mayorName && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responsable: {institution.mayorName}
                        </p>
                      )}
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>Solicitado: {formatDate(institution.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(institution)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(institution)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Institución</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres aprobar esta institución?
            </DialogDescription>
          </DialogHeader>
          {selectedInstitution && (
            <div className="py-4">
              <p className="font-medium">{selectedInstitution.name}</p>
              <p className="text-sm text-muted-foreground">{selectedInstitution.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmApprove} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? 'Aprobando...' : 'Aprobar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Institución</DialogTitle>
            <DialogDescription>
              Proporciona un motivo para el rechazo de esta solicitud
            </DialogDescription>
          </DialogHeader>
          {selectedInstitution && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedInstitution.name}</p>
                <p className="text-sm text-muted-foreground">{selectedInstitution.email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo del rechazo</Label>
                <Textarea
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explica por qué se rechaza esta solicitud..."
                  rows={4}
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              {rejectMutation.isPending ? 'Rechazando...' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PendingInstitutionsPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN"]}>
      <PendingInstitutionsManagement />
    </RoleGuard>
  );
}
