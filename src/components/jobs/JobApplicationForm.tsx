"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, 
  FileText, 
  Send, 
  X,
  User,
  Briefcase
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logo: string;
  };
  location: string;
  type: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

interface JobApplicationFormProps {
  job: Job;
  onClose: () => void;
  onSubmit: (applicationData: Record<string, unknown>) => void;
}

export function JobApplicationForm({ job, onClose, onSubmit }: JobApplicationFormProps) {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    
    // Professional Information
    currentPosition: "",
    currentCompany: "",
    experience: "",
    education: "",
    skills: [] as string[],
    
    // Application Details
    coverLetter: "",
    expectedSalary: "",
    availability: "",
    noticePeriod: "",
    
    // Additional Information
    motivation: "",
    questions: "",
    
    // Files
    resume: null as File | null,
    coverLetterFile: null as File | null,
    portfolio: null as File | null,
    
    // Agreements
    agreeToTerms: false,
    agreeToDataProcessing: false,
    agreeToContact: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean | File | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
      // In a real app, you would upload the file and get a URL
      console.log("Uploading file:", files[0]);
      handleInputChange("resume", files[0]);
    }
  };

  const handleCoverLetterUpload = async (files: File[]) => {
    if (files.length > 0) {
      console.log("Uploading cover letter:", files[0]);
      handleInputChange("coverLetterFile", files[0]);
    }
  };

  const handlePortfolioUpload = async (files: File[]) => {
    if (files.length > 0) {
      console.log("Uploading portfolio:", files[0]);
      handleInputChange("portfolio", files[0]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "El nombre es requerido";
    if (!formData.lastName.trim()) newErrors.lastName = "El apellido es requerido";
    if (!formData.email.trim()) newErrors.email = "El email es requerido";
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido";
    if (!formData.currentPosition.trim()) newErrors.currentPosition = "La posición actual es requerida";
    if (!formData.experience) newErrors.experience = "La experiencia es requerida";
    if (!formData.coverLetter.trim()) newErrors.coverLetter = "La carta de presentación es requerida";
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "Debes aceptar los términos y condiciones";
    if (!formData.agreeToDataProcessing) newErrors.agreeToDataProcessing = "Debes aceptar el procesamiento de datos";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSubmit(formData);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Aplicar a: {job.title}
              </CardTitle>
              <CardDescription>
                {job.company.name} • {job.location}{job.salary && ` • ${formatSalary(job.salary.min, job.salary.max, job.salary.currency)}`}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información Personal
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Información Profesional
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="currentPosition">Posición Actual *</Label>
                  <Input
                    id="currentPosition"
                    value={formData.currentPosition}
                    onChange={(e) => handleInputChange("currentPosition", e.target.value)}
                    className={errors.currentPosition ? "border-red-500" : ""}
                  />
                  {errors.currentPosition && (
                    <p className="text-sm text-red-500 mt-1">{errors.currentPosition}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="currentCompany">Empresa Actual</Label>
                  <Input
                    id="currentCompany"
                    value={formData.currentCompany}
                    onChange={(e) => handleInputChange("currentCompany", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Años de Experiencia *</Label>
                  <Select
                    value={formData.experience}
                    onValueChange={(value) => handleInputChange("experience", value)}
                  >
                    <SelectTrigger className={errors.experience ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona experiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 años</SelectItem>
                      <SelectItem value="2-3">2-3 años</SelectItem>
                      <SelectItem value="4-5">4-5 años</SelectItem>
                      <SelectItem value="6-10">6-10 años</SelectItem>
                      <SelectItem value="10+">10+ años</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.experience && (
                    <p className="text-sm text-red-500 mt-1">{errors.experience}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="education">Nivel de Educación</Label>
                  <Select
                    value={formData.education}
                    onValueChange={(value) => handleInputChange("education", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona educación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">Bachillerato</SelectItem>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="bachelor">Licenciatura</SelectItem>
                      <SelectItem value="master">Maestría</SelectItem>
                      <SelectItem value="phd">Doctorado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expectedSalary">Salario Esperado</Label>
                  <Input
                    id="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={(e) => handleInputChange("expectedSalary", e.target.value)}
                    placeholder="Ej: $25,000 - $35,000"
                  />
                </div>
                <div>
                  <Label htmlFor="availability">Disponibilidad</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => handleInputChange("availability", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona disponibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Inmediata</SelectItem>
                      <SelectItem value="1-week">1 semana</SelectItem>
                      <SelectItem value="2-weeks">2 semanas</SelectItem>
                      <SelectItem value="1-month">1 mes</SelectItem>
                      <SelectItem value="negotiable">Negociable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Carta de Presentación
              </h3>
              <div>
                <Label htmlFor="coverLetter">Carta de Presentación *</Label>
                <Textarea
                  id="coverLetter"
                  value={formData.coverLetter}
                  onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                  rows={6}
                  placeholder="Explica por qué eres el candidato ideal para este puesto..."
                  className={errors.coverLetter ? "border-red-500" : ""}
                />
                {errors.coverLetter && (
                  <p className="text-sm text-red-500 mt-1">{errors.coverLetter}</p>
                )}
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Documentos
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Currículum Vitae</Label>
                  <FileUpload
                    onUpload={handleFileUpload}
                    accept={{
                      "application/pdf": [".pdf"],
                      "application/msword": [".doc"],
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
                    }}
                    maxFiles={1}
                    maxSize={10 * 1024 * 1024} // 10MB
                  />
                </div>
                <div>
                  <Label>Carta de Presentación (Archivo)</Label>
                  <FileUpload
                    onUpload={handleCoverLetterUpload}
                    accept={{
                      "application/pdf": [".pdf"],
                      "application/msword": [".doc"],
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
                    }}
                    maxFiles={1}
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                </div>
              </div>
              <div>
                <Label>Portafolio (Opcional)</Label>
                <FileUpload
                  onUpload={handlePortfolioUpload}
                  accept={{
                    "application/pdf": [".pdf"],
                    "image/*": [".png", ".jpg", ".jpeg", ".gif"]
                  }}
                  maxFiles={3}
                  maxSize={20 * 1024 * 1024} // 20MB
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Adicional</h3>
              <div>
                <Label htmlFor="motivation">¿Qué te motiva a aplicar a este puesto?</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => handleInputChange("motivation", e.target.value)}
                  rows={3}
                  placeholder="Comparte tu motivación y por qué te interesa esta oportunidad..."
                />
              </div>
              <div>
                <Label htmlFor="questions">¿Tienes alguna pregunta para nosotros?</Label>
                <Textarea
                  id="questions"
                  value={formData.questions}
                  onChange={(e) => handleInputChange("questions", e.target.value)}
                  rows={3}
                  placeholder="Si tienes preguntas sobre el puesto o la empresa, escríbelas aquí..."
                />
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Términos y Condiciones</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    Acepto los términos y condiciones de la plataforma *
                  </Label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-500">{errors.agreeToTerms}</p>
                )}
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToDataProcessing"
                    checked={formData.agreeToDataProcessing}
                    onCheckedChange={(checked) => handleInputChange("agreeToDataProcessing", checked)}
                  />
                  <Label htmlFor="agreeToDataProcessing" className="text-sm">
                    Acepto el procesamiento de mis datos personales *
                  </Label>
                </div>
                {errors.agreeToDataProcessing && (
                  <p className="text-sm text-red-500">{errors.agreeToDataProcessing}</p>
                )}
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToContact"
                    checked={formData.agreeToContact}
                    onCheckedChange={(checked) => handleInputChange("agreeToContact", checked)}
                  />
                  <Label htmlFor="agreeToContact" className="text-sm">
                    Autorizo a la empresa a contactarme para este proceso de selección
                  </Label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Aplicación
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
