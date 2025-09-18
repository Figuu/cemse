"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useCVBuilder } from "./CVBuilderContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  FileText, 
  Download, 
  Eye,
  Palette,
  Layout,
  Type
} from "lucide-react";
import { CVTemplate1 } from "./templates/CVTemplate1";
import { CVTemplate2 } from "./templates/CVTemplate2";
import { CVTemplate3 } from "./templates/CVTemplate3";
import { SimpleCVTemplate } from "./templates/SimpleCVTemplate";
import { MinimalCVTemplate } from "./templates/MinimalCVTemplate";
import { UltraSimpleCVTemplate } from "./templates/UltraSimpleCVTemplate";
import { generateSimpleCV, generateHTMLCV, generateCanvasCV } from "./utils/pdfGenerator";

interface CVTemplate {
  id: string;
  name: string;
  description: string;
  style: string;
  color: string;
  preview: string;
  component: React.ComponentType<any>;
}

const cvTemplates: CVTemplate[] = [
  {
    id: "reliable",
    name: "Profesional",
    description: "Plantilla confiable y optimizada para máxima compatibilidad",
    style: "Confiable",
    color: "Azul",
    preview: "Diseño limpio y profesional garantizado",
    component: UltraSimpleCVTemplate,
  },
  {
    id: "modern",
    name: "Moderno",
    description: "Diseño limpio y profesional con colores modernos",
    style: "Minimalista",
    color: "Azul",
    preview: "Diseño limpio con secciones bien definidas",
    component: CVTemplate1,
  },
  {
    id: "classic",
    name: "Clásico",
    description: "Estilo tradicional y elegante para sectores conservadores",
    style: "Tradicional",
    color: "Negro",
    preview: "Formato clásico con tipografía serif",
    component: CVTemplate2,
  },
  {
    id: "creative",
    name: "Creativo",
    description: "Diseño innovador para perfiles creativos y tecnológicos",
    style: "Innovador",
    color: "Verde",
    preview: "Layout asimétrico con elementos visuales",
    component: CVTemplate3,
  },
];

// Utility function to sanitize data for PDF generation
const sanitizeProfileData = (profile: any) => {
  const sanitizeString = (str: any) => {
    if (typeof str !== 'string') return '';
    // Remove any problematic characters and limit length
    return str
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '')
      .replace(/[\r\n\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500);
  };

  const sanitizeArray = (arr: any) => {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, 5).map(item => {
      if (typeof item === 'object' && item !== null) {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(item)) {
          if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
          } else if (typeof value === 'number') {
            sanitized[key] = isNaN(value) ? 0 : Math.max(0, Math.min(value, 999999));
          } else if (typeof value === 'boolean') {
            sanitized[key] = Boolean(value);
          } else if (value === null || value === undefined) {
            sanitized[key] = '';
          } else {
            sanitized[key] = sanitizeString(String(value));
          }
        }
        return sanitized;
      }
      return sanitizeString(item);
    });
  };

  return {
    ...profile,
    firstName: sanitizeString(profile.firstName),
    lastName: sanitizeString(profile.lastName),
    email: sanitizeString(profile.email),
    phone: sanitizeString(profile.phone),
    address: sanitizeString(profile.address),
    city: sanitizeString(profile.city),
    state: sanitizeString(profile.state),
    country: sanitizeString(profile.country),
    jobTitle: sanitizeString(profile.jobTitle),
    professionalSummary: sanitizeString(profile.professionalSummary),
    experienceLevel: sanitizeString(profile.experienceLevel),
    targetPosition: sanitizeString(profile.targetPosition),
    targetCompany: sanitizeString(profile.targetCompany),
    educationLevel: sanitizeString(profile.educationLevel),
    currentInstitution: sanitizeString(profile.currentInstitution),
    currentDegree: sanitizeString(profile.currentDegree),
    universityName: sanitizeString(profile.universityName),
    universityStatus: sanitizeString(profile.universityStatus),
    skills: sanitizeArray(profile.skills),
    skillsWithLevel: sanitizeArray(profile.skillsWithLevel),
    languages: sanitizeArray(profile.languages),
    relevantSkills: sanitizeArray(profile.relevantSkills),
    interests: sanitizeArray(profile.interests),
    workExperience: sanitizeArray(profile.workExperience),
    educationHistory: sanitizeArray(profile.educationHistory),
    projects: sanitizeArray(profile.projects),
    achievements: sanitizeArray(profile.achievements),
    academicAchievements: sanitizeArray(profile.academicAchievements),
    extracurricularActivities: sanitizeArray(profile.extracurricularActivities),
    websites: sanitizeArray(profile.websites),
    socialLinks: sanitizeArray(profile.socialLinks),
    entrepreneurships: sanitizeArray(profile.entrepreneurships),
    youthApplications: sanitizeArray(profile.youthApplications),
    companyEmployments: sanitizeArray(profile.companyEmployments),
    entrepreneurshipPosts: sanitizeArray(profile.entrepreneurshipPosts),
    entrepreneurshipResources: sanitizeArray(profile.entrepreneurshipResources),
  };
};

