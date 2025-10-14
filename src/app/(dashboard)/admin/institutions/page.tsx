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
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Copy,
  Check,
  Filter,
  X,
  Clock
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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
  department?: string;
  population?: string;
  mayorEmail?: string;
  mayorPhone?: string;
  customType?: string;
  general?: string;
}

interface PasswordRequirements {
  length: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
}

interface CreatedInstitution {
  id: string;
  email: string;
  password: string;
  name: string;
}

interface InstitutionFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  website: string;
  department: string;
  region: string;
  population: string;
  mayorName: string;
  mayorEmail: string;
  mayorPhone: string;
  institutionType: string;
  customType: string;
  primaryColor: string;
  secondaryColor: string;
  isActive: string;
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

const checkPasswordRequirements = (password: string): PasswordRequirements => {
  return {
    length: password.length >= 8,
    lowercase: /(?=.*[a-z])/.test(password),
    uppercase: /(?=.*[A-Z])/.test(password),
    number: /(?=.*\d)/.test(password)
  };
};

const generateSecurePassword = (): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let password = '';
  
  // Ensure at least one character from each required type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest with random characters
  const allChars = lowercase + uppercase + numbers + symbols;
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

const validatePopulation = (population: string): boolean => {
  if (!population) return true; // Optional field
  const num = parseInt(population);
  return !isNaN(num) && num > 0;
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

// Password requirements component
const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = checkPasswordRequirements(password);
  
  if (!password) return null;
  
  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-md">
      <p className="text-xs font-medium text-gray-700 mb-2">Requisitos de contraseña:</p>
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs">
          {requirements.length ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : (
            <AlertCircle className="h-3 w-3 text-gray-400" />
          )}
          <span className={requirements.length ? "text-green-600" : "text-gray-500"}>
            Al menos 8 caracteres
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          {requirements.lowercase ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : (
            <AlertCircle className="h-3 w-3 text-gray-400" />
          )}
          <span className={requirements.lowercase ? "text-green-600" : "text-gray-500"}>
            Una letra minúscula
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          {requirements.uppercase ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : (
            <AlertCircle className="h-3 w-3 text-gray-400" />
          )}
          <span className={requirements.uppercase ? "text-green-600" : "text-gray-500"}>
            Una letra mayúscula
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          {requirements.number ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : (
            <AlertCircle className="h-3 w-3 text-gray-400" />
          )}
          <span className={requirements.number ? "text-green-600" : "text-gray-500"}>
            Un número
          </span>
        </div>
      </div>
    </div>
  );
};

function InstitutionsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [institutionToDelete, setInstitutionToDelete] = useState<Institution | null>(null);
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createPassword, setCreatePassword] = useState("");
  const [createInstitutionType, setCreateInstitutionType] = useState("");
  const [editInstitutionType, setEditInstitutionType] = useState("");
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [createdInstitution, setCreatedInstitution] = useState<CreatedInstitution | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [municipalityFilter, setMunicipalityFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // Check if current user is a municipality user
  const isMunicipalityUser = session?.user?.role === "INSTITUTION" && session?.user?.institutionType === "MUNICIPALITY";

  // Fetch institutions
  const { data: institutions = [], isLoading, error } = useQuery({
    queryKey: ['admin-institutions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/institutions');
      if (!response.ok) throw new Error('Failed to fetch institutions');
      return response.json();
    }
  });

  // Fetch municipalities for association
  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-for-association'],
    queryFn: async () => {
      const response = await fetch('/api/institutions?type=MUNICIPALITY');
      if (!response.ok) throw new Error('Failed to fetch municipalities');
      const data = await response.json();
      return data.institutions || [];
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create institution');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
      setIsCreateDialogOpen(false);
      setCreateErrors({});
      setCreatePassword("");
      
      // Show credentials modal with the created institution data
      if (data.institution) {
        setCreatedInstitution({
          id: data.institution.id,
          email: data.institution.email,
          password: data.institution.password || createPassword,
          name: data.institution.name
        });
        setIsCredentialsModalOpen(true);
      }
      
      toast.success('Institución creada exitosamente');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Error al crear institución';
      toast.error(errorMessage);
      
      // Handle specific validation errors
      if (error.message.includes('email already exists')) {
        setCreateErrors({ email: 'Este email ya está registrado' });
      } else if (error.message.includes('required')) {
        setCreateErrors({ general: 'Faltan campos requeridos' });
      }
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update institution');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
      setIsEditDialogOpen(false);
      setSelectedInstitution(null);
      setEditErrors({});
      toast.success('Institución actualizada exitosamente');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Error al actualizar institución';
      toast.error(errorMessage);
      
      // Handle specific validation errors
      if (error.message.includes('email already exists')) {
        setEditErrors({ email: 'Este email ya está registrado' });
      } else if (error.message.includes('required')) {
        setEditErrors({ general: 'Faltan campos requeridos' });
      }
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

  // Fetch municipality institutions for the filter
  const { data: municipalityInstitutions = [] } = useQuery({
    queryKey: ['municipality-institutions-for-filter'],
    queryFn: async () => {
      // Filter only municipality type institutions from the current institutions data
      return institutions.filter((institution: Institution) => institution.institutionType === 'MUNICIPALITY');
    },
    enabled: institutions.length > 0
  });

  const filteredInstitutions = institutions.filter((institution: Institution) => {
    // Search filter
    const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.department.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && institution.isActive) ||
      (statusFilter === "inactive" && !institution.isActive);

    // Type filter
    const matchesType = typeFilter === "all" || institution.institutionType === typeFilter;

    // Municipality filter
    const matchesMunicipality = municipalityFilter === "all" || institution.name === municipalityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesMunicipality;
  });

  // Helper function to get associated municipality
  const getAssociatedMunicipality = (institution: Institution): Municipality | null => {
    if (institution.institutionType === 'MUNICIPALITY') {
      return null; // It's a municipality itself
    }
    
    // Find municipality with same department
    const municipality = municipalities.find((municipality: Municipality) => 
      municipality.department === institution.department
    );
    
    return municipality || null;
  };

  // Validation functions
  const validateCreateForm = (formData: InstitutionFormData, associatedMunicipality?: string): FormErrors => {
    const errors: FormErrors = {};

    // Required fields
    if (!formData.name?.trim()) {
      errors.name = "El nombre de la institución es requerido";
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

    if (!formData.department?.trim()) {
      errors.department = "El departamento es requerido";
    } else if (formData.department.length > 50) {
      errors.department = "El departamento no puede exceder 50 caracteres";
    }

    if (!formData.institutionType) {
      errors.general = "El tipo de institución es requerido";
    }

    // Optional field validations
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = "El formato del teléfono no es válido";
    }

    if (formData.website && !validateURL(formData.website)) {
      errors.website = "El formato de la URL no es válido";
    }

    if (formData.mayorEmail && !validateEmail(formData.mayorEmail)) {
      errors.mayorEmail = "El formato del email del alcalde no es válido";
    }

    if (formData.mayorPhone && !validatePhone(formData.mayorPhone)) {
      errors.mayorPhone = "El formato del teléfono del alcalde no es válido";
    }

    if (formData.population && !validatePopulation(formData.population)) {
      errors.population = "La población debe ser un número positivo";
    }

    // Conditional validation
    if (formData.institutionType === "OTHER" && !formData.customType?.trim()) {
      errors.customType = "El tipo personalizado es requerido cuando se selecciona 'Otro'";
    }

    // Municipality association validation for non-municipality institutions
    if (formData.institutionType && formData.institutionType !== "MUNICIPALITY" && !associatedMunicipality) {
      errors.general = "El municipio asociado es requerido para este tipo de institución";
    }

    return errors;
  };

  const validateEditForm = (formData: InstitutionFormData, associatedMunicipality?: string): FormErrors => {
    const errors: FormErrors = {};

    // Required fields
    if (!formData.name?.trim()) {
      errors.name = "El nombre de la institución es requerido";
    } else if (formData.name.length > 100) {
      errors.name = "El nombre no puede exceder 100 caracteres";
    }

    if (!formData.email?.trim()) {
      errors.email = "El email es requerido";
    } else if (!validateEmail(formData.email)) {
      errors.email = "El formato del email no es válido";
    }

    if (!formData.department?.trim()) {
      errors.department = "El departamento es requerido";
    } else if (formData.department.length > 50) {
      errors.department = "El departamento no puede exceder 50 caracteres";
    }

    if (!formData.institutionType) {
      errors.general = "El tipo de institución es requerido";
    }

    // Optional field validations
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = "El formato del teléfono no es válido";
    }

    if (formData.website && !validateURL(formData.website)) {
      errors.website = "El formato de la URL no es válido";
    }

    if (formData.mayorEmail && !validateEmail(formData.mayorEmail)) {
      errors.mayorEmail = "El formato del email del alcalde no es válido";
    }

    if (formData.mayorPhone && !validatePhone(formData.mayorPhone)) {
      errors.mayorPhone = "El formato del teléfono del alcalde no es válido";
    }

    if (formData.population && !validatePopulation(formData.population)) {
      errors.population = "La población debe ser un número positivo";
    }

    // Conditional validation
    if (formData.institutionType === "OTHER" && !formData.customType?.trim()) {
      errors.customType = "El tipo personalizado es requerido cuando se selecciona 'Otro'";
    }

    // Municipality association validation for non-municipality institutions
    if (formData.institutionType && formData.institutionType !== "MUNICIPALITY" && !associatedMunicipality) {
      errors.general = "El municipio asociado es requerido para este tipo de institución";
    }

    return errors;
  };

  const handleCreateInstitution = async (formData: FormData) => {
    setIsValidating(true);
    setCreateErrors({});

    // Get municipality association
    const associatedMunicipality = formData.get('associatedMunicipality') as string;
    const selectedMunicipality = municipalities.find((m: Municipality) => m.id === associatedMunicipality);

    const formDataObj: InstitutionFormData = {
      name: formData.get('name') as string || '',
      email: formData.get('email') as string || '',
      password: createPassword || formData.get('password') as string || '',
      phone: formData.get('phone') as string || '',
      address: formData.get('address') as string || '',
      website: formData.get('website') as string || '',
      department: selectedMunicipality ? selectedMunicipality.department : (formData.get('department') as string || ''),
      region: selectedMunicipality ? selectedMunicipality.region : (formData.get('region') as string || ''),
      population: formData.get('population') as string || '',
      mayorName: formData.get('mayorName') as string || '',
      mayorEmail: formData.get('mayorEmail') as string || '',
      mayorPhone: formData.get('mayorPhone') as string || '',
      institutionType: formData.get('institutionType') as string || '',
      customType: formData.get('customType') as string || '',
      primaryColor: formData.get('primaryColor') as string || '',
      secondaryColor: formData.get('secondaryColor') as string || '',
      isActive: 'true'
    };

    const errors = validateCreateForm(formDataObj, associatedMunicipality);
    
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      setIsValidating(false);
      return;
    }

    const institutionData = {
      name: formDataObj.name,
      email: formDataObj.email,
      password: formDataObj.password,
      phone: formDataObj.phone || undefined,
      address: formDataObj.address || undefined,
      website: formDataObj.website || undefined,
      department: formDataObj.department,
      region: formDataObj.region || undefined,
      population: formDataObj.population ? parseInt(formDataObj.population) : undefined,
      mayorName: formDataObj.mayorName || undefined,
      mayorEmail: formDataObj.mayorEmail || undefined,
      mayorPhone: formDataObj.mayorPhone || undefined,
      institutionType: formDataObj.institutionType,
      customType: formDataObj.customType || undefined,
      primaryColor: formDataObj.primaryColor || undefined,
      secondaryColor: formDataObj.secondaryColor || undefined
    };

    createInstitutionMutation.mutate(institutionData);
    setIsValidating(false);
  };

  const handleUpdateInstitution = async (formData: FormData) => {
    if (!selectedInstitution) return;
    
    setIsValidating(true);
    setEditErrors({});

    // Get municipality association
    const associatedMunicipality = formData.get('associatedMunicipality') as string;
    const selectedMunicipality = municipalities.find((m: Municipality) => m.id === associatedMunicipality);

    const formDataObj: InstitutionFormData = {
      name: formData.get('name') as string || '',
      email: formData.get('email') as string || '',
      password: '', // Not needed for edit
      phone: formData.get('phone') as string || '',
      address: formData.get('address') as string || '',
      website: formData.get('website') as string || '',
      department: selectedMunicipality ? selectedMunicipality.department : (formData.get('department') as string || ''),
      region: selectedMunicipality ? selectedMunicipality.region : (formData.get('region') as string || ''),
      population: formData.get('population') as string || '',
      mayorName: formData.get('mayorName') as string || '',
      mayorEmail: formData.get('mayorEmail') as string || '',
      mayorPhone: formData.get('mayorPhone') as string || '',
      institutionType: formData.get('institutionType') as string || '',
      customType: formData.get('customType') as string || '',
      primaryColor: formData.get('primaryColor') as string || '',
      secondaryColor: formData.get('secondaryColor') as string || '',
      isActive: formData.get('isActive') as string || 'true'
    };

    const errors = validateEditForm(formDataObj, associatedMunicipality);
    
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      setIsValidating(false);
      return;
    }

    const institutionData = {
      name: formDataObj.name,
      email: formDataObj.email,
      phone: formDataObj.phone || undefined,
      address: formDataObj.address || undefined,
      website: formDataObj.website || undefined,
      department: formDataObj.department,
      region: formDataObj.region || undefined,
      population: formDataObj.population ? parseInt(formDataObj.population) : undefined,
      mayorName: formDataObj.mayorName || undefined,
      mayorEmail: formDataObj.mayorEmail || undefined,
      mayorPhone: formDataObj.mayorPhone || undefined,
      institutionType: formDataObj.institutionType,
      customType: formDataObj.customType || undefined,
      primaryColor: formDataObj.primaryColor || undefined,
      secondaryColor: formDataObj.secondaryColor || undefined,
      isActive: formDataObj.isActive === 'true'
    };

    updateInstitutionMutation.mutate({ id: selectedInstitution.id, institutionData });
    setIsValidating(false);
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
    setEditInstitutionType(institution.institutionType);
    setEditErrors({});
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCreateErrors({});
    setCreatePassword("");
    setCreateInstitutionType("");
    setIsCreateDialogOpen(true);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field === 'email' ? 'Email' : 'Contraseña'} copiado al portapapeles`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Error al copiar al portapapeles');
    }
  };

  const generatePassword = () => {
    const newPassword = generateSecurePassword();
    setCreatePassword(newPassword);
    // Update the form field
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.value = newPassword;
    }
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
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold">Gestión de Instituciones</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Administra las instituciones del sistema</p>
          </div>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 sm:p-6">
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
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold">Gestión de Instituciones</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Administra las instituciones del sistema</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-sm sm:text-base text-destructive">Error al cargar las instituciones: {(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold">Gestión de Instituciones</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Administra las instituciones del sistema</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/admin/pending-institutions" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-10 sm:h-9">
              <Clock className="h-4 w-4 mr-2" />
              Pendientes de Aprobación
            </Button>
          </Link>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) setCreateErrors({});
          }}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="w-full sm:w-auto h-10 sm:h-9">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nueva Institución</span>
                <span className="sm:hidden">Nueva Institución</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Crear Nueva Institución</DialogTitle>
              <DialogDescription className="text-sm">
                Crea una nueva institución con credenciales básicas
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateInstitution} className="space-y-4">
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
                  <Label htmlFor="name" className="text-sm">Nombre de la Institución *</Label>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label htmlFor="phone" className="text-sm">Teléfono</Label>
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
                    className={`text-sm ${createErrors.phone ? "border-red-500" : ""}`}
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
              
              {/* Institution Type - Moved up for conditional logic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institutionType" className="text-sm">Tipo de Institución *</Label>
                  <Select 
                    name="institutionType" 
                    required
                    value={createInstitutionType}
                    onValueChange={setCreateInstitutionType}
                  >
                    <SelectTrigger className={`text-sm ${createErrors.general ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {!isMunicipalityUser && <SelectItem value="MUNICIPALITY">Municipalidad</SelectItem>}
                      <SelectItem value="NGO">ONG</SelectItem>
                      <SelectItem value="TRAINING_CENTER">Centro de Capacitación</SelectItem>
                      <SelectItem value="FOUNDATION">Fundación</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {createInstitutionType === "OTHER" && (
                  <div className="space-y-2">
                    <Label htmlFor="customType" className="text-sm">Tipo Personalizado *</Label>
                    <Input 
                      id="customType" 
                      name="customType" 
                      placeholder="Especificar tipo personalizado" 
                      maxLength={50}
                      className={`text-sm ${createErrors.customType ? "border-red-500" : ""}`}
                    />
                    <ErrorMessage error={createErrors.customType} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm">Sitio Web</Label>
                  <Input 
                    id="website" 
                    name="website" 
                    maxLength={200}
                    placeholder="https://example.com"
                    className={`text-sm ${createErrors.website ? "border-red-500" : ""}`}
                  />
                  <ErrorMessage error={createErrors.website} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm">Departamento *</Label>
                  <Input 
                    id="department" 
                    name="department" 
                    required 
                    maxLength={50}
                    className={`text-sm ${createErrors.department ? "border-red-500" : ""}`}
                  />
                  <ErrorMessage error={createErrors.department} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-sm">Región</Label>
                  <Input 
                    id="region" 
                    name="region" 
                    maxLength={50}
                    className="text-sm"
                  />
                </div>
                {/* Population field - only for municipalities */}
                {createInstitutionType === "MUNICIPALITY" && (
                  <div className="space-y-2">
                    <Label htmlFor="population" className="text-sm">Población</Label>
                    <Input 
                      id="population" 
                      name="population" 
                      type="number" 
                      min="0"
                      max="999999999"
                      step="1"
                      placeholder="0"
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className={`text-sm ${createErrors.population ? "border-red-500" : ""}`}
                    />
                    <ErrorMessage error={createErrors.population} />
                  </div>
                )}
              </div>
              
              {/* Municipality Association - Only show for non-municipality institutions */}
              {createInstitutionType && createInstitutionType !== "MUNICIPALITY" && (
                <div className="space-y-2" id="municipality-association">
                  <Label htmlFor="associatedMunicipality" className="text-sm">Municipio Asociado *</Label>
                  <Select name="associatedMunicipality" required>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Seleccionar municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((municipality: Municipality) => (
                        <SelectItem key={municipality.id} value={municipality.id}>
                          {municipality.name} - {municipality.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecciona el municipio donde se encuentra esta institución. Esto establecerá la región y departamento.
                  </p>
                </div>
              )}
              
              {/* Leadership fields - conditional labels based on institution type */}
              {createInstitutionType && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mayorName" className="text-sm">
                      {createInstitutionType === "MUNICIPALITY" 
                        ? "Nombre del Alcalde" 
                        : "Nombre del Director/Responsable"}
                    </Label>
                    <Input 
                      id="mayorName" 
                      name="mayorName" 
                      maxLength={100}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mayorEmail" className="text-sm">
                      {createInstitutionType === "MUNICIPALITY" 
                        ? "Email del Alcalde" 
                        : "Email del Director/Responsable"}
                    </Label>
                    <Input 
                      id="mayorEmail" 
                      name="mayorEmail" 
                      type="email" 
                      maxLength={100}
                      className={`text-sm ${createErrors.mayorEmail ? "border-red-500" : ""}`}
                    />
                    <ErrorMessage error={createErrors.mayorEmail} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mayorPhone" className="text-sm">
                      {createInstitutionType === "MUNICIPALITY" 
                        ? "Teléfono del Alcalde" 
                        : "Teléfono del Director/Responsable"}
                    </Label>
                    <Input 
                      id="mayorPhone" 
                      name="mayorPhone" 
                      type="tel"
                      maxLength={20}
                      pattern="^[\+]?[0-9\s\-\(\)]{7,15}$"
                      placeholder="+1234567890"
                      onKeyPress={(e) => {
                        if (!/[0-9\s\-\(\)\+]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className={`text-sm ${createErrors.mayorPhone ? "border-red-500" : ""}`}
                    />
                    <ErrorMessage error={createErrors.mayorPhone} />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-sm">Color Primario</Label>
                  <Input 
                    id="primaryColor" 
                    name="primaryColor" 
                    type="color" 
                    defaultValue="#3B82F6"
                    className="h-10 w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="text-sm">Color Secundario</Label>
                  <Input 
                    id="secondaryColor" 
                    name="secondaryColor" 
                    type="color" 
                    defaultValue="#10B981"
                    className="h-10 w-full"
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setCreateErrors({});
                }} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createInstitutionMutation.isPending || isValidating}
                  className="w-full sm:w-auto"
                >
                  {createInstitutionMutation.isPending || isValidating ? 'Creando...' : 'Crear Institución'}
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
              placeholder="Buscar instituciones..."
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
                  setTypeFilter("all");
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
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="MUNICIPALITY">Municipalidad</SelectItem>
                    <SelectItem value="UNIVERSITY">Universidad</SelectItem>
                    <SelectItem value="NGO">ONG</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
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
                    {municipalityInstitutions.map((institution: Institution) => (
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

      {/* Institutions List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredInstitutions.map((institution: Institution) => (
          <Card key={institution.id}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base truncate">{institution.name}</h4>
                    <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 text-xs sm:text-sm text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{institution.email}</span>
                      </div>
                      {institution.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{institution.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{institution.department}</span>
                      </div>
                      {institution.website && (
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-24 sm:max-w-32">{institution.website}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge variant={institution.isActive ? "default" : "secondary"} className="text-xs px-2 py-1">
                        {institution.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge className={`${getInstitutionTypeColor(institution.institutionType)} text-xs px-2 py-1`}>
                        {getInstitutionTypeText(institution.institutionType)}
                      </Badge>
                      {institution.population && (
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          <Users className="h-3 w-3 mr-1" />
                          {institution.population.toLocaleString()} hab.
                        </Badge>
                      )}
                      {getAssociatedMunicipality(institution) && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-20 sm:max-w-none">{getAssociatedMunicipality(institution)?.name}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:items-end">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span className="hidden sm:inline">Registrado: {formatDate(institution.createdAt)}</span>
                      <span className="sm:hidden">{formatDate(institution.createdAt)}</span>
                    </div>
                    {institution.mayorName && (
                      <p className="text-xs mt-1 truncate">Dir: {institution.mayorName}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 sm:space-x-3">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(institution)} className="flex-1 sm:flex-none h-10 sm:h-9 sm:w-auto sm:px-3">
                      <Edit className="h-4 w-4 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline ml-1">Editar</span>
                      <span className="sm:hidden ml-2">Editar</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteInstitution(institution)} className="flex-1 sm:flex-none h-10 sm:h-9 sm:w-auto sm:px-3">
                      <Trash2 className="h-4 w-4 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline ml-1">Eliminar</span>
                      <span className="sm:hidden ml-2">Eliminar</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInstitutions.length === 0 && (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No se encontraron instituciones</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              {searchTerm ? 'No hay instituciones que coincidan con tu búsqueda.' : 'No hay instituciones registradas.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditErrors({});
          setSelectedInstitution(null);
        }
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Editar Institución</DialogTitle>
            <DialogDescription className="text-sm">
              Modifica la información de la institución
            </DialogDescription>
          </DialogHeader>
          {selectedInstitution && (
            <form action={handleUpdateInstitution} className="space-y-4">
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
                  <Label htmlFor="edit-name" className="text-sm">Nombre de la Institución *</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={selectedInstitution.name}
                    required 
                    maxLength={100}
                    className={`text-sm ${editErrors.name ? "border-red-500" : ""}`}
                  />
                  <ErrorMessage error={editErrors.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-sm">Email *</Label>
                  <Input 
                    id="edit-email" 
                    name="email" 
                    type="email" 
                    defaultValue={selectedInstitution.email}
                    required 
                    maxLength={100}
                    className={`text-sm ${editErrors.email ? "border-red-500" : ""}`}
                  />
                  <ErrorMessage error={editErrors.email} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input 
                    id="edit-phone" 
                    name="phone" 
                    defaultValue={selectedInstitution.phone}
                    maxLength={20}
                    className={editErrors.phone ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={editErrors.phone} />
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
                  maxLength={200}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-website">Sitio Web</Label>
                  <Input 
                    id="edit-website" 
                    name="website" 
                    defaultValue={selectedInstitution.website}
                    maxLength={200}
                    className={editErrors.website ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={editErrors.website} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Departamento *</Label>
                  <Input 
                    id="edit-department" 
                    name="department" 
                    defaultValue={selectedInstitution.department}
                    required 
                    maxLength={50}
                    className={editErrors.department ? "border-red-500" : ""}
                  />
                  <ErrorMessage error={editErrors.department} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-region">Región</Label>
                  <Input 
                    id="edit-region" 
                    name="region" 
                    defaultValue={selectedInstitution.region}
                    maxLength={50}
                  />
                </div>
                {/* Population field - only for municipalities */}
                {editInstitutionType === "MUNICIPALITY" && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-population">Población</Label>
                    <Input 
                      id="edit-population" 
                      name="population" 
                      type="number" 
                      defaultValue={selectedInstitution.population}
                      min="1"
                      className={editErrors.population ? "border-red-500" : ""}
                    />
                    <ErrorMessage error={editErrors.population} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-institutionType">Tipo de Institución *</Label>
                  <Select 
                    name="institutionType" 
                    value={editInstitutionType}
                    onValueChange={setEditInstitutionType}
                    required
                  >
                    <SelectTrigger className={editErrors.general ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(!isMunicipalityUser || selectedInstitution.institutionType === "MUNICIPALITY") && <SelectItem value="MUNICIPALITY">Municipalidad</SelectItem>}
                      <SelectItem value="NGO">ONG</SelectItem>
                      <SelectItem value="TRAINING_CENTER">Centro de Capacitación</SelectItem>
                      <SelectItem value="FOUNDATION">Fundación</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editInstitutionType === "OTHER" && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-customType">Tipo Personalizado *</Label>
                    <Input 
                      id="edit-customType" 
                      name="customType" 
                      defaultValue={selectedInstitution.customType}
                      placeholder="Especificar tipo personalizado" 
                      maxLength={50}
                      className={editErrors.customType ? "border-red-500" : ""}
                    />
                    <ErrorMessage error={editErrors.customType} />
                  </div>
                )}
              </div>
              
              {/* Municipality Association - Only show for non-municipality institutions */}
              {editInstitutionType && editInstitutionType !== "MUNICIPALITY" && (
                <div className="space-y-2" id="edit-municipality-association">
                  <Label htmlFor="edit-associatedMunicipality">Municipio Asociado *</Label>
                  <Select name="associatedMunicipality" defaultValue={getAssociatedMunicipality(selectedInstitution)?.id} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((municipality: Municipality) => (
                        <SelectItem key={municipality.id} value={municipality.id}>
                          {municipality.name} - {municipality.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecciona el municipio donde se encuentra esta institución. Esto establecerá la región y departamento.
                  </p>
                </div>
              )}
              
              {/* Leadership fields - conditional labels based on institution type */}
              {editInstitutionType && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-mayorName">
                      {editInstitutionType === "MUNICIPALITY" 
                        ? "Nombre del Alcalde" 
                        : "Nombre del Director/Responsable"}
                    </Label>
                    <Input 
                      id="edit-mayorName" 
                      name="mayorName" 
                      defaultValue={selectedInstitution.mayorName}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-mayorEmail">
                      {editInstitutionType === "MUNICIPALITY" 
                        ? "Email del Alcalde" 
                        : "Email del Director/Responsable"}
                    </Label>
                    <Input 
                      id="edit-mayorEmail" 
                      name="mayorEmail" 
                      type="email" 
                      defaultValue={selectedInstitution.mayorEmail}
                      maxLength={100}
                      className={editErrors.mayorEmail ? "border-red-500" : ""}
                    />
                    <ErrorMessage error={editErrors.mayorEmail} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-mayorPhone">
                      {editInstitutionType === "MUNICIPALITY" 
                        ? "Teléfono del Alcalde" 
                        : "Teléfono del Director/Responsable"}
                    </Label>
                    <Input 
                      id="edit-mayorPhone" 
                      name="mayorPhone" 
                      defaultValue={selectedInstitution.mayorPhone}
                      maxLength={20}
                      className={editErrors.mayorPhone ? "border-red-500" : ""}
                    />
                    <ErrorMessage error={editErrors.mayorPhone} />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-primaryColor">Color Primario</Label>
                  <Input 
                    id="edit-primaryColor" 
                    name="primaryColor" 
                    type="color" 
                    defaultValue={selectedInstitution.primaryColor || "#3B82F6"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-secondaryColor">Color Secundario</Label>
                  <Input 
                    id="edit-secondaryColor" 
                    name="secondaryColor" 
                    type="color" 
                    defaultValue={selectedInstitution.secondaryColor || "#10B981"}
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditErrors({});
                }} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateInstitutionMutation.isPending || isValidating}
                  className="w-full sm:w-auto"
                >
                  {updateInstitutionMutation.isPending || isValidating ? 'Actualizando...' : 'Actualizar Institución'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Confirmar Eliminación</DialogTitle>
            <DialogDescription className="text-sm">
              ¿Estás seguro de que quieres eliminar esta institución? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {institutionToDelete && (
            <div className="py-4">
              <p className="font-medium text-sm sm:text-base">{institutionToDelete.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{institutionToDelete.email}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{institutionToDelete.department}</p>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteInstitutionMutation.isPending} className="w-full sm:w-auto">
              {deleteInstitutionMutation.isPending ? 'Eliminando...' : 'Eliminar'}
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
              <span>Institución Creada</span>
            </DialogTitle>
            <DialogDescription className="text-sm">
              La institución ha sido creada exitosamente. Guarda estas credenciales de forma segura.
            </DialogDescription>
          </DialogHeader>
          {createdInstitution && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">{createdInstitution.name}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-green-600 font-medium">Email:</p>
                      <p className="text-sm text-green-800 font-mono break-all">{createdInstitution.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdInstitution.email, 'email')}
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
                      <p className="text-sm text-green-800 font-mono break-all">{createdInstitution.password}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdInstitution.password, 'password')}
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
                setCreatedInstitution(null);
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
    </div>
  );
}

export default function AdminInstitutionsPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN", "INSTITUTION"]}>
      <InstitutionsManagement />
    </RoleGuard>
  );
}

