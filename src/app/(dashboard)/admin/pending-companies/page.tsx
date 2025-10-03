"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Building2, Mail, Phone, MapPin, Calendar, Briefcase, CheckCircle, XCircle, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PendingCompany {
  id: string;
  name: string;
  email: string;
  phone?: string;
  taxId?: string;
  legalRepresentative?: string;
  businessSector?: string;
  companySize?: string;
  approvalStatus: string;
  createdAt: string;
}

function PendingCompaniesManagement() {
  const [selectedCompany, setSelectedCompany] = useState<PendingCompany | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const queryClient = useQueryClient();

  // Fetch pending companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['pending-companies'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pending-companies');
      if (!response.ok) throw new Error('Failed to fetch pending companies');
      return response.json();
    }
  });

  // Approve company mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/pending-companies/${id}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve company');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-companies'] });
      setIsApproveDialogOpen(false);
      setSelectedCompany(null);
      toast.success('Empresa aprobada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al aprobar empresa: ' + error.message);
    }
  });

  // Reject company mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/admin/pending-companies/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to reject company');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-companies'] });
      setIsRejectDialogOpen(false);
      setSelectedCompany(null);
      setRejectionReason("");
      toast.success('Empresa rechazada');
    },
    onError: (error) => {
      toast.error('Error al rechazar empresa: ' + error.message);
    }
  });

  const handleApprove = (company: PendingCompany) => {
    setSelectedCompany(company);
    setIsApproveDialogOpen(true);
  };

  const handleReject = (company: PendingCompany) => {
    setSelectedCompany(company);
    setIsRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedCompany) {
      approveMutation.mutate(selectedCompany.id);
    }
  };

  const confirmReject = () => {
    if (selectedCompany && rejectionReason.trim()) {
      rejectMutation.mutate({ id: selectedCompany.id, reason: rejectionReason });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCompanySizeText = (size?: string) => {
    switch (size) {
      case 'MICRO': return 'Micro';
      case 'SMALL': return 'Pequeña';
      case 'MEDIUM': return 'Mediana';
      case 'LARGE': return 'Grande';
      default: return size || 'No especificado';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Empresas Pendientes de Aprobación</h1>
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
        <h1 className="text-2xl font-bold">Empresas Pendientes de Aprobación</h1>
        <p className="text-muted-foreground">Revisa y aprueba las solicitudes de registro de empresas</p>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay empresas pendientes</h3>
            <p className="text-muted-foreground">
              Todas las solicitudes han sido procesadas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {companies.map((company: PendingCompany) => (
            <Card key={company.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base">{company.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{company.email}</span>
                        </div>
                        {company.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{company.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendiente
                        </Badge>
                        {company.businessSector && (
                          <Badge variant="outline">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {company.businessSector}
                          </Badge>
                        )}
                        {company.companySize && (
                          <Badge variant="outline">
                            {getCompanySizeText(company.companySize)}
                          </Badge>
                        )}
                        {company.taxId && (
                          <Badge variant="outline">
                            NIT: {company.taxId}
                          </Badge>
                        )}
                      </div>
                      {company.legalRepresentative && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Representante Legal: {company.legalRepresentative}
                        </p>
                      )}
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>Solicitado: {formatDate(company.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(company)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(company)}
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
            <DialogTitle>Aprobar Empresa</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres aprobar esta empresa?
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <div className="py-4">
              <p className="font-medium">{selectedCompany.name}</p>
              <p className="text-sm text-muted-foreground">{selectedCompany.email}</p>
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
            <DialogTitle>Rechazar Empresa</DialogTitle>
            <DialogDescription>
              Proporciona un motivo para el rechazo de esta solicitud
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedCompany.name}</p>
                <p className="text-sm text-muted-foreground">{selectedCompany.email}</p>
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

export default function PendingCompaniesPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN", "INSTITUTION"]}>
      <PendingCompaniesManagement />
    </RoleGuard>
  );
}