export function CVTemplatesTab() {
  const { data: session } = useSession();
  const { profile, isLoading: profileLoading } = useCVBuilder();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("reliable");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handlePreview = (templateId: string) => {
    setSelectedTemplate(templateId);
    toast.info("Vista previa", {
      description: "Selecciona 'Generar PDF' para descargar tu CV",
    });
  };

  const handleTestPDF = async () => {
    setIsTesting(true);
    try {
      const { testAllGenerationMethods } = await import('./utils/testPDF');
      const result = await testAllGenerationMethods();
      
      if (result.success) {
        toast.success("Test PDF exitoso", {
          description: `${result.workingMethods}/3 métodos de generación funcionan correctamente`,
        });
      } else {
        toast.error("Test PDF falló", {
          description: "Hay problemas con todos los métodos de generación de PDF",
        });
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast.error("Error en test", {
        description: "No se pudo ejecutar el test de PDF",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Safe PDF generation function
  const generatePDFSafely = async (TemplateComponent: any, profileData: any, templateName: string) => {
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const pdfDoc = pdf(<TemplateComponent profile={profileData} />);
      const blob = await pdfDoc.toBlob();
      return { blob, success: true };
    } catch (error) {
      console.error(`PDF generation failed for ${templateName}:`, error);
      return { blob: null, success: false, error };
    }
  };

  const handleGeneratePDF = async (templateId: string) => {
    if (!profile) {
      toast.error("Error", {
        description: "No se encontró información del perfil",
      });
      return;
    }

    setIsGenerating(true);
    
    // Create the most basic profile data possible (outside try block for fallback access)
    const basicProfile = {
      firstName: profile.firstName || 'Usuario',
      lastName: profile.lastName || 'CEMSE',
      email: profile.email || 'email@ejemplo.com',
      phone: profile.phone || 'Teléfono',
      jobTitle: profile.jobTitle || 'Profesional',
      summary: profile.professionalSummary || 'Profesional dedicado con experiencia.',
      institution: profile.currentInstitution || 'Institución Educativa',
      degree: profile.currentDegree || profile.educationLevel || 'Título',
      skills: 'Habilidades técnicas, Trabajo en equipo, Comunicación',
      languages: 'Español: Nativo, Inglés: Intermedio'
    };
    
    try {

      // Import react-pdf dynamically
      const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
      
      // Create styles inline to avoid any issues
      const styles = StyleSheet.create({
        page: {
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          padding: 40,
          fontFamily: 'Helvetica',
          fontSize: 12,
          lineHeight: 1.6,
        },
        header: {
          textAlign: 'center',
          marginBottom: 30,
        },
        name: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#000000',
          marginBottom: 5,
        },
        title: {
          fontSize: 14,
          color: '#333333',
          marginBottom: 10,
        },
        contact: {
          fontSize: 10,
          color: '#666666',
        },
        section: {
          marginBottom: 20,
        },
        sectionTitle: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#000000',
          marginBottom: 8,
        },
        text: {
          fontSize: 11,
          color: '#333333',
          marginBottom: 5,
        },
      });

      // Create the PDF document inline
      const MyDocument = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.name}>{basicProfile.firstName} {basicProfile.lastName}</Text>
              <Text style={styles.title}>{basicProfile.jobTitle}</Text>
              <Text style={styles.contact}>{basicProfile.email} | {basicProfile.phone}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumen Profesional</Text>
              <Text style={styles.text}>{basicProfile.summary}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Educación</Text>
              <Text style={styles.text}>{basicProfile.institution}</Text>
              <Text style={styles.text}>{basicProfile.degree}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habilidades</Text>
              <Text style={styles.text}>{basicProfile.skills}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Idiomas</Text>
              <Text style={styles.text}>{basicProfile.languages}</Text>
            </View>
          </Page>
        </Document>
      );

      // Generate PDF
      const pdfDoc = pdf(<MyDocument />);
      const blob = await pdfDoc.toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_${basicProfile.firstName}_${basicProfile.lastName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CV generado", {
        description: "Tu CV se ha descargado correctamente",
      });
      
    } catch (error) {
      console.error('Main PDF generation failed, trying fallback:', error);
      
      try {
        // Try the simple PDF generator as fallback
        const blob = await generateSimpleCV(basicProfile);
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CV_${basicProfile.firstName}_${basicProfile.lastName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("CV generado (método alternativo)", {
          description: "Tu CV se ha descargado usando un método alternativo",
        });
        
      } catch (fallbackError) {
        console.error('Fallback PDF generation also failed, trying canvas:', fallbackError);
        
        try {
          // Try HTML-based generation as last resort
          const blob = await generateHTMLCV(basicProfile);
          
          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `CV_${basicProfile.firstName}_${basicProfile.lastName}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast.success("CV generado (archivo HTML)", {
            description: "Tu CV se ha descargado como archivo HTML. Puedes abrirlo en tu navegador e imprimirlo como PDF.",
          });
          
        } catch (canvasError) {
          console.error('All PDF generation methods failed:', canvasError);
          
          toast.error("Error al generar PDF", {
            description: "No se pudo generar el PDF con ningún método. Por favor, intenta de nuevo más tarde.",
          });
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getTemplateIcon = (style: string) => {
    switch (style) {
      case "Minimalista":
        return <Layout className="h-5 w-5" />;
      case "Tradicional":
        return <Type className="h-5 w-5" />;
      case "Innovador":
        return <Palette className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Plantillas de CV</h2>
          <p className="text-muted-foreground">
            Cargando datos del perfil...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando información del CV...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Plantillas de CV</h2>
        <p className="text-muted-foreground">
          Selecciona una plantilla y genera tu CV profesional en PDF
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cvTemplates.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTemplateIcon(template.style)}
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <Badge variant="secondary">{template.style}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Color:</span>
                <Badge variant="outline">{template.color}</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Vista previa:</span>
                <span className="text-sm">{template.preview}</span>
              </div>

              <div className="flex space-x-2 pt-2">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Section */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Vista Previa - {cvTemplates.find(t => t.id === selectedTemplate)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Vista Previa del CV</h3>
                  <p className="text-muted-foreground">
                    Haz clic en "Descargar PDF" para generar tu CV con la plantilla seleccionada
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleGeneratePDF(selectedTemplate)}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating ? "Generando PDF..." : "Generar y Descargar PDF"}
                  </Button>
                  
                  <Button
                    onClick={handleTestPDF}
                    disabled={isTesting}
                    variant="outline"
                    className="px-3"
                  >
                    {isTesting ? "Probando..." : "Test PDF"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Consejos para tu CV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Contenido</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Incluye información de contacto actualizada</li>
                <li>• Destaca tus habilidades más relevantes</li>
                <li>• Menciona logros específicos con números</li>
                <li>• Mantén un resumen profesional conciso</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Formato</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Usa un diseño limpio y profesional</li>
                <li>• Mantén consistencia en la tipografía</li>
                <li>• Limita el CV a 1-2 páginas máximo</li>
                <li>• Guarda en formato PDF para mejor compatibilidad</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
