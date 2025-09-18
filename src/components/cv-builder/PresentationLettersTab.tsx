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
  Mail, 
  Download, 
  Eye,
  Save,
  Edit,
  Plus,
  Trash2,
  FileText,
  Palette,
  Type,
  Layout
} from "lucide-react";
import { PresentationLetterTemplate1 } from "./templates/PresentationLetterTemplate1";
import { PresentationLetterTemplate2 } from "./templates/PresentationLetterTemplate2";
import { PresentationLetterTemplate3 } from "./templates/PresentationLetterTemplate3";

interface PresentationLetterData {
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  position: string;
  subject: string;
  content: string;
  closing: string;
  signature: string;
  date: string;
  template: string;
}

interface PresentationLetterTemplate {
  id: string;
  name: string;
  description: string;
  style: string;
  color: string;
  preview: string;
  component: React.ComponentType<any>;
}

const letterTemplates: PresentationLetterTemplate[] = [
  {
    id: "professional",
    name: "Profesional",
    description: "Formato formal y elegante para aplicaciones corporativas",
    style: "Formal",
    color: "Azul",
    preview: "Carta formal con estructura tradicional",
    component: PresentationLetterTemplate1,
  },
  {
    id: "modern",
    name: "Moderno",
    description: "Diseño contemporáneo con elementos visuales modernos",
    style: "Contemporáneo",
    color: "Verde",
    preview: "Layout moderno con tipografía limpia",
    component: PresentationLetterTemplate2,
  },
  {
    id: "creative",
    name: "Creativo",
    description: "Estilo innovador para perfiles creativos y tecnológicos",
    style: "Innovador",
    color: "Púrpura",
    preview: "Diseño asimétrico con elementos visuales",
    component: PresentationLetterTemplate3,
  },
];

