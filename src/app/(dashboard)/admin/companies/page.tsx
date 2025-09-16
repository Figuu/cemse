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
  Globe,
  Briefcase
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  description?: string;
  taxId?: string;
  legalRepresentative?: string;
  businessSector?: string;
  companySize?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  foundedYear?: number;
  logoUrl?: string;
  isActive: boolean;
  institutionId?: string;
  createdAt: string;
  updatedAt: string;
}

function CompaniesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const queryClient = useQueryClient();

  // Fetch companies
  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const response = await fetch('/api/admin/companies');
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    }
  });

  // Fetch institutions for dropdown
  const { data: institutions = [] } = useQuery({
    queryKey: ['admin-institutions-dropdown'],
    queryFn: async () => {
      const response = await fetch('/api/admin/institutions');
      if (!response.ok) throw new Error('Failed to fetch institutions');
      return response.json();
    }
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: any) => {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      });
      if (!response.ok) throw new Error('Failed to create company');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setIsCreateDialogOpen(false);
      toast.success('Empresa creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear empresa: ' + error.message);
    }
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, companyData }: { id: string; companyData: any }) => {
      const response = await fetch(`/api/admin/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      });
      if (!response.ok) throw new Error('Failed to update company');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      toast.success('Empresa actualizada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar empresa: ' + error.message);
    }
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/companies/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete company');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
      toast.success('Empresa eliminada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar empresa: ' + error.message);
    }
  });

  const filteredCompanies = companies.filter((company: Company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.businessSector?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCompany = (formData: FormData) => {
    const companyData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      taxId: formData.get('taxId') as string,
      legalRepresentative: formData.get('legalRepresentative') as string,
      businessSector: formData.get('businessSector') as string,
      companySize: formData.get('companySize') as string,
      website: formData.get('website') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      foundedYear: formData.get('foundedYear') ? parseInt(formData.get('foundedYear') as string) : undefined,
      institutionId: formData.get('institutionId') as string || undefined,
      password: formData.get('password') as string
    };
    createCompanyMutation.mutate(companyData);
  };

  const handleUpdateCompany = (formData: FormData) => {
    if (!selectedCompany) return;
    const companyData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      taxId: formData.get('taxId') as string,
      legalRepresentative: formData.get('legalRepresentative') as string,
      businessSector: formData.get('businessSector') as string,
      companySize: formData.get('companySize') as string,
      website: formData.get('website') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      foundedYear: formData.get('foundedYear') ? parseInt(formData.get('foundedYear') as string) : undefined,
      institutionId: formData.get('institutionId') as string || undefined,
      isActive: formData.get('isActive') === 'true'
    };
    updateCompanyMutation.mutate({ id: selectedCompany.id, companyData });
  };

  const handleDeleteCompany = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (companyToDelete) {
      deleteCompanyMutation.mutate(companyToDelete.id);
    }
  };

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCompanySizeText = (size?: string) => {
    switch (size) {
      case 'MICRO':
        return 'Micro';
      case 'SMALL':
        return 'Pequeña';
      case 'MEDIUM':
        return 'Mediana';
      case 'LARGE':
        return 'Grande';
      default:
        return size || 'No especificado';
    }
  };

  const getCompanySizeColor = (size?: string) => {
    switch (size) {
      case 'MICRO':
        return 'bg-blue-100 text-blue-800';
      case 'SMALL':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LARGE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Empresas</h1>
            <p className="text-muted-foreground">Administra las empresas del sistema</p>
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
            <h1 className="text-2xl font-bold">Gestión de Empresas</h1>
            <p className="text-muted-foreground">Administra las empresas del sistema</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Error al cargar las empresas: {(error as Error).message}</p>
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
          <h1 className="text-2xl font-bold">Gestión de Empresas</h1>
          <p className="text-muted-foreground">Administra las empresas del sistema</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Empresa</DialogTitle>
              <DialogDescription>
                Crea una nueva empresa con credenciales básicas
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Empresa *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" name="description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">NIT/RUC</Label>
                  <Input id="taxId" name="taxId" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalRepresentative">Representante Legal</Label>
                  <Input id="legalRepresentative" name="legalRepresentative" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessSector">Sector de Negocio</Label>
                  <Input id="businessSector" name="businessSector" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Tamaño de Empresa</Label>
                  <Select name="companySize">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MICRO">Micro</SelectItem>
                      <SelectItem value="SMALL">Pequeña</SelectItem>
                      <SelectItem value="MEDIUM">Mediana</SelectItem>
                      <SelectItem value="LARGE">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input id="website" name="website" type="url" />
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
                  <Label htmlFor="foundedYear">Año de Fundación</Label>
                  <Input id="foundedYear" name="foundedYear" type="number" min="1800" max={new Date().getFullYear()} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institutionId">Institución Asociada</Label>
                  <Select name="institutionId">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar institución (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin institución</SelectItem>
                      {institutions.map((institution: any) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createCompanyMutation.isPending}>
                  {createCompanyMutation.isPending ? 'Creando...' : 'Crear Empresa'}
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
            placeholder="Buscar por nombre, email o sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Companies List */}
      <div className="space-y-4">
        {filteredCompanies.map((company: Company) => (
          <Card key={company.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{company.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {company.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{company.email}</span>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                      {company.address && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-32">{company.address}</span>
                        </div>
                      )}
                      {company.website && (
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span className="truncate max-w-32">{company.website}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={company.isActive ? "default" : "secondary"}>
                        {company.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      {company.companySize && (
                        <Badge className={getCompanySizeColor(company.companySize)}>
                          {getCompanySizeText(company.companySize)}
                        </Badge>
                      )}
                      {company.businessSector && (
                        <Badge variant="outline">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {company.businessSector}
                        </Badge>
                      )}
                      {company.foundedYear && (
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {company.foundedYear}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Registrado: {formatDate(company.createdAt)}</span>
                  </div>
                  {company.legalRepresentative && (
                    <p className="text-xs mt-1">Rep. Legal: {company.legalRepresentative}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(company)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteCompany(company)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron empresas</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'No hay empresas que coincidan con tu búsqueda.' : 'No hay empresas registradas.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription>
              Modifica la información de la empresa
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <form action={handleUpdateCompany} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre de la Empresa *</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={selectedCompany.name}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email" 
                    name="email" 
                    type="email" 
                    defaultValue={selectedCompany.email}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Input 
                  id="edit-description" 
                  name="description" 
                  defaultValue={selectedCompany.description}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-taxId">NIT/RUC</Label>
                  <Input 
                    id="edit-taxId" 
                    name="taxId" 
                    defaultValue={selectedCompany.taxId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-legalRepresentative">Representante Legal</Label>
                  <Input 
                    id="edit-legalRepresentative" 
                    name="legalRepresentative" 
                    defaultValue={selectedCompany.legalRepresentative}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-businessSector">Sector de Negocio</Label>
                  <Input 
                    id="edit-businessSector" 
                    name="businessSector" 
                    defaultValue={selectedCompany.businessSector}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-companySize">Tamaño de Empresa</Label>
                  <Select name="companySize" defaultValue={selectedCompany.companySize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MICRO">Micro</SelectItem>
                      <SelectItem value="SMALL">Pequeña</SelectItem>
                      <SelectItem value="MEDIUM">Mediana</SelectItem>
                      <SelectItem value="LARGE">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-website">Sitio Web</Label>
                  <Input 
                    id="edit-website" 
                    name="website" 
                    type="url" 
                    defaultValue={selectedCompany.website}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input 
                    id="edit-phone" 
                    name="phone" 
                    defaultValue={selectedCompany.phone}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Dirección</Label>
                <Input 
                  id="edit-address" 
                  name="address" 
                  defaultValue={selectedCompany.address}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-foundedYear">Año de Fundación</Label>
                  <Input 
                    id="edit-foundedYear" 
                    name="foundedYear" 
                    type="number" 
                    min="1800" 
                    max={new Date().getFullYear()}
                    defaultValue={selectedCompany.foundedYear}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-institutionId">Institución Asociada</Label>
                  <Select name="institutionId" defaultValue={selectedCompany.institutionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar institución (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin institución</SelectItem>
                      {institutions.map((institution: any) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-isActive">Estado</Label>
                <Select name="isActive" defaultValue={selectedCompany.isActive.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateCompanyMutation.isPending}>
                  {updateCompanyMutation.isPending ? 'Actualizando...' : 'Actualizar Empresa'}
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
              ¿Estás seguro de que quieres eliminar esta empresa? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {companyToDelete && (
            <div className="py-4">
              <p className="font-medium">{companyToDelete.name}</p>
              <p className="text-sm text-muted-foreground">{companyToDelete.email}</p>
              <p className="text-sm text-muted-foreground">{companyToDelete.businessSector}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteCompanyMutation.isPending}>
              {deleteCompanyMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminCompaniesPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN"]}>
      <CompaniesManagement />
    </RoleGuard>
  );
}
