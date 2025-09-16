"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Globe
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Institution {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  department: string;
  region?: string;
  population?: number;
  mayorName?: string;
  mayorEmail?: string;
  mayorPhone?: string;
  institutionType: string;
  customType?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function InstitutionsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [institutionToDelete, setInstitutionToDelete] = useState<Institution | null>(null);
  const queryClient = useQueryClient();

  // Fetch institutions
  const { data: institutions = [], isLoading, error } = useQuery({
    queryKey: ['admin-institutions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/institutions');
      if (!response.ok) throw new Error('Failed to fetch institutions');
      return response.json();
    }
  });

  // Create institution mutation
  const createInstitutionMutation = useMutation({
    mutationFn: async (institutionData: any) => {
      const response = await fetch('/api/admin/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(institutionData)
      });
      if (!response.ok) throw new Error('Failed to create institution');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
      setIsCreateDialogOpen(false);
      toast.success('Institución creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear institución: ' + error.message);
    }
  });

  // Update institution mutation
  const updateInstitutionMutation = useMutation({
    mutationFn: async ({ id, institutionData }: { id: string; institutionData: any }) => {
      const response = await fetch(`/api/admin/institutions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(institutionData)
      });
      if (!response.ok) throw new Error('Failed to update institution');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
      setIsEditDialogOpen(false);
      setSelectedInstitution(null);
      toast.success('Institución actualizada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar institución: ' + error.message);
    }
  });

  // Delete institution mutation
  const deleteInstitutionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/institutions/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete institution');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
      setIsDeleteDialogOpen(false);
      setInstitutionToDelete(null);
      toast.success('Institución eliminada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar institución: ' + error.message);
    }
  });

  const filteredInstitutions = institutions.filter((institution: Institution) =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateInstitution = (formData: FormData) => {
    const institutionData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      website: formData.get('website') as string,
      department: formData.get('department') as string,
      region: formData.get('region') as string,
      population: formData.get('population') ? parseInt(formData.get('population') as string) : undefined,
      mayorName: formData.get('mayorName') as string,
      mayorEmail: formData.get('mayorEmail') as string,
      mayorPhone: formData.get('mayorPhone') as string,
      institutionType: formData.get('institutionType') as string,
      customType: formData.get('customType') as string,
      primaryColor: formData.get('primaryColor') as string,
      secondaryColor: formData.get('secondaryColor') as string
    };
    createInstitutionMutation.mutate(institutionData);
  };

  const handleUpdateInstitution = (formData: FormData) => {
    if (!selectedInstitution) return;
    const institutionData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      website: formData.get('website') as string,
      department: formData.get('department') as string,
      region: formData.get('region') as string,
      population: formData.get('population') ? parseInt(formData.get('population') as string) : undefined,
      mayorName: formData.get('mayorName') as string,
      mayorEmail: formData.get('mayorEmail') as string,
      mayorPhone: formData.get('mayorPhone') as string,
      institutionType: formData.get('institutionType') as string,
      customType: formData.get('customType') as string,
      primaryColor: formData.get('primaryColor') as string,
      secondaryColor: formData.get('secondaryColor') as string,
      isActive: formData.get('isActive') === 'true'
    };
    updateInstitutionMutation.mutate({ id: selectedInstitution.id, institutionData });
  };

  const handleDeleteInstitution = (institution: Institution) => {
    setInstitutionToDelete(institution);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (institutionToDelete) {
      deleteInstitutionMutation.mutate(institutionToDelete.id);
    }
  };

  const openEditDialog = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInstitutionTypeText = (type: string) => {
    switch (type) {
      case 'MUNICIPALITY':
        return 'Municipalidad';
      case 'NGO':
        return 'ONG';
      case 'TRAINING_CENTER':
        return 'Centro de Capacitación';
      case 'FOUNDATION':
        return 'Fundación';
      case 'OTHER':
        return 'Otro';
      default:
        return type;
    }
  };

  const getInstitutionTypeColor = (type: string) => {
    switch (type) {
      case 'MUNICIPALITY':
        return 'bg-blue-100 text-blue-800';
      case 'NGO':
        return 'bg-green-100 text-green-800';
      case 'TRAINING_CENTER':
        return 'bg-purple-100 text-purple-800';
      case 'FOUNDATION':
        return 'bg-orange-100 text-orange-800';
      case 'OTHER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Instituciones</h1>
            <p className="text-muted-foreground">Administra las instituciones del sistema</p>
          </div>
        </div>
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Instituciones</h1>
            <p className="text-muted-foreground">Administra las instituciones del sistema</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Error al cargar las instituciones: {(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Instituciones</h1>
          <p className="text-muted-foreground">Administra las instituciones del sistema</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Institución
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Institución</DialogTitle>
              <DialogDescription>
                Crea una nueva institución con credenciales básicas
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateInstitution} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Institución *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" name="address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input id="website" name="website" type="url" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento *</Label>
                  <Input id="department" name="department" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Región</Label>
                  <Input id="region" name="region" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="population">Población</Label>
                  <Input id="population" name="population" type="number" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institutionType">Tipo de Institución *</Label>
                  <Select name="institutionType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MUNICIPALITY">Municipalidad</SelectItem>
                      <SelectItem value="NGO">ONG</SelectItem>
                      <SelectItem value="TRAINING_CENTER">Centro de Capacitación</SelectItem>
                      <SelectItem value="FOUNDATION">Fundación</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customType">Tipo Personalizado</Label>
                  <Input id="customType" name="customType" placeholder="Si seleccionaste 'Otro'" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mayorName">Nombre del Alcalde/Director</Label>
                  <Input id="mayorName" name="mayorName" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mayorEmail">Email del Alcalde/Director</Label>
                  <Input id="mayorEmail" name="mayorEmail" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mayorPhone">Teléfono del Alcalde/Director</Label>
                  <Input id="mayorPhone" name="mayorPhone" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Color Primario</Label>
                  <Input id="primaryColor" name="primaryColor" type="color" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Color Secundario</Label>
                  <Input id="secondaryColor" name="secondaryColor" type="color" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createInstitutionMutation.isPending}>
                  {createInstitutionMutation.isPending ? 'Creando...' : 'Crear Institución'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Institutions List */}
      <div className="space-y-4">
        {filteredInstitutions.map((institution: Institution) => (
          <Card key={institution.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{institution.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
                      {institution.website && (
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span className="truncate max-w-32">{institution.website}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={institution.isActive ? "default" : "secondary"}>
                        {institution.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge className={getInstitutionTypeColor(institution.institutionType)}>
                        {getInstitutionTypeText(institution.institutionType)}
                      </Badge>
                      {institution.population && (
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {institution.population.toLocaleString()} hab.
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Registrado: {formatDate(institution.createdAt)}</span>
                  </div>
                  {institution.mayorName && (
                    <p className="text-xs mt-1">Dir: {institution.mayorName}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(institution)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteInstitution(institution)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInstitutions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron instituciones</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'No hay instituciones que coincidan con tu búsqueda.' : 'No hay instituciones registradas.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Institución</DialogTitle>
            <DialogDescription>
              Modifica la información de la institución
            </DialogDescription>
          </DialogHeader>
          {selectedInstitution && (
            <form action={handleUpdateInstitution} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre de la Institución *</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={selectedInstitution.name}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input 
                    id="edit-email" 
                    name="email" 
                    type="email" 
                    defaultValue={selectedInstitution.email}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input 
                    id="edit-phone" 
                    name="phone" 
                    defaultValue={selectedInstitution.phone}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-isActive">Estado</Label>
                  <Select name="isActive" defaultValue={selectedInstitution.isActive.toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Dirección</Label>
                <Input 
                  id="edit-address" 
                  name="address" 
                  defaultValue={selectedInstitution.address}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-website">Sitio Web</Label>
                  <Input 
                    id="edit-website" 
                    name="website" 
                    type="url" 
                    defaultValue={selectedInstitution.website}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Departamento *</Label>
                  <Input 
                    id="edit-department" 
                    name="department" 
                    defaultValue={selectedInstitution.department}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-region">Región</Label>
                  <Input 
                    id="edit-region" 
                    name="region" 
                    defaultValue={selectedInstitution.region}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-population">Población</Label>
                  <Input 
                    id="edit-population" 
                    name="population" 
                    type="number" 
                    defaultValue={selectedInstitution.population}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-institutionType">Tipo de Institución *</Label>
                  <Select name="institutionType" defaultValue={selectedInstitution.institutionType} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MUNICIPALITY">Municipalidad</SelectItem>
                      <SelectItem value="NGO">ONG</SelectItem>
                      <SelectItem value="TRAINING_CENTER">Centro de Capacitación</SelectItem>
                      <SelectItem value="FOUNDATION">Fundación</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-customType">Tipo Personalizado</Label>
                  <Input 
                    id="edit-customType" 
                    name="customType" 
                    defaultValue={selectedInstitution.customType}
                    placeholder="Si seleccionaste 'Otro'" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-mayorName">Nombre del Alcalde/Director</Label>
                  <Input 
                    id="edit-mayorName" 
                    name="mayorName" 
                    defaultValue={selectedInstitution.mayorName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-mayorEmail">Email del Alcalde/Director</Label>
                  <Input 
                    id="edit-mayorEmail" 
                    name="mayorEmail" 
                    type="email" 
                    defaultValue={selectedInstitution.mayorEmail}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-mayorPhone">Teléfono del Alcalde/Director</Label>
                  <Input 
                    id="edit-mayorPhone" 
                    name="mayorPhone" 
                    defaultValue={selectedInstitution.mayorPhone}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-primaryColor">Color Primario</Label>
                  <Input 
                    id="edit-primaryColor" 
                    name="primaryColor" 
                    type="color" 
                    defaultValue={selectedInstitution.primaryColor}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-secondaryColor">Color Secundario</Label>
                  <Input 
                    id="edit-secondaryColor" 
                    name="secondaryColor" 
                    type="color" 
                    defaultValue={selectedInstitution.secondaryColor}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateInstitutionMutation.isPending}>
                  {updateInstitutionMutation.isPending ? 'Actualizando...' : 'Actualizar Institución'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar esta institución? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {institutionToDelete && (
            <div className="py-4">
              <p className="font-medium">{institutionToDelete.name}</p>
              <p className="text-sm text-muted-foreground">{institutionToDelete.email}</p>
              <p className="text-sm text-muted-foreground">{institutionToDelete.department}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteInstitutionMutation.isPending}>
              {deleteInstitutionMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminInstitutionsPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN"]}>
      <InstitutionsManagement />
    </RoleGuard>
  );
}