export function PresentationLettersTab() {
  const { data: session, update } = useSession();
  const { profile } = useCVBuilder();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState<PresentationLetterData>({
    recipientName: "",
    recipientTitle: "",
    companyName: "",
    position: "",
    subject: "",
    content: "",
    closing: "Atentamente,",
    signature: "",
    date: new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    template: "professional",
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        recipientName: profile.coverLetterRecipientName || "",
        recipientTitle: profile.coverLetterRecipientTitle || "",
        companyName: profile.coverLetterCompanyName || "",
        position: profile.coverLetterPosition || profile.targetPosition || profile.jobTitle || "",
        subject: profile.coverLetterSubject || "",
        content: profile.coverLetterContent || "",
        closing: profile.coverLetterClosing || "Atentamente,",
        signature: profile.coverLetterSignature || `${profile.firstName} ${profile.lastName}`,
        date: profile.coverLetterDate || new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        template: profile.coverLetterTemplate || "professional",
      }));
    }
  }, [profile]);

  // Handle form field changes
  const handleInputChange = (field: keyof PresentationLetterData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
        body: JSON.stringify({
          coverLetterContent: formData.content,
          coverLetterSubject: formData.subject,
          coverLetterTemplate: formData.template,
          coverLetterRecipientName: formData.recipientName,
          coverLetterRecipientTitle: formData.recipientTitle,
          coverLetterCompanyName: formData.companyName,
          coverLetterPosition: formData.position,
          coverLetterClosing: formData.closing,
          coverLetterSignature: formData.signature,
          coverLetterDate: formData.date,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la carta');
      }

      toast.success("Carta guardada", {
        description: "Tu carta de presentación se ha guardado correctamente.",
      });

      await update();
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "No se pudo guardar la carta. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (templateId: string) => {
    setSelectedTemplate(templateId);
    setFormData(prev => ({ ...prev, template: templateId }));
    toast.info("Vista previa", {
      description: "Selecciona 'Generar PDF' para descargar tu carta",
    });
  };

  const handleGeneratePDF = async (templateId: string) => {
    if (!profile) {
      toast.error("Error", {
        description: "No se encontró información del perfil",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const template = letterTemplates.find(t => t.id === templateId);
      if (!template) {
        throw new Error("Plantilla no encontrada");
      }

      // Generate PDF using react-pdf
      const { pdf } = await import('@react-pdf/renderer');
      const TemplateComponent = template.component;
      
      // Ensure all data is properly formatted
      const safeFormData = {
        ...formData,
        content: formData.content || '',
        recipientName: formData.recipientName || '',
        recipientTitle: formData.recipientTitle || '',
        companyName: formData.companyName || '',
        position: formData.position || '',
        subject: formData.subject || '',
        closing: formData.closing || 'Atentamente,',
        signature: formData.signature || `${profile.firstName} ${profile.lastName}`,
        date: formData.date || new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        template: formData.template || 'professional',
      };

      const blob = await pdf(<TemplateComponent 
        profile={profile}
        letterData={safeFormData} 
      />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Carta_Presentacion_${profile.firstName}_${profile.lastName}_${template.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Carta generada", {
        description: `Tu carta de presentación en formato ${template.name} se ha descargado correctamente`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Error", {
        description: "No se pudo generar el PDF. Inténtalo de nuevo.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getTemplateIcon = (style: string) => {
    switch (style) {
      case "Formal":
        return <Type className="h-5 w-5" />;
      case "Contemporáneo":
        return <Layout className="h-5 w-5" />;
      case "Innovador":
        return <Palette className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Cartas de Presentación</h2>
          <p className="text-muted-foreground">
            Crea cartas de presentación profesionales para tus aplicaciones
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
        {/* Letter Content Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contenido de la Carta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipientName">Nombre del Destinatario</Label>
                <Input
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <Label htmlFor="recipientTitle">Cargo del Destinatario</Label>
                <Input
                  id="recipientTitle"
                  value={formData.recipientTitle}
                  onChange={(e) => handleInputChange('recipientTitle', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Ej: Gerente de Recursos Humanos"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Ej: Empresa ABC"
                />
              </div>
              <div>
                <Label htmlFor="position">Posición a la que aplicas</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Ej: Desarrollador Frontend"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                disabled={!isEditing}
                placeholder="Ej: Aplicación para la posición de Desarrollador Frontend"
              />
            </div>
            
            <div>
              <Label htmlFor="content">Contenido de la Carta</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                disabled={!isEditing}
                rows={8}
                placeholder="Escribe el contenido de tu carta de presentación aquí..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="closing">Despedida</Label>
                <Select 
                  value={formData.closing} 
                  onValueChange={(value) => handleInputChange('closing', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Atentamente,">Atentamente,</SelectItem>
                    <SelectItem value="Cordialmente,">Cordialmente,</SelectItem>
                    <SelectItem value="Saludos cordiales,">Saludos cordiales,</SelectItem>
                    <SelectItem value="Respetuosamente,">Respetuosamente,</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="signature">Firma</Label>
                <Input
                  id="signature"
                  value={formData.signature}
                  onChange={(e) => handleInputChange('signature', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Plantillas Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {letterTemplates.map((template) => (
              <div 
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedTemplate === template.id ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTemplateIcon(template.style)}
                    <h3 className="font-semibold">{template.name}</h3>
                  </div>
                  <Badge variant="secondary">{template.style}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Color:</span>
                  <Badge variant="outline">{template.color}</Badge>
                </div>
                <div className="flex space-x-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(template.id);
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Vista Previa
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGeneratePDF(template.id);
                    }}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating ? "Generando..." : "Descargar PDF"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Vista Previa - {letterTemplates.find(t => t.id === selectedTemplate)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <Mail className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Vista Previa de la Carta</h3>
                  <p className="text-muted-foreground">
                    Haz clic en "Descargar PDF" para generar tu carta con la plantilla seleccionada
                  </p>
                </div>
                <Button
                  onClick={() => handleGeneratePDF(selectedTemplate)}
                  disabled={isGenerating}
                  className="mt-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generando PDF..." : "Generar y Descargar PDF"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Consejos para tu Carta de Presentación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Contenido</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Personaliza cada carta para la empresa específica</li>
                <li>• Menciona logros relevantes con números</li>
                <li>• Explica por qué quieres trabajar en esa empresa</li>
                <li>• Mantén un tono profesional pero auténtico</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Estructura</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Párrafo 1: Presentación y posición de interés</li>
                <li>• Párrafo 2: Experiencia y habilidades relevantes</li>
                <li>• Párrafo 3: Motivación y cierre</li>
                <li>• Máximo 3-4 párrafos, 1 página</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
