"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Download, 
  Eye, 
  Edit,
  Mail,
  Building,
  User,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

const coverLetterSchema = z.object({
  recipientName: z.string().optional(),
  companyName: z.string().min(1, "El nombre de la empresa es requerido"),
  position: z.string().min(1, "El puesto es requerido"),
  content: z.string().min(100, "El contenido debe tener al menos 100 caracteres"),
  senderName: z.string().min(1, "Tu nombre es requerido"),
  senderEmail: z.string().email("Email inválido"),
  senderPhone: z.string().min(1, "El teléfono es requerido"),
  template: z.string().default("professional"),
});

type CoverLetterFormData = z.infer<typeof coverLetterSchema>;

interface CoverLetterBuilderProps {
  className?: string;
  onSubmit?: (data: CoverLetterFormData) => void;
  isLoading?: boolean;
  currentUser?: {
    id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    };
  };
  existingCoverLetter?: {
    id: string;
    recipientName?: string;
    companyName: string;
    position: string;
    content: string;
    template: string;
  };
}

const coverLetterTemplates = [
  { 
    id: "professional", 
    name: "Profesional", 
    description: "Formato tradicional y elegante",
    preview: "Estimado/a [Nombre],\n\nMe dirijo a ustedes para expresar mi interés..."
  },
  { 
    id: "modern", 
    name: "Moderno", 
    description: "Estilo contemporáneo y directo",
    preview: "Hola [Nombre],\n\nSoy [Tu Nombre] y me interesa mucho la posición..."
  },
  { 
    id: "creative", 
    name: "Creativo", 
    description: "Para perfiles creativos y artísticos",
    preview: "¡Hola!\n\nSoy [Tu Nombre] y creo que sería perfecto para..."
  }
];

const coverLetterSamples = [
  {
    id: "entry-level",
    name: "Nivel Inicial",
    content: "Como recién graduado/a en [Campo de Estudio], estoy emocionado/a por la oportunidad de comenzar mi carrera profesional en [Empresa]. Aunque mi experiencia laboral es limitada, he desarrollado fuertes habilidades en [Habilidades Relevantes] a través de mis estudios y proyectos personales.\n\nDurante mi tiempo en la universidad, participé en [Proyectos/Actividades] que me permitieron desarrollar [Habilidades Específicas]. Mi pasión por [Área de Interés] y mi deseo de aprender me convierten en un candidato ideal para esta posición.\n\nEstoy ansioso/a por la oportunidad de contribuir al equipo de [Empresa] y crecer profesionalmente en un ambiente dinámico e innovador."
  },
  {
    id: "experienced",
    name: "Con Experiencia",
    content: "Con más de [X] años de experiencia en [Campo], estoy entusiasmado/a por la oportunidad de unirme a [Empresa] como [Posición]. Mi experiencia previa en [Experiencia Relevante] me ha proporcionado las habilidades necesarias para contribuir significativamente a su equipo.\n\nEn mi rol anterior en [Empresa Anterior], logré [Logros Específicos] que resultaron en [Resultados Medibles]. Mi experiencia en [Habilidades Técnicas] y mi capacidad para [Habilidades Blandas] me permiten abordar los desafíos de manera efectiva.\n\nEstoy particularmente atraído/a por [Aspecto Específico de la Empresa] y creo que mi experiencia en [Área Específica] sería valiosa para el equipo."
  },
  {
    id: "career-change",
    name: "Cambio de Carrera",
    content: "Aunque mi experiencia principal ha sido en [Campo Anterior], mi pasión por [Nuevo Campo] y mi deseo de hacer una transición profesional me han llevado a buscar oportunidades en [Nuevo Campo]. Mi experiencia en [Habilidades Transferibles] me ha preparado bien para este cambio.\n\nDurante mi tiempo en [Trabajo Anterior], desarrollé habilidades en [Habilidades Relevantes] que son directamente aplicables a [Nuevo Campo]. He estado activamente aprendiendo sobre [Nuevo Campo] a través de [Cursos/Proyectos/Experiencia] y estoy emocionado/a por aplicar estos conocimientos en un rol profesional.\n\nMi motivación, capacidad de aprendizaje rápido y experiencia previa me convierten en un candidato único para esta posición."
  }
];

