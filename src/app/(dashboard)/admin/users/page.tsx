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
  UserCog,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface YouthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    birthDate?: string;
    gender?: string;
    educationLevel?: string;
  };
}

function YouthUsersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<YouthUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<YouthUser | null>(null);
  const queryClient = useQueryClient();

  // Fetch youth users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-youth-users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users?role=YOUTH');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-youth-users'] });
      setIsCreateDialogOpen(false);
      toast.success('Usuario creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear usuario: ' + error.message);
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: any }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-youth-users'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar usuario: ' + error.message);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-youth-users'] });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar usuario: ' + error.message);
    }
  });

  const filteredUsers = users.filter((user: YouthUser) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = (formData: FormData) => {
    const userData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      birthDate: formData.get('birthDate') as string,
      gender: formData.get('gender') as string,
      educationLevel: formData.get('educationLevel') as string,
      role: 'YOUTH'
    };
    createUserMutation.mutate(userData);
  };

  const handleUpdateUser = (formData: FormData) => {
    if (!selectedUser) return;
    const userData = {
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      birthDate: formData.get('birthDate') as string,
      gender: formData.get('gender') as string,
      educationLevel: formData.get('educationLevel') as string,
      isActive: formData.get('isActive') === 'true'
    };
    updateUserMutation.mutate({ id: selectedUser.id, userData });
  };

  const handleDeleteUser = (user: YouthUser) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const openEditDialog = (user: YouthUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Jóvenes</h1>
            <p className="text-muted-foreground">Administra los usuarios jóvenes del sistema</p>
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
            <h1 className="text-2xl font-bold">Gestión de Jóvenes</h1>
            <p className="text-muted-foreground">Administra los usuarios jóvenes del sistema</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Error al cargar los usuarios: {(error as Error).message}</p>
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
          <h1 className="text-2xl font-bold">Gestión de Jóvenes</h1>
          <p className="text-muted-foreground">Administra los usuarios jóvenes del sistema</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario Joven</DialogTitle>
              <DialogDescription>
                Crea un nuevo usuario joven con credenciales básicas
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" name="firstName" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" name="lastName" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                  <Select name="gender">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" name="address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input id="city" name="city" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado/Departamento</Label>
                  <Input id="state" name="state" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input id="birthDate" name="birthDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Nivel Educativo</Label>
                  <Select name="educationLevel">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIMARY">Primaria</SelectItem>
                      <SelectItem value="SECONDARY">Secundaria</SelectItem>
                      <SelectItem value="TECHNICAL">Técnico</SelectItem>
                      <SelectItem value="UNIVERSITY">Universitario</SelectItem>
                      <SelectItem value="POSTGRADUATE">Postgrado</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? 'Creando...' : 'Crear Usuario'}
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
            placeholder="Buscar por email, nombre o apellido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user: YouthUser) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCog className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {user.profile?.firstName || user.firstName} {user.profile?.lastName || user.lastName}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                      {user.profile?.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{user.profile.phone}</span>
                        </div>
                      )}
                      {user.profile?.city && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{user.profile.city}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline">
                        Joven
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Registrado: {formatDate(user.createdAt)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'No hay usuarios que coincidan con tu búsqueda.' : 'No hay usuarios jóvenes registrados.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form action={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input 
                    id="edit-email" 
                    name="email" 
                    type="email" 
                    defaultValue={selectedUser.email}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-isActive">Estado</Label>
                  <Select name="isActive" defaultValue={selectedUser.isActive.toString()}>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">Nombre</Label>
                  <Input 
                    id="edit-firstName" 
                    name="firstName" 
                    defaultValue={selectedUser.profile?.firstName || selectedUser.firstName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Apellido</Label>
                  <Input 
                    id="edit-lastName" 
                    name="lastName" 
                    defaultValue={selectedUser.profile?.lastName || selectedUser.lastName}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input 
                    id="edit-phone" 
                    name="phone" 
                    defaultValue={selectedUser.profile?.phone || selectedUser.phone}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Género</Label>
                  <Select name="gender" defaultValue={selectedUser.profile?.gender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Dirección</Label>
                <Input 
                  id="edit-address" 
                  name="address" 
                  defaultValue={selectedUser.profile?.address || selectedUser.address}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Ciudad</Label>
                  <Input 
                    id="edit-city" 
                    name="city" 
                    defaultValue={selectedUser.profile?.city}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">Estado/Departamento</Label>
                  <Input 
                    id="edit-state" 
                    name="state" 
                    defaultValue={selectedUser.profile?.state}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-birthDate">Fecha de Nacimiento</Label>
                  <Input 
                    id="edit-birthDate" 
                    name="birthDate" 
                    type="date" 
                    defaultValue={selectedUser.profile?.birthDate ? selectedUser.profile.birthDate.split('T')[0] : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-educationLevel">Nivel Educativo</Label>
                  <Select name="educationLevel" defaultValue={selectedUser.profile?.educationLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIMARY">Primaria</SelectItem>
                      <SelectItem value="SECONDARY">Secundaria</SelectItem>
                      <SelectItem value="TECHNICAL">Técnico</SelectItem>
                      <SelectItem value="UNIVERSITY">Universitario</SelectItem>
                      <SelectItem value="POSTGRADUATE">Postgrado</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? 'Actualizando...' : 'Actualizar Usuario'}
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
              ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="py-4">
              <p className="font-medium">{userToDelete.email}</p>
              <p className="text-sm text-muted-foreground">
                {userToDelete.profile?.firstName || userToDelete.firstName} {userToDelete.profile?.lastName || userToDelete.lastName}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteUserMutation.isPending}>
              {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN"]}>
      <YouthUsersManagement />
    </RoleGuard>
  );
}

