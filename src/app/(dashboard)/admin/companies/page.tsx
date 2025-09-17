"use client";

import { useState, useEffect } from "react";
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
  EyeOff,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Globe,
  Briefcase,
  AlertCircle,
  CheckCircle
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

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  foundedYear?: string;
  general?: string;
}

interface CompanyFormData {
  name: string;
  email: string;
  password: string;
  description: string;
  taxId: string;
  legalRepresentative: string;
  businessSector: string;
  companySize: string;
  website: string;
  phone: string;
  address: string;
  foundedYear: string;
  institutionId: string;
  isActive: string;
}

// Validation utility functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateURL = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: "La contraseña debe tener al menos 8 caracteres" };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: "La contraseña debe contener al menos una letra minúscula" };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: "La contraseña debe contener al menos una letra mayúscula" };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: "La contraseña debe contener al menos un número" };
  }
  return { isValid: true, message: "" };
};

const validateTaxId = (taxId: string): boolean => {
  if (!taxId) return true; // Optional field
  // Basic NIT/RUC validation - should be numeric and reasonable length
  const taxIdRegex = /^[0-9]{7,15}$/;
  return taxIdRegex.test(taxId);
};

const validateFoundedYear = (year: string): { isValid: boolean; message: string } => {
  if (!year) return { isValid: true, message: "" }; // Optional field
  
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  
  if (isNaN(yearNum)) {
    return { isValid: false, message: "El año debe ser un número válido" };
  }
  
  if (yearNum < 1800) {
    return { isValid: false, message: "El año no puede ser anterior a 1800" };
  }
  
  if (yearNum > currentYear) {
    return { isValid: false, message: "El año no puede ser futuro" };
  }
  
  return { isValid: true, message: "" };
};

// Error display component
const ErrorMessage = ({ error }: { error?: string }) => {
  if (!error) return null;
  return (
    <div className="flex items-center space-x-1 text-sm text-red-600 mt-1">
      <AlertCircle className="h-3 w-3" />
      <span>{error}</span>
    </div>
  );
};

function CompaniesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
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

  // Fetch institutions for dropdown (only municipalities)
  const { data: institutions = [] } = useQuery({
    queryKey: ['admin-institutions-dropdown'],
    queryFn: async () => {
      const response = await fetch('/api/admin/institutions');
      if (!response.ok) throw new Error('Failed to fetch institutions');
      const allInstitutions = await response.json();
      // Filter to only show municipalities
      return allInstitutions.filter((institution: any) => institution.institutionType === 'MUNICIPALITY');
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create company');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setIsCreateDialogOpen(false);
      setCreateErrors({});
      toast.success('Empresa creada exitosamente');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Error al crear empresa';
      toast.error(errorMessage);
      
      // Handle specific validation errors
      if (error.message.includes('email already exists')) {
        setCreateErrors({ email: 'Este email ya está registrado' });
      } else if (error.message.includes('company with this name already exists')) {
        setCreateErrors({ name: 'Ya existe una empresa con este nombre en esta institución' });
      } else if (error.message.includes('required')) {
        setCreateErrors({ general: 'Faltan campos requeridos' });
      }
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      setEditErrors({});
      toast.success('Empresa actualizada exitosamente');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Error al actualizar empresa';
      toast.error(errorMessage);
      
      // Handle specific validation errors
      if (error.message.includes('email already exists')) {
        setEditErrors({ email: 'Este email ya está registrado' });
      } else if (error.message.includes('company with this name already exists')) {
        setEditErrors({ name: 'Ya existe una empresa con este nombre en esta institución' });
      } else if (error.message.includes('required')) {
        setEditErrors({ general: 'Faltan campos requeridos' });
      }
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

  // Validation functions
  const validateCreateForm = (formData: CompanyFormData): FormErrors => {
    const errors: FormErrors = {};

    // Required fields
    if (!formData.name?.trim()) {
      errors.name = "El nombre de la empresa es requerido";
    } else if (formData.name.length > 100) {
      errors.name = "El nombre no puede exceder 100 caracteres";
    }

    if (!formData.email?.trim()) {
      errors.email = "El email es requerido";
    } else if (!validateEmail(formData.email)) {
      errors.email = "El formato del email no es válido";
    }

    if (!formData.password?.trim()) {
      errors.password = "La contraseña es requerida";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }

    // Optional field validations
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = "El formato del teléfono no es válido";
    }

    if (formData.website && !validateURL(formData.website)) {
      errors.website = "El formato de la URL no es válido";
    }

    if (formData.taxId && !validateTaxId(formData.taxId)) {
      errors.taxId = "El NIT/RUC debe contener solo números (7-15 dígitos)";
    }

    if (formData.foundedYear) {
      const foundedYearValidation = validateFoundedYear(formData.foundedYear);
      if (!foundedYearValidation.isValid) {
        errors.foundedYear = foundedYearValidation.message;
      }
    }

    return errors;
  };

  const validateEditForm = (formData: CompanyFormData): FormErrors => {
    const errors: FormErrors = {};

    // Required fields
    if (!formData.name?.trim()) {
      errors.name = "El nombre de la empresa es requerido";
    } else if (formData.name.length > 100) {
      errors.name = "El nombre no puede exceder 100 caracteres";
    }

    if (!formData.email?.trim()) {
      errors.email = "El email es requerido";
    } else if (!validateEmail(formData.email)) {
      errors.email = "El formato del email no es válido";
    }

    // Optional field validations
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = "El formato del teléfono no es válido";
    }

    if (formData.website && !validateURL(formData.website)) {
      errors.website = "El formato de la URL no es válido";
    }

    if (formData.taxId && !validateTaxId(formData.taxId)) {
      errors.taxId = "El NIT/RUC debe contener solo números (7-15 dígitos)";
    }

    if (formData.foundedYear) {
      const foundedYearValidation = validateFoundedYear(formData.foundedYear);
      if (!foundedYearValidation.isValid) {
        errors.foundedYear = foundedYearValidation.message;
      }
    }

    return errors;
  };

  const handleCreateCompany = async (formData: FormData) => {
    setIsValidating(true);
    setCreateErrors({});

    const formDataObj: CompanyFormData = {
      name: formData.get('name') as string || '',
      email: formData.get('email') as string || '',
      password: formData.get('password') as string || '',
      description: formData.get('description') as string || '',
      taxId: formData.get('taxId') as string || '',
      legalRepresentative: formData.get('legalRepresentative') as string || '',
      businessSector: formData.get('businessSector') as string || '',
      companySize: formData.get('companySize') as string || '',
      website: formData.get('website') as string || '',
      phone: formData.get('phone') as string || '',
      address: formData.get('address') as string || '',
      foundedYear: formData.get('foundedYear') as string || '',
      institutionId: formData.get('institutionId') as string || '',
      isActive: 'true'
    };

    const errors = validateCreateForm(formDataObj);
    
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      setIsValidating(false);
      return;
    }

    const companyData = {
      name: formDataObj.name,
      email: formDataObj.email,
      password: formDataObj.password,
      description: formDataObj.description || undefined,
      taxId: formDataObj.taxId || undefined,
      legalRepresentative: formDataObj.legalRepresentative || undefined,
      businessSector: formDataObj.businessSector || undefined,
      companySize: formDataObj.companySize || undefined,
      website: formDataObj.website || undefined,
      phone: formDataObj.phone || undefined,
      address: formDataObj.address || undefined,
      foundedYear: formDataObj.foundedYear ? parseInt(formDataObj.foundedYear) : undefined,
      institutionId: formDataObj.institutionId && formDataObj.institutionId !== 'none' ? formDataObj.institutionId : undefined
    };

    createCompanyMutation.mutate(companyData);
    setIsValidating(false);
  };

  const handleUpdateCompany = async (formData: FormData) => {
    if (!selectedCompany) return;
    
    setIsValidating(true);
    setEditErrors({});

    const formDataObj: CompanyFormData = {
      name: formData.get('name') as string || '',
      email: formData.get('email') as string || '',
      password: '', // Not needed for edit
      description: formData.get('description') as string || '',
      taxId: formData.get('taxId') as string || '',
      legalRepresentative: formData.get('legalRepresentative') as string || '',
      businessSector: formData.get('businessSector') as string || '',
      companySize: formData.get('companySize') as string || '',
      website: formData.get('website') as string || '',
      phone: formData.get('phone') as string || '',
      address: formData.get('address') as string || '',
      foundedYear: formData.get('foundedYear') as string || '',
      institutionId: formData.get('institutionId') as string || '',
      isActive: formData.get('isActive') as string || 'true'
    };

    const errors = validateEditForm(formDataObj);
    
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      setIsValidating(false);
      return;
    }

    const companyData = {
      name: formDataObj.name,
      email: formDataObj.email,
      description: formDataObj.description || undefined,
      taxId: formDataObj.taxId || undefined,
      legalRepresentative: formDataObj.legalRepresentative || undefined,
      businessSector: formDataObj.businessSector || undefined,
      companySize: formDataObj.companySize || undefined,
      website: formDataObj.website || undefined,
      phone: formDataObj.phone || undefined,
      address: formDataObj.address || undefined,
      foundedYear: formDataObj.foundedYear ? parseInt(formDataObj.foundedYear) : undefined,
      institutionId: formDataObj.institutionId && formDataObj.institutionId !== 'none' ? formDataObj.institutionId : undefined,
      isActive: formDataObj.isActive === 'true'
    };

    updateCompanyMutation.mutate({ id: selectedCompany.id, companyData });
    setIsValidating(false);
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
    setEditErrors({});
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCreateErrors({});
    setIsCreateDialogOpen(true);
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
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setCreateErrors({});
        }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
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
              {createErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{createErrors.general}</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Empresa *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    maxLength={100}
                    className={createErrors.name ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={createErrors.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    maxLength={100}
                    className={createErrors.email ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={createErrors.email} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showCreatePassword ? "text" : "password"}
                    required 
                    minLength={8}
                    maxLength={100}
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
                    className={createErrors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                  >
                    {showCreatePassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <ErrorMessage error={createErrors.password} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input 
                  id="description" 
                  name="description" 
                  maxLength={500}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">NIT/RUC</Label>
                  <Input 
                    id="taxId" 
                    name="taxId" 
                    type="text"
                    maxLength={15}
                    pattern="^[0-9]{7,15}$"
                    placeholder="1234567890"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className={createErrors.taxId ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={createErrors.taxId} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalRepresentative">Representante Legal</Label>
                  <Input 
                    id="legalRepresentative" 
                    name="legalRepresentative" 
                    maxLength={100}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessSector">Sector de Negocio</Label>
                  <Input 
                    id="businessSector" 
                    name="businessSector" 
                    maxLength={100}
                  />
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
                  <Input 
                    id="website" 
                    name="website" 
                    type="url" 
                    maxLength={200}
                    className={createErrors.website ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={createErrors.website} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel"
                    maxLength={20}
                    pattern="^[\+]?[0-9\s\-\(\)]{7,15}$"
                    placeholder="+1234567890"
                    onKeyPress={(e) => {
                      if (!/[0-9\s\-\(\)\+]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className={createErrors.phone ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={createErrors.phone} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input 
                  id="address" 
                  name="address" 
                  maxLength={200}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Año de Fundación</Label>
                  <Input 
                    id="foundedYear" 
                    name="foundedYear" 
                    type="number" 
                    min="1800" 
                    max={new Date().getFullYear()}
                    step="1"
                    placeholder="2020"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className={createErrors.foundedYear ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={createErrors.foundedYear} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institutionId">Municipio Asociado</Label>
                  <Select name="institutionId">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar municipio (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin municipio</SelectItem>
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
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setCreateErrors({});
                }}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCompanyMutation.isPending || isValidating}
                >
                  {createCompanyMutation.isPending || isValidating ? 'Creando...' : 'Crear Empresa'}
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
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditErrors({});
          setSelectedCompany(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription>
              Modifica la información de la empresa
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <form action={handleUpdateCompany} className="space-y-4">
              {editErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{editErrors.general}</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre de la Empresa *</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={selectedCompany.name}
                    required 
                    maxLength={100}
                    className={editErrors.name ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={editErrors.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input 
                    id="edit-email" 
                    name="email" 
                    type="email" 
                    defaultValue={selectedCompany.email}
                    required
                    maxLength={100}
                    className={editErrors.email ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={editErrors.email} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Input 
                  id="edit-description" 
                  name="description" 
                  defaultValue={selectedCompany.description}
                  maxLength={500}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-taxId">NIT/RUC</Label>
                  <Input 
                    id="edit-taxId" 
                    name="taxId" 
                    defaultValue={selectedCompany.taxId}
                    maxLength={15}
                    className={editErrors.taxId ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={editErrors.taxId} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-legalRepresentative">Representante Legal</Label>
                  <Input 
                    id="edit-legalRepresentative" 
                    name="legalRepresentative" 
                    defaultValue={selectedCompany.legalRepresentative}
                    maxLength={100}
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
                    maxLength={100}
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
                    maxLength={200}
                    className={editErrors.website ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={editErrors.website} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input 
                    id="edit-phone" 
                    name="phone" 
                    defaultValue={selectedCompany.phone}
                    maxLength={20}
                    className={editErrors.phone ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={editErrors.phone} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Dirección</Label>
                <Input 
                  id="edit-address" 
                  name="address" 
                  defaultValue={selectedCompany.address}
                  maxLength={200}
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
                    className={editErrors.foundedYear ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={editErrors.foundedYear} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-institutionId">Institución Asociada</Label>
                  <Select name="institutionId" defaultValue={selectedCompany.institutionId || "none"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar municipio (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin municipio</SelectItem>
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
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditErrors({});
                }}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateCompanyMutation.isPending || isValidating}
                >
                  {updateCompanyMutation.isPending || isValidating ? 'Actualizando...' : 'Actualizar Empresa'}
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