export function CoverLetterBuilder({ 
  className, 
  onSubmit, 
  isLoading = false,
  currentUser,
  existingCoverLetter
}: CoverLetterBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(existingCoverLetter?.template || "professional");
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      recipientName: existingCoverLetter?.recipientName || "",
      companyName: existingCoverLetter?.companyName || "",
      position: existingCoverLetter?.position || "",
      content: existingCoverLetter?.content || "",
      senderName: currentUser?.profile ? 
        `${currentUser.profile.firstName || ''} ${currentUser.profile.lastName || ''}`.trim() : "",
      senderEmail: currentUser?.email || "",
      senderPhone: currentUser?.profile?.phone || "",
      template: existingCoverLetter?.template || "professional",
    },
  });

  const watchedValues = watch();

  const getCompletionPercentage = () => {
    let completed = 0;
    const total = 6;

    if (watchedValues.companyName) completed++;
    if (watchedValues.position) completed++;
    if (watchedValues.content && watchedValues.content.length >= 100) completed++;
    if (watchedValues.senderName) completed++;
    if (watchedValues.senderEmail) completed++;
    if (watchedValues.senderPhone) completed++;

    return Math.round((completed / total) * 100);
  };

  const completion = getCompletionPercentage();

  const handleSampleSelect = (sample: typeof coverLetterSamples[0]) => {
    setValue("content", sample.content);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setValue("template", templateId);
  };

  const generatePreview = () => {
    setShowPreview(true);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Plantillas de Carta de Presentación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {coverLetterTemplates.map(template => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleTemplateChange(template.id)}
              >
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  {template.preview}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Completion Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso de Completitud</span>
            <span className="text-sm text-muted-foreground">{completion}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${completion}%` } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            {completion >= 80 ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Carta lista para generar</span>
              </>
            ) : completion >= 60 ? (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">Casi lista, completa algunos campos más</span>
              </>
            ) : (
              <>
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600">Completa más información para mejorar tu carta</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cover Letter Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Carta de Presentación
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Finalizar Edición" : "Editar Carta"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => onSubmit?.(data as unknown as CoverLetterFormData))} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Información de la Empresa
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="recipientName">Nombre del Reclutador (Opcional)</Label>
                  <Input
                    id="recipientName"
                    {...register("recipientName")}
                    placeholder="ej. María González"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                  <Input
                    id="companyName"
                    {...register("companyName")}
                    placeholder="ej. Tech Solutions SRL"
                    disabled={!isEditing}
                    className={errors.companyName ? "border-red-500" : ""}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-600 mt-1">{errors.companyName.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="position">Posición a la que aplicas *</Label>
                <Input
                  id="position"
                  {...register("position")}
                  placeholder="ej. Desarrollador Frontend Junior"
                  disabled={!isEditing}
                  className={errors.position ? "border-red-500" : ""}
                />
                {errors.position && (
                  <p className="text-sm text-red-600 mt-1">{errors.position.message}</p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Contenido de la Carta</h4>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? "Ocultar Vista Previa" : "Vista Previa"}
                  </Button>
                </div>
              </div>
              
              {!showPreview ? (
                <div>
                  <Label htmlFor="content">Carta de Presentación *</Label>
                  <Textarea
                    id="content"
                    {...register("content")}
                    placeholder="Escribe tu carta de presentación personalizada..."
                    rows={12}
                    disabled={!isEditing}
                    className={errors.content ? "border-red-500" : ""}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Mínimo 100 caracteres</span>
                    <span>{watchedValues.content?.length || 0} caracteres</span>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-6 bg-muted/50">
                  <div className="text-right text-sm text-muted-foreground mb-4">
                    {new Date().toLocaleDateString('es-ES')}
                  </div>
                  
                  <div className="mb-4">
                    {watchedValues.recipientName ? (
                      <div>Estimado/a {watchedValues.recipientName},</div>
                    ) : (
                      <div>Estimado/a Reclutador/a,</div>
                    )}
                    <div className="font-medium">{watchedValues.companyName || "[Nombre de la Empresa]"}</div>
                  </div>
                  
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {watchedValues.content || "Escribe tu carta de presentación aquí..."}
                  </div>
                  
                  <div className="mt-6">
                    <div>Atentamente,</div>
                    <div className="font-medium mt-2">{watchedValues.senderName || "[Tu Nombre]"}</div>
                    <div className="text-sm text-muted-foreground">
                      {watchedValues.senderEmail || "[tu@email.com]"} | {watchedValues.senderPhone || "[Tu Teléfono]"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sample Templates */}
            <div className="space-y-4">
              <h4 className="font-medium">Plantillas de Ejemplo</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {coverLetterSamples.map(sample => (
                  <Card key={sample.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h5 className="font-medium mb-2">{sample.name}</h5>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {sample.content.substring(0, 100)}...
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSampleSelect(sample)}
                        disabled={!isEditing}
                      >
                        Usar Plantilla
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                Tu Información
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="senderName">Tu Nombre *</Label>
                  <Input
                    id="senderName"
                    {...register("senderName")}
                    disabled={!isEditing}
                    className={errors.senderName ? "border-red-500" : ""}
                  />
                  {errors.senderName && (
                    <p className="text-sm text-red-600 mt-1">{errors.senderName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="senderEmail">Tu Email *</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    {...register("senderEmail")}
                    disabled={!isEditing}
                    className={errors.senderEmail ? "border-red-500" : ""}
                  />
                  {errors.senderEmail && (
                    <p className="text-sm text-red-600 mt-1">{errors.senderEmail.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="senderPhone">Tu Teléfono *</Label>
                <Input
                  id="senderPhone"
                  {...register("senderPhone")}
                  disabled={!isEditing}
                  className={errors.senderPhone ? "border-red-500" : ""}
                />
                {errors.senderPhone && (
                  <p className="text-sm text-red-600 mt-1">{errors.senderPhone.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Editar" : "Vista Previa"}
              </Button>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePreview}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generar PDF
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || completion < 60}
                >
                  {isLoading ? "Guardando..." : "Guardar Carta"}
                </Button>
              </div>
            </div>

            {completion < 60 && (
              <p className="text-sm text-muted-foreground text-center">
                Completa al menos el 60% de la información para poder guardar la carta
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
