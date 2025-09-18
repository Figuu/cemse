"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCVBuilder } from "./CVBuilderContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  User, 
  Briefcase, 
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Save,
  Plus,
  Trash2,
  Edit,
  Award,
  Globe,
  Users,
  FileText
} from "lucide-react";

interface CVProfileData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  cityState: string;
  country: string;
  birthDate: string;
  gender: string;
  documentType: string;
  documentNumber: string;
  avatarUrl: string;
  
  // Professional Information
  jobTitle: string;
  professionalSummary: string;
  experienceLevel: string;
  targetPosition: string;
  targetCompany: string;
  
  // Education
  educationLevel: string;
  currentInstitution: string;
  graduationYear: string;
  isStudying: boolean;
  currentDegree: string;
  universityName: string;
  universityStartDate: string;
  universityEndDate: string;
  universityStatus: string;
  gpa: string;
  
  // Skills and Languages
  skills: string[];
  skillsWithLevel: Array<{ skill: string; level: string }>;
  languages: Array<{ language: string; level: string }>;
  relevantSkills: string[];
  interests: string[];
  
  // Work Experience
  workExperience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    location: string;
  }>;
  
  // Education History
  educationHistory: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa: string;
    description: string;
  }>;
  
  // Projects
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    startDate: string;
    endDate: string;
    url: string;
  }>;
  
  // Achievements
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    issuer: string;
  }>;
  
  // Academic Achievements
  academicAchievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    institution: string;
  }>;
  
  // Extracurricular Activities
  extracurricularActivities: Array<{
    id: string;
    activity: string;
    organization: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  
  // Websites and Social Links
  websites: Array<{
    id: string;
    platform: string;
    url: string;
  }>;
  
  // Social Links
  socialLinks: Array<{
    id: string;
    platform: string;
    url: string;
  }>;
  
  // Certificates
  certificates: Array<{
    id: string;
    title: string;
    issuer: string;
    issueDate: string;
    courseName?: string;
    fileUrl?: string;
  }>;
  
  // Course Completions
  completedCourses: Array<{
    id: string;
    title: string;
    institution: string;
    completedAt: string;
    progress: number;
    certificateUrl?: string;
  }>;
  
  // Entrepreneurship
  entrepreneurships: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    businessStage: string;
    website: string;
    email: string;
    phone: string;
    address: string;
    municipality: string;
    department: string;
    founded: string;
    employees: number;
    annualRevenue: number;
    businessModel: string;
    targetMarket: string;
  }>;
  
  // Youth Applications (Portfolio)
  youthApplications: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    isPublic: boolean;
    viewsCount: number;
    applicationsCount: number;
    createdAt: string;
    cvUrl: string;
    coverLetterUrl: string;
  }>;
  
  // Company Employments
  companyEmployments: Array<{
    id: string;
    companyName: string;
    position: string;
    hiredAt: string;
    terminatedAt: string;
    status: string;
    notes: string;
    salary: number;
    contractType: string;
  }>;
  
  // Entrepreneurship Posts (Content Creation)
  entrepreneurshipPosts: Array<{
    id: string;
    content: string;
    type: string;
    tags: string[];
    likes: number;
    comments: number;
    shares: number;
    views: number;
    createdAt: string;
  }>;
  
  // Entrepreneurship Resources (Publications)
  entrepreneurshipResources: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    tags: string[];
    url: string;
    fileUrl: string;
    views: number;
    likes: number;
    createdAt: string;
  }>;
  
  // Profile Statistics
  profileCompletion: number;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export function ProfileInformationTab() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch complete profile data from shared context
  const { profile: completeProfile, isLoading: profileLoading, refetch: refetchProfile } = useCVBuilder();
  
  const [formData, setFormData] = useState<CVProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    cityState: "",
    country: "Bolivia",
    birthDate: "",
    gender: "",
    documentType: "",
    documentNumber: "",
    avatarUrl: "",
    jobTitle: "",
    professionalSummary: "",
    experienceLevel: "",
    targetPosition: "",
    targetCompany: "",
    educationLevel: "",
    currentInstitution: "",
    graduationYear: "",
    isStudying: false,
    currentDegree: "",
    universityName: "",
    universityStartDate: "",
    universityEndDate: "",
    universityStatus: "",
    gpa: "",
    skills: [],
    skillsWithLevel: [],
    languages: [],
    relevantSkills: [],
    interests: [],
    workExperience: [],
    educationHistory: [],
    projects: [],
    achievements: [],
    academicAchievements: [],
    extracurricularActivities: [],
    websites: [],
    socialLinks: [],
    certificates: [],
    completedCourses: [],
    entrepreneurships: [],
    youthApplications: [],
    companyEmployments: [],
    entrepreneurshipPosts: [],
    entrepreneurshipResources: [],
    profileCompletion: 0,
    lastLoginAt: "",
    createdAt: "",
    updatedAt: "",
  });

  // Initialize form data when complete profile loads
  useEffect(() => {
    if (completeProfile) {
      setFormData(prev => ({
        ...prev,
        firstName: completeProfile.firstName || "",
        lastName: completeProfile.lastName || "",
        email: completeProfile.email || "",
        phone: completeProfile.phone || "",
        address: completeProfile.address || "",
        city: completeProfile.city || "",
        state: completeProfile.state || "",
        cityState: completeProfile.cityState || "",
        country: completeProfile.country || "Bolivia",
        birthDate: completeProfile.birthDate ? new Date(completeProfile.birthDate).toISOString().split('T')[0] : "",
        gender: completeProfile.gender || "",
        documentType: completeProfile.documentType || "",
        documentNumber: completeProfile.documentNumber || "",
        avatarUrl: completeProfile.avatarUrl || "",
        jobTitle: completeProfile.jobTitle || "",
        professionalSummary: completeProfile.professionalSummary || "",
        experienceLevel: completeProfile.experienceLevel || "",
        targetPosition: completeProfile.targetPosition || "",
        targetCompany: completeProfile.targetCompany || "",
        educationLevel: completeProfile.educationLevel || "",
        currentInstitution: completeProfile.currentInstitution || "",
        graduationYear: completeProfile.graduationYear?.toString() || "",
        isStudying: completeProfile.isStudying || false,
        currentDegree: completeProfile.currentDegree || "",
        universityName: completeProfile.universityName || "",
        universityStartDate: completeProfile.universityStartDate ? new Date(completeProfile.universityStartDate).toISOString().split('T')[0] : "",
        universityEndDate: completeProfile.universityEndDate ? new Date(completeProfile.universityEndDate).toISOString().split('T')[0] : "",
        universityStatus: completeProfile.universityStatus || "",
        gpa: completeProfile.gpa?.toString() || "",
        skills: Array.isArray(completeProfile.skills) ? completeProfile.skills as string[] : [],
        skillsWithLevel: Array.isArray(completeProfile.skillsWithLevel) ? completeProfile.skillsWithLevel as Array<{skill: string; level: string}> : [],
        languages: Array.isArray(completeProfile.languages) ? completeProfile.languages as Array<{language: string; level: string}> : [],
        relevantSkills: Array.isArray(completeProfile.relevantSkills) ? completeProfile.relevantSkills : [],
        interests: Array.isArray(completeProfile.interests) ? completeProfile.interests as string[] : [],
        workExperience: Array.isArray(completeProfile.workExperience) ? completeProfile.workExperience as Array<any> : [],
        educationHistory: Array.isArray(completeProfile.educationHistory) ? completeProfile.educationHistory as Array<any> : [],
        projects: Array.isArray(completeProfile.projects) ? completeProfile.projects as Array<any> : [],
        achievements: Array.isArray(completeProfile.achievements) ? completeProfile.achievements as Array<any> : [],
        academicAchievements: Array.isArray(completeProfile.academicAchievements) ? completeProfile.academicAchievements as Array<any> : [],
        extracurricularActivities: Array.isArray(completeProfile.extracurricularActivities) ? completeProfile.extracurricularActivities as Array<any> : [],
        websites: Array.isArray(completeProfile.websites) ? completeProfile.websites as Array<any> : [],
        socialLinks: Array.isArray(completeProfile.socialLinks) ? completeProfile.socialLinks as Array<any> : [],
        entrepreneurships: Array.isArray(completeProfile.entrepreneurships) ? completeProfile.entrepreneurships as Array<any> : [],
        youthApplications: Array.isArray(completeProfile.youthApplications) ? completeProfile.youthApplications as Array<any> : [],
        companyEmployments: Array.isArray(completeProfile.companyEmployments) ? completeProfile.companyEmployments as Array<any> : [],
        entrepreneurshipPosts: Array.isArray(completeProfile.entrepreneurshipPosts) ? completeProfile.entrepreneurshipPosts as Array<any> : [],
        entrepreneurshipResources: Array.isArray(completeProfile.entrepreneurshipResources) ? completeProfile.entrepreneurshipResources as Array<any> : [],
        profileCompletion: completeProfile.profileCompletion || 0,
        lastLoginAt: completeProfile.lastLoginAt ? new Date(completeProfile.lastLoginAt).toISOString().split('T')[0] : "",
        createdAt: completeProfile.createdAt ? new Date(completeProfile.createdAt).toISOString().split('T')[0] : "",
        updatedAt: completeProfile.updatedAt ? new Date(completeProfile.updatedAt).toISOString().split('T')[0] : "",
      }));
    }
  }, [completeProfile]);

  // Fetch and populate certificates and course data from complete profile
  useEffect(() => {
    if (completeProfile) {
      // Format certificates from profile
      const formattedCertificates = completeProfile.certificates?.map(cert => ({
        id: cert.id,
        title: cert.course?.title || "Certificado",
        issuer: cert.course?.instructor?.name || "CEMSE",
        issueDate: new Date(cert.issuedAt).toISOString().split('T')[0],
        courseName: cert.course?.title,
        fileUrl: (cert as any).fileUrl,
      })) || [];

      // Format completed courses from profile
      const completedCourses = completeProfile.courseEnrollments
        ?.filter(course => course.progress === 100)
        .map(course => ({
          id: course.id,
          title: course.course?.title || "Curso",
          institution: course.course?.instructor?.name || "CEMSE",
          completedAt: new Date().toISOString().split('T')[0], // You might want to get actual completion date
          progress: course.progress || 100,
          certificateUrl: undefined, // Link to certificate if available
        })) || [];
      
      setFormData(prev => ({
        ...prev,
        certificates: formattedCertificates,
        completedCourses: completedCourses,
      }));
    }
  }, [completeProfile]);

  // Handle form field changes
  const handleInputChange = (field: keyof CVProfileData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array field changes
  const handleArrayFieldChange = (field: keyof CVProfileData, index: number, subField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => 
        i === index ? { ...item, [subField]: value } : item
      )
    }));
  };

  // Add new item to array
  const addArrayItem = (field: keyof CVProfileData, newItem: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), { ...newItem, id: Date.now().toString() }]
    }));
  };

  // Remove item from array
  const removeArrayItem = (field: keyof CVProfileData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
  };

  // Handle save
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profiles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el perfil');
      }

      toast.success("Perfil actualizado", {
        description: "Tu información se ha actualizado correctamente.",
      });

      await update();
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "No se pudo actualizar el perfil. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando información completa del perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Información Personal</h2>
          <p className="text-muted-foreground">
            Completa tu información para crear un CV profesional
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isLoading}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
          {isEditing && (
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="state">Departamento</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="gender">Género</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => handleInputChange('gender', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Masculino</SelectItem>
                    <SelectItem value="FEMALE">Femenino</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Información Profesional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="jobTitle">Título Profesional</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                disabled={!isEditing}
                placeholder="Ej: Desarrollador Frontend, Analista de Datos"
              />
            </div>
            
            <div>
              <Label htmlFor="professionalSummary">Resumen Profesional</Label>
              <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Consejo:</strong> Escribe 2-3 párrafos que resuman tu experiencia, habilidades clave y objetivos profesionales. 
                  Es lo primero que leen los empleadores. Sé específico y menciona logros cuantificables.
                </p>
              </div>
              <Textarea
                id="professionalSummary"
                value={formData.professionalSummary}
                onChange={(e) => handleInputChange('professionalSummary', e.target.value)}
                disabled={!isEditing}
                rows={4}
                placeholder="Ej: Estudiante de Ingeniería de Sistemas con experiencia en desarrollo web y pasión por la tecnología. He desarrollado aplicaciones web usando React y Node.js, y participé en competencias de programación. Busco oportunidades para aplicar mis conocimientos técnicos y contribuir al crecimiento de una empresa innovadora..."
              />
            </div>
            
            <div>
              <Label htmlFor="experienceLevel">Nivel de Experiencia</Label>
              <Select 
                value={formData.experienceLevel} 
                onValueChange={(value) => handleInputChange('experienceLevel', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona nivel de experiencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_EXPERIENCE">Sin experiencia</SelectItem>
                  <SelectItem value="ENTRY_LEVEL">Nivel inicial (0-2 años)</SelectItem>
                  <SelectItem value="MID_LEVEL">Nivel medio (3-5 años)</SelectItem>
                  <SelectItem value="SENIOR_LEVEL">Nivel senior (6+ años)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="targetPosition">Posición Objetivo</Label>
              <Input
                id="targetPosition"
                value={formData.targetPosition}
                onChange={(e) => handleInputChange('targetPosition', e.target.value)}
                disabled={!isEditing}
                placeholder="Ej: Desarrollador Full Stack"
              />
            </div>
            
            <div>
              <Label htmlFor="targetCompany">Empresa Objetivo</Label>
              <Input
                id="targetCompany"
                value={formData.targetCompany}
                onChange={(e) => handleInputChange('targetCompany', e.target.value)}
                disabled={!isEditing}
                placeholder="Ej: Empresa de tecnología"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Education Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Educación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="educationLevel">Nivel de Educación</Label>
              <Select 
                value={formData.educationLevel} 
                onValueChange={(value) => handleInputChange('educationLevel', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona nivel educativo" />
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
            
            <div>
              <Label htmlFor="currentInstitution">Institución Actual</Label>
              <Input
                id="currentInstitution"
                value={formData.currentInstitution}
                onChange={(e) => handleInputChange('currentInstitution', e.target.value)}
                disabled={!isEditing}
                placeholder="Nombre de la institución"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="currentDegree">Título/Carrera</Label>
              <Input
                id="currentDegree"
                value={formData.currentDegree}
                onChange={(e) => handleInputChange('currentDegree', e.target.value)}
                disabled={!isEditing}
                placeholder="Ej: Ingeniería en Sistemas"
              />
            </div>
            
            <div>
              <Label htmlFor="graduationYear">Año de Graduación</Label>
              <Input
                id="graduationYear"
                type="number"
                value={formData.graduationYear}
                onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                disabled={!isEditing}
                placeholder="2024"
              />
            </div>
            
            <div>
              <Label htmlFor="gpa">Promedio (GPA)</Label>
              <Input
                id="gpa"
                type="number"
                step="0.01"
                value={formData.gpa}
                onChange={(e) => handleInputChange('gpa', e.target.value)}
                disabled={!isEditing}
                placeholder="3.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Habilidades
            </div>
            {isEditing && (
              <Button
                size="sm"
                onClick={() => addArrayItem('skillsWithLevel', { skill: '', level: 'BEGINNER' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Habilidad
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              💡 <strong>Consejo:</strong> Incluye habilidades técnicas (programación, diseño, etc.) y blandas (liderazgo, comunicación). 
              Sé honesto con tu nivel. Los empleadores valoran la autenticidad.
            </p>
          </div>
          <div className="space-y-3">
            {formData.skillsWithLevel.map((skill, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <Input
                    value={skill.skill}
                    onChange={(e) => handleArrayFieldChange('skillsWithLevel', index, 'skill', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: JavaScript, Photoshop, Liderazgo, Comunicación..."
                  />
                </div>
                <div className="w-32">
                  <Select 
                    value={skill.level} 
                    onValueChange={(value) => handleArrayFieldChange('skillsWithLevel', index, 'level', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Principiante</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                      <SelectItem value="ADVANCED">Avanzado</SelectItem>
                      <SelectItem value="EXPERT">Experto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeArrayItem('skillsWithLevel', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {formData.skillsWithLevel.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No hay habilidades agregadas. Haz clic en "Agregar Habilidad" para comenzar.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Languages Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Idiomas
            </div>
            {isEditing && (
              <Button
                size="sm"
                onClick={() => addArrayItem('languages', { language: '', level: 'BEGINNER' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Idioma
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Consejo:</strong> Incluye todos los idiomas que manejas, incluso si son básicos. 
              Los idiomas son muy valorados por los empleadores. Incluye certificaciones oficiales si las tienes.
            </p>
          </div>
          <div className="space-y-3">
            {formData.languages.map((lang, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <Input
                    value={lang.language}
                    onChange={(e) => handleArrayFieldChange('languages', index, 'language', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: Inglés, Francés, Portugués, Quechua..."
                  />
                </div>
                <div className="w-32">
                  <Select 
                    value={lang.level} 
                    onValueChange={(value) => handleArrayFieldChange('languages', index, 'level', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Principiante (A1-A2)</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermedio (B1-B2)</SelectItem>
                      <SelectItem value="ADVANCED">Avanzado (C1-C2)</SelectItem>
                      <SelectItem value="NATIVE">Nativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeArrayItem('languages', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {formData.languages.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No hay idiomas agregados. Haz clic en "Agregar Idioma" para comenzar.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Enlaces de Redes Sociales
            </div>
            {isEditing && (
              <Button
                size="sm"
                onClick={() => addArrayItem('socialLinks', { platform: '', url: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Enlace
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              💡 <strong>Consejo:</strong> Incluye solo enlaces profesionales como LinkedIn, GitHub, 
              o tu portfolio personal. Evita redes sociales personales como Facebook o Instagram.
            </p>
          </div>
          <div className="space-y-3">
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-32">
                  <Select 
                    value={link.platform} 
                    onValueChange={(value) => handleArrayFieldChange('socialLinks', index, 'platform', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="GitHub">GitHub</SelectItem>
                      <SelectItem value="Portfolio">Portfolio</SelectItem>
                      <SelectItem value="Behance">Behance</SelectItem>
                      <SelectItem value="Dribbble">Dribbble</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="Other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Input
                    value={link.url}
                    onChange={(e) => handleArrayFieldChange('socialLinks', index, 'url', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://..."
                  />
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeArrayItem('socialLinks', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {formData.socialLinks.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No hay enlaces agregados. Haz clic en "Agregar Enlace" para comenzar.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Logros y Reconocimientos
            </div>
            {isEditing && (
              <Button
                size="sm"
                onClick={() => addArrayItem('achievements', { title: '', description: '', date: '', issuer: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Logro
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 <strong>Consejo:</strong> Incluye premios, reconocimientos, competencias ganadas, 
              publicaciones, o cualquier logro que demuestre tu excelencia. Esto te diferencia de otros candidatos.
            </p>
          </div>
          <div className="space-y-4">
            {formData.achievements.map((achievement, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`achievement-title-${index}`}>Título del Logro</Label>
                    <Input
                      id={`achievement-title-${index}`}
                      value={achievement.title}
                      onChange={(e) => handleArrayFieldChange('achievements', index, 'title', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Ej: Primer lugar en competencia de programación"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`achievement-date-${index}`}>Fecha</Label>
                    <Input
                      id={`achievement-date-${index}`}
                      type="date"
                      value={achievement.date}
                      onChange={(e) => handleArrayFieldChange('achievements', index, 'date', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`achievement-issuer-${index}`}>Organización/Institución</Label>
                  <Input
                    id={`achievement-issuer-${index}`}
                    value={achievement.issuer}
                    onChange={(e) => handleArrayFieldChange('achievements', index, 'issuer', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: Universidad Mayor de San Andrés, Google, etc."
                  />
                </div>
                <div>
                  <Label htmlFor={`achievement-description-${index}`}>Descripción</Label>
                  <Textarea
                    id={`achievement-description-${index}`}
                    value={achievement.description}
                    onChange={(e) => handleArrayFieldChange('achievements', index, 'description', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Describe brevemente el logro y su importancia..."
                    rows={2}
                  />
                </div>
                {isEditing && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeArrayItem('achievements', index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {formData.achievements.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No hay logros agregados. Haz clic en "Agregar Logro" para comenzar.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Extracurricular Activities Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Actividades Extracurriculares
            </div>
            {isEditing && (
              <Button
                size="sm"
                onClick={() => addArrayItem('extracurricularActivities', { 
                  activity: '', 
                  organization: '', 
                  startDate: '', 
                  endDate: '', 
                  current: false, 
                  description: '' 
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Actividad
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              💡 <strong>Consejo:</strong> Incluye voluntariado, clubes, deportes, organizaciones estudiantiles, 
              o cualquier actividad que muestre tu liderazgo, trabajo en equipo, o compromiso social.
            </p>
          </div>
          <div className="space-y-4">
            {formData.extracurricularActivities.map((activity, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`activity-name-${index}`}>Nombre de la Actividad</Label>
                    <Input
                      id={`activity-name-${index}`}
                      value={activity.activity}
                      onChange={(e) => handleArrayFieldChange('extracurricularActivities', index, 'activity', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Ej: Presidente del Club de Programación"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`activity-organization-${index}`}>Organización</Label>
                    <Input
                      id={`activity-organization-${index}`}
                      value={activity.organization}
                      onChange={(e) => handleArrayFieldChange('extracurricularActivities', index, 'organization', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Ej: Universidad, ONG, Club, etc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`activity-start-${index}`}>Fecha de Inicio</Label>
                    <Input
                      id={`activity-start-${index}`}
                      type="date"
                      value={activity.startDate}
                      onChange={(e) => handleArrayFieldChange('extracurricularActivities', index, 'startDate', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`activity-end-${index}`}>Fecha de Fin</Label>
                    <Input
                      id={`activity-end-${index}`}
                      type="date"
                      value={activity.endDate}
                      onChange={(e) => handleArrayFieldChange('extracurricularActivities', index, 'endDate', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id={`activity-current-${index}`}
                      checked={activity.current}
                      onChange={(e) => handleArrayFieldChange('extracurricularActivities', index, 'current', e.target.checked)}
                      disabled={!isEditing}
                      className="rounded"
                    />
                    <Label htmlFor={`activity-current-${index}`}>Actualmente activo</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor={`activity-description-${index}`}>Descripción</Label>
                  <Textarea
                    id={`activity-description-${index}`}
                    value={activity.description}
                    onChange={(e) => handleArrayFieldChange('extracurricularActivities', index, 'description', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Describe tus responsabilidades y logros en esta actividad..."
                    rows={2}
                  />
                </div>
                {isEditing && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeArrayItem('extracurricularActivities', index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {formData.extracurricularActivities.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No hay actividades agregadas. Haz clic en "Agregar Actividad" para comenzar.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Certificates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Certificados Obtenidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <p className="text-muted-foreground text-center py-4">Cargando certificados...</p>
          ) : formData.certificates.length > 0 ? (
            <div className="space-y-3">
              {formData.certificates.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{cert.title}</h4>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    <p className="text-xs text-muted-foreground">Emitido: {cert.issueDate}</p>
                  </div>
                  <Badge variant="secondary">Certificado</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No hay certificados disponibles. Completa cursos para obtener certificados.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Completed Courses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Cursos Completados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <p className="text-muted-foreground text-center py-4">Cargando cursos...</p>
          ) : formData.completedCourses.length > 0 ? (
            <div className="space-y-3">
              {formData.completedCourses.map((course, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{course.title}</h4>
                    <p className="text-sm text-muted-foreground">{course.institution}</p>
                    <p className="text-xs text-muted-foreground">Completado: {course.completedAt}</p>
                  </div>
                  <Badge variant="outline">{course.progress}%</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No hay cursos completados. Enrollate en cursos para comenzar tu formación.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Entrepreneurship Section */}
      {formData.entrepreneurships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Emprendimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.entrepreneurships.map((business, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{business.name}</h4>
                    <Badge variant="secondary">{business.businessStage}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{business.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Categoría: {business.category}</span>
                    {business.website && <span>Web: {business.website}</span>}
                    {business.employees && <span>Empleados: {business.employees}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Youth Applications (Portfolio) Section */}
      {formData.youthApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Aplicaciones y Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.youthApplications.map((application, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{application.title}</h4>
                    <Badge variant={application.isPublic ? "default" : "secondary"}>
                      {application.isPublic ? "Público" : "Privado"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{application.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Vistas: {application.viewsCount}</span>
                    <span>Aplicaciones: {application.applicationsCount}</span>
                    <span>Creado: {application.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Employments Section */}
      {formData.companyEmployments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Empleos Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.companyEmployments.map((employment, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{employment.position} en {employment.companyName}</h4>
                    <Badge variant={employment.status === 'ACTIVE' ? "default" : "secondary"}>
                      {employment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Contratado: {employment.hiredAt}</span>
                    {employment.terminatedAt && <span>Terminado: {employment.terminatedAt}</span>}
                    {employment.salary && <span>Salario: {employment.salary}</span>}
                    <span>Tipo: {employment.contractType}</span>
                  </div>
                  {employment.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{employment.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entrepreneurship Posts (Content Creation) Section */}
      {formData.entrepreneurshipPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Contenido Creado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.entrepreneurshipPosts.slice(0, 5).map((post, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Post #{index + 1}</h4>
                    <Badge variant="outline">{post.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{post.content}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>👍 {post.likes}</span>
                    <span>💬 {post.comments}</span>
                    <span>📤 {post.shares}</span>
                    <span>👁 {post.views}</span>
                    <span>{post.createdAt}</span>
                  </div>
                </div>
              ))}
              {formData.entrepreneurshipPosts.length > 5 && (
                <p className="text-center text-sm text-muted-foreground">
                  Y {formData.entrepreneurshipPosts.length - 5} posts más...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entrepreneurship Resources (Publications) Section */}
      {formData.entrepreneurshipResources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recursos y Publicaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.entrepreneurshipResources.map((resource, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{resource.title}</h4>
                    <Badge variant="outline">{resource.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Categoría: {resource.category}</span>
                    <span>👁 {resource.views}</span>
                    <span>👍 {resource.likes}</span>
                    <span>{resource.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Statistics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Estadísticas del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{formData.profileCompletion}%</div>
              <div className="text-sm text-muted-foreground">Completitud del Perfil</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{formData.certificates.length}</div>
              <div className="text-sm text-muted-foreground">Certificados</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{formData.completedCourses.length}</div>
              <div className="text-sm text-muted-foreground">Cursos Completados</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{formData.entrepreneurships.length}</div>
              <div className="text-sm text-muted-foreground">Emprendimientos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
