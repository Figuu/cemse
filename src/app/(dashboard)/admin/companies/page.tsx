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
  CheckCircle,
  RefreshCw,
  Copy,
  Check,
  Filter,
  X
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
  institution?: {
    id: string;
    name: string;
    department: string;
    region?: string;
    institutionType: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Municipality {
  id: string;
  name: string;
  department: string;
  region?: string;
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

interface PasswordRequirements {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
}

interface CreatedCompany {
  name: string;
  email: string;
  password: string;
}

// Validation utility functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateURL = (url: string): boolean => {
  if (!url) return true; // Optional field
  // Allow relative URLs (starting with /) or absolute URLs (starting with http/https)
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
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

// Password requirements checking
const checkPasswordRequirements = (password: string): PasswordRequirements => {
  return {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password)
  };
};

// Generate secure password
const generateSecurePassword = (): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  const allChars = lowercase + uppercase + numbers + symbols;
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Password requirements component
const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = checkPasswordRequirements(password);
  
  if (!password) return null;
  
  return (
    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
      <p className="text-xs font-medium text-gray-700 mb-2">Requisitos de contraseña:</p>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          {requirements.minLength ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : (
            <AlertCircle className="h-3 w-3 text-gray-400" />
          )}
          <span className={`text-xs ${requirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
            Mínimo 8 caracteres
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {requirements.hasLowercase ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : (
            <AlertCircle className="h-3 w-3 text-gray-400" />
          )}
          <span className={`text-xs ${requirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
            Al menos una letra minúscula
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {requirements.hasUppercase ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : (
            <AlertCircle className="h-3 w-3 text-gray-400" />
          )}
          <span className={`text-xs ${requirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
            Al menos una letra mayúscula
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {requirements.hasNumber ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : (
            <AlertCircle className="h-3 w-3 text-gray-400" />
          )}
          <span className={`text-xs ${requirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
            Al menos un número
          </span>
        </div>
      </div>
    </div>
  );
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
  const [createPassword, setCreatePassword] = useState("");
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [createdCompany, setCreatedCompany] = useState<CreatedCompany | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [municipalityFilter, setMunicipalityFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setIsCreateDialogOpen(false);
      setCreateErrors({});
      
      // Show credentials modal
      setCreatedCompany({
        name: data.company.name,
        email: data.company.email,
        password: createPassword
      });
      setIsCredentialsModalOpen(true);
      
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

  // Fetch municipality institutions for the filter
  const { data: municipalityInstitutions = [] } = useQuery({
    queryKey: ['municipality-institutions-companies-filter'],
    queryFn: async () => {
      const response = await fetch('/api/admin/institutions');
      if (!response.ok) throw new Error('Failed to fetch institutions');
      const institutions = await response.json();
      // Filter only municipality type institutions
      return institutions.filter((institution: any) => institution.institutionType === 'MUNICIPALITY');
    }
  });

  const filteredCompanies = companies.filter((company: Company) => {
    // Search filter
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.businessSector?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && company.isActive) ||
      (statusFilter === "inactive" && !company.isActive);

    // Size filter
    const matchesSize = sizeFilter === "all" || company.companySize === sizeFilter;

    // Municipality filter (based on associated institution)
    const matchesMunicipality = municipalityFilter === "all" || 
      (company.institution?.name === municipalityFilter);

    return matchesSearch && matchesStatus && matchesSize && matchesMunicipality;
  });

  // Helper function to get associated municipality
  const getAssociatedMunicipality = (company: Company): Municipality | null => {
    if (!company.institution) {
      return null;
    }
    
    // If the institution is a municipality, return it
    if (company.institution.institutionType === 'MUNICIPALITY') {
      return {
        id: company.institution.id,
        name: company.institution.name,
        department: company.institution.department,
        region: company.institution.region
      };
    }
    
    return null;
  };

  // Validation functions
  const validateCreateForm = (formData: CompanyFormData, institutionId?: string): FormErrors => {
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

    // Municipality association validation
    if (!institutionId || institutionId === 'none') {
      errors.general = "El municipio asociado es requerido";
    }

    return errors;
  };

  const validateEditForm = (formData: CompanyFormData, institutionId?: string): FormErrors => {
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

    // Municipality association validation
    if (!institutionId || institutionId === 'none') {
      errors.general = "El municipio asociado es requerido";
    }

    return errors;
  };

  const handleCreateCompany = async (formData: FormData) => {
    setIsValidating(true);
    setCreateErrors({});

    const formDataObj: CompanyFormData = {
      name: formData.get('name') as string || '',
      email: formData.get('email') as string || '',
      password: createPassword,
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

    const institutionId = formData.get('institutionId') as string;
    const errors = validateCreateForm(formDataObj, institutionId);
    
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
      institutionId: institutionId && institutionId !== 'none' ? institutionId : undefined
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

    const institutionId = formData.get('institutionId') as string;
    const errors = validateEditForm(formDataObj, institutionId);
    
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
      institutionId: institutionId && institutionId !== 'none' ? institutionId : undefined,
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
    setCreatePassword("");
    setIsCreateDialogOpen(true);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const generatePassword = () => {
    const newPassword = generateSecurePassword();
    setCreatePassword(newPassword);
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
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Gestión de Empresas</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Administra las empresas del sistema</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setCreateErrors({});
        }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nueva Empresa</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Crear Nueva Empresa</DialogTitle>
              <DialogDescription className="text-sm">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Nombre de la Empresa *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    maxLength={100}
                    className={`text-sm ${createErrors.name ? "border-red-500" : ""}`}
                  />
                  <ErrorMessage error={createErrors.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    maxLength={100}
                    className={`text-sm ${createErrors.email ? "border-red-500" : ""}`}
                  />
                  <ErrorMessage error={createErrors.email} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Contraseña *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generatePassword}
                    className="h-7 px-2 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Generar
                  </Button>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showCreatePassword ? "text" : "password"}
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    required 
                    minLength={8}
                    maxLength={100}
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
                    className={`text-sm ${createErrors.password ? "border-red-500 pr-20" : "pr-20"}`}
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-full px-2 hover:bg-transparent"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                    >
                      {showCreatePassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <PasswordRequirements password={createPassword} />
                <ErrorMessage error={createErrors.password} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Descripción</Label>
                <Input 
                  id="description" 
                  name="description" 
                  maxLength={500}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId" className="text-sm">NIT/RUC</Label>
                  <Input 
                    id="taxId" 
                    name="taxId" 
                    type="text"
                    maxLength={15}
                    pattern="^[0-9]{7,15}$"
                    placeholder="1234567890"
                    className={`text-sm ${createErrors.taxId ? "border-red-500" : ""}`}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <ErrorMessage error={createErrors.taxId} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalRepresentative" className="text-sm">Representante Legal</Label>
                  <Input 
                    id="legalRepresentative" 
                    name="legalRepresentative" 
                    maxLength={100}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessSector" className="text-sm">Sector de Negocio</Label>
                  <Input 
                    id="businessSector" 
                    name="businessSector" 
                    maxLength={100}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize" className="text-sm">Tamaño de Empresa</Label>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm">Sitio Web</Label>
                  <Input 
                    id="website" 
                    name="website" 
                    maxLength={200}
                    className={`text-sm ${createErrors.website ? "border-red-500" : ""}`}
                  />
                  <ErrorMessage error={createErrors.website} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">Teléfono</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    maxLength={20}
                    className={`text-sm ${createErrors.phone ? "border-red-500" : ""}`}
                    pattern="^[\+]?[0-9\s\-\(\)]{7,15}$"
                    placeholder="+1234567890"
                    onKeyPress={(e) => {
                      if (!/[0-9\s\-\(\)\+]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <ErrorMessage error={createErrors.phone} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">Dirección</Label>
                <Input 
                  id="address" 
                  name="address" 
                  maxLength={200}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foundedYear" className="text-sm">Año de Fundación</Label>
                  <Input 
                    id="foundedYear" 
                    name="foundedYear" 
                    type="number" 
                    min="1800" 
                    max={new Date().getFullYear()}
                    className={`text-sm ${createErrors.foundedYear ? "border-red-500" : ""}`}
                    step="1"
                    placeholder="2020"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <ErrorMessage error={createErrors.foundedYear} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institutionId" className="text-sm">Municipio Asociado *</Label>
                  <Select name="institutionId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((institution: any) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecciona el municipio donde se encuentra esta empresa. Esto establecerá la región y departamento.
                  </p>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setCreateErrors({});
                  }}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCompanyMutation.isPending || isValidating}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  {createCompanyMutation.isPending || isValidating ? 'Creando...' : 'Crear Empresa'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 px-3"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Filtros</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setSizeFilter("all");
                  setMunicipalityFilter("all");
                }}
                className="h-8 px-2 text-xs"
              >
                Limpiar
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="inactive">Inactivas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tamaño</Label>
                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Seleccionar tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="MICRO">Micro (1-10 empleados)</SelectItem>
                    <SelectItem value="PEQUENA">Pequeña (11-50 empleados)</SelectItem>
                    <SelectItem value="MEDIANA">Mediana (51-200 empleados)</SelectItem>
                    <SelectItem value="GRANDE">Grande (200+ empleados)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Municipio</Label>
                <Select value={municipalityFilter} onValueChange={setMunicipalityFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Seleccionar municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {municipalityInstitutions.map((institution: any) => (
                      <SelectItem key={institution.id} value={institution.name}>
                        {institution.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Companies List */}
      <div className="space-y-4">
        {filteredCompanies.map((company: Company) => (
          <Card key={company.id}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base truncate">{company.name}</h4>
                    <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 text-xs sm:text-sm text-muted-foreground">
                      {company.email && (
                        <div className="flex items-center space-x-1 min-w-0">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{company.email}</span>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center space-x-1 min-w-0">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{company.phone}</span>
                        </div>
                      )}
                      {company.address && (
                        <div className="flex items-center space-x-1 min-w-0">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{company.address}</span>
                        </div>
                      )}
                      {company.website && (
                        <div className="flex items-center space-x-1 min-w-0">
                          <Globe className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{company.website}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant={company.isActive ? "default" : "secondary"} className="text-xs">
                        {company.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      {company.companySize && (
                        <Badge className={`text-xs ${getCompanySizeColor(company.companySize)}`}>
                          {getCompanySizeText(company.companySize)}
                        </Badge>
                      )}
                      {company.businessSector && (
                        <Badge variant="outline" className="text-xs">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {company.businessSector}
                        </Badge>
                      )}
                      {company.foundedYear && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {company.foundedYear}
                        </Badge>
                      )}
                      {getAssociatedMunicipality(company) && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {getAssociatedMunicipality(company)?.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Desktop layout */}
                <div className="hidden sm:flex sm:items-center sm:space-x-4">
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

                {/* Mobile layout */}
                <div className="flex sm:hidden flex-col space-y-3">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Registrado: {formatDate(company.createdAt)}</span>
                  </div>
                  {company.legalRepresentative && (
                    <p className="text-xs text-muted-foreground">Rep. Legal: {company.legalRepresentative}</p>
                  )}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(company)} className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteCompany(company)} className="flex-1">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
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
            <DialogTitle className="text-lg sm:text-xl">Editar Empresa</DialogTitle>
            <DialogDescription className="text-sm">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm">Nombre de la Empresa *</Label>
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
                  <Label htmlFor="edit-email" className="text-sm">Email *</Label>
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
                <Label htmlFor="edit-description" className="text-sm">Descripción</Label>
                <Input 
                  id="edit-description" 
                  name="description" 
                  defaultValue={selectedCompany.description}
                  maxLength={500}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-taxId" className="text-sm">NIT/RUC</Label>
                  <Input 
                    id="edit-taxId" 
                    name="taxId" 
                    defaultValue={selectedCompany.taxId}
                    maxLength={15}
                    className={`text-sm ${editErrors.taxId ? "border-red-500" : ""}`}
                  />
                  <ErrorMessage error={editErrors.taxId} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-legalRepresentative" className="text-sm">Representante Legal</Label>
                  <Input 
                    id="edit-legalRepresentative" 
                    name="legalRepresentative" 
                    defaultValue={selectedCompany.legalRepresentative}
                    maxLength={100}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-businessSector" className="text-sm">Sector de Negocio</Label>
                  <Input 
                    id="edit-businessSector" 
                    name="businessSector" 
                    defaultValue={selectedCompany.businessSector}
                    maxLength={100}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-companySize" className="text-sm">Tamaño de Empresa</Label>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-website" className="text-sm">Sitio Web</Label>
                  <Input 
                    id="edit-website" 
                    name="website" 
                    defaultValue={selectedCompany.website}
                    maxLength={200}
                    className={`text-sm ${editErrors.website ? "border-red-500" : ""}`}
                  />
                  <ErrorMessage error={editErrors.website} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-sm">Teléfono</Label>
                  <Input 
                    id="edit-phone" 
                    name="phone" 
                    defaultValue={selectedCompany.phone}
                    maxLength={20}
                    className={`text-sm ${editErrors.phone ? "border-red-500" : ""}`}
                  />
                  <ErrorMessage error={editErrors.phone} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address" className="text-sm">Dirección</Label>
                <Input 
                  id="edit-address" 
                  name="address" 
                  defaultValue={selectedCompany.address}
                  maxLength={200}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-foundedYear" className="text-sm">Año de Fundación</Label>
                  <Input 
                    id="edit-foundedYear" 
                    name="foundedYear" 
                    type="number" 
                    min="1800" 
                    max={new Date().getFullYear()}
                    defaultValue={selectedCompany.foundedYear}
                    className={`text-sm ${editErrors.foundedYear ? "border-red-500" : ""}`}
                  />
                  <ErrorMessage error={editErrors.foundedYear} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-institutionId" className="text-sm">Municipio Asociado *</Label>
                  <Select name="institutionId" defaultValue={selectedCompany.institutionId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((institution: any) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecciona el municipio donde se encuentra esta empresa. Esto establecerá la región y departamento.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-isActive" className="text-sm">Estado</Label>
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
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditErrors({});
                  }}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateCompanyMutation.isPending || isValidating}
                  className="w-full sm:w-auto order-1 sm:order-2"
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

      {/* Credentials Confirmation Modal */}
      <Dialog open={isCredentialsModalOpen} onOpenChange={setIsCredentialsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Empresa Creada</span>
            </DialogTitle>
            <DialogDescription className="text-sm">
              La empresa ha sido creada exitosamente. Guarda estas credenciales de forma segura.
            </DialogDescription>
          </DialogHeader>
          {createdCompany && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">{createdCompany.name}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-green-600 font-medium">Email:</p>
                      <p className="text-sm text-green-800 font-mono break-all">{createdCompany.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdCompany.email, 'email')}
                      className="ml-2 h-8 w-8 p-0"
                    >
                      {copiedField === 'email' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-green-600 font-medium">Contraseña:</p>
                      <p className="text-sm text-green-800 font-mono break-all">{createdCompany.password}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdCompany.password, 'password')}
                      className="ml-2 h-8 w-8 p-0"
                    >
                      {copiedField === 'password' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium mb-1">Importante:</p>
                    <p>Guarda estas credenciales en un lugar seguro. No podrás ver la contraseña nuevamente.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                setIsCredentialsModalOpen(false);
                setCreatedCompany(null);
                setCopiedField(null);
              }}
              className="w-full sm:w-auto"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminCompaniesPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN", "INSTITUTION"]}>
      <CompaniesManagement />
    </RoleGuard>
  );
}
