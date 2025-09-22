"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  BookOpen,
  Play,
  FileText,
  HelpCircle
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useSession } from "next-auth/react";
import { Course } from "@/hooks/useCourses";
import { ModuleManager } from "@/components/courses/ModuleManager";
import { LessonManager } from "@/components/courses/LessonManager";
import { QuizManager } from "@/components/courses/QuizManager";

interface CourseModule {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  estimatedDuration: number;
  prerequisites: string[];
  lessons: Array<{
    id: string;
    title: string;
    orderIndex: number;
  }>;
}

interface CourseLesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  contentType: "TEXT" | "VIDEO" | "AUDIO" | "DOCUMENT";
  videoUrl: string | null;
  audioUrl: string | null;
  duration: number | null;
  orderIndex: number;
  isRequired: boolean;
  isPreview: boolean;
  attachments: Record<string, any>;
}

interface CourseQuiz {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  timeLimit: number | null;
  passingScore: number;
  isPublished: boolean;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id?: string;
  question: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  options: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
  orderIndex: number;
}

export default function CourseEditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [quizzes, setQuizzes] = useState<CourseQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [moduleLessons, setModuleLessons] = useState<CourseLesson[]>([]);

  // Course form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    level: "BEGINNER" as const,
    category: "TECHNOLOGY" as const,
    duration: 0,
    objectives: [] as string[],
    prerequisites: [] as string[],
    tags: [] as string[],
    certification: true,
    includedMaterials: [] as string[],
  });

  // New objective/prerequisite/tag input
  const [newObjective, setNewObjective] = useState("");
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newMaterial, setNewMaterial] = useState("");

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching course data for courseId:", courseId);
      
      const response = await fetch(`/api/courses/${courseId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch course:", response.status, errorText);
        throw new Error(`Failed to fetch course: ${response.status}`);
      }

      const data = await response.json();
      console.log("Course data received:", data);
      setCourse(data.course);
      
      // Set form data
      setFormData({
        title: data.course.title,
        description: data.course.description,
        shortDescription: data.course.shortDescription || "",
        level: data.course.level,
        category: data.course.category,
        duration: data.course.duration,
        objectives: data.course.objectives || [],
        prerequisites: data.course.prerequisites || [],
        tags: data.course.tags || [],
        certification: data.course.certification,
        includedMaterials: data.course.includedMaterials || [],
      });

      // Set modules and quizzes
      setModules(data.course.modules || []);
      
      // Fetch quizzes separately (only if course was loaded successfully)
      try {
        await fetchQuizzes();
      } catch (quizError) {
        console.warn("Failed to fetch quizzes:", quizError);
        // Don't set this as a fatal error, just log it
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModuleLessons = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch lessons");
      }

      const data = await response.json();
      setModuleLessons(data.lessons || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch lessons");
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    fetchModuleLessons(moduleId);
  };

  const fetchQuizzes = async () => {
    try {
      console.log("Fetching quizzes for courseId:", courseId);
      const response = await fetch(`/api/courses/${courseId}/quizzes`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch quizzes:", response.status, errorText);
        throw new Error(`Failed to fetch quizzes: ${response.status}`);
      }

      const data = await response.json();
      console.log("Quizzes data received:", data);
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.warn("Failed to fetch quizzes:", err);
      // Don't set this as a fatal error, just initialize with empty array
      setQuizzes([]);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update course");
      }

      // Refresh course data
      await fetchCourseData();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setIsSaving(false);
    }
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()]
      }));
      setNewObjective("");
    }
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }));
      setNewPrerequisite("");
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addMaterial = () => {
    if (newMaterial.trim()) {
      setFormData(prev => ({
        ...prev,
        includedMaterials: [...prev.includedMaterials, newMaterial.trim()]
      }));
      setNewMaterial("");
    }
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includedMaterials: prev.includedMaterials.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar el curso</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["INSTITUTION", "SUPERADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <Button variant="outline" size="sm" onClick={() => router.push('/courses')} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">Editar Curso</h1>
              <p className="text-sm text-muted-foreground sm:text-base">{course.title}</p>
            </div>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)} className="w-full sm:w-auto">
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="basic" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Información Básica</span>
              <span className="sm:hidden">Básica</span>
            </TabsTrigger>
            <TabsTrigger value="modules" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Módulos</span>
              <span className="sm:hidden">Módulos</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Lecciones</span>
              <span className="sm:hidden">Lecciones</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Cuestionarios</span>
              <span className="sm:hidden">Quiz</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título del Curso</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ingresa el título del curso"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="shortDescription">Descripción Corta</Label>
                    <Textarea
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                      placeholder="Una breve descripción del curso"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción Completa</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción detallada del curso"
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="level">Nivel</Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}
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

                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TECHNOLOGY">Tecnología</SelectItem>
                          <SelectItem value="BUSINESS">Negocios</SelectItem>
                          <SelectItem value="DESIGN">Diseño</SelectItem>
                          <SelectItem value="MARKETING">Marketing</SelectItem>
                          <SelectItem value="LANGUAGES">Idiomas</SelectItem>
                          <SelectItem value="HEALTH">Salud</SelectItem>
                          <SelectItem value="EDUCATION">Educación</SelectItem>
                          <SelectItem value="ARTS">Artes</SelectItem>
                          <SelectItem value="SCIENCE">Ciencia</SelectItem>
                          <SelectItem value="ENGINEERING">Ingeniería</SelectItem>
                          <SelectItem value="OTHER">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duración (minutos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      placeholder="Duración estimada en minutos"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Objetivos de Aprendizaje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      placeholder="Agregar objetivo de aprendizaje"
                      onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                    />
                    <Button onClick={addObjective} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{objective}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeObjective(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prerrequisitos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newPrerequisite}
                      onChange={(e) => setNewPrerequisite(e.target.value)}
                      placeholder="Agregar prerrequisito"
                      onKeyPress={(e) => e.key === 'Enter' && addPrerequisite()}
                    />
                    <Button onClick={addPrerequisite} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.prerequisites.map((prerequisite, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{prerequisite}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrerequisite(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Etiquetas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Agregar etiqueta"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => removeTag(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Materiales Incluidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    placeholder="Agregar material incluido"
                    onKeyPress={(e) => e.key === 'Enter' && addMaterial()}
                  />
                  <Button onClick={addMaterial} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.includedMaterials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{material}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMaterial(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <ModuleManager
              courseId={courseId}
              modules={modules}
              onModulesChange={setModules}
            />
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            {modules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay módulos</h3>
                  <p className="text-muted-foreground mb-4">
                    Primero crea módulos para poder agregar lecciones
                  </p>
                  <Button onClick={() => setActiveTab("modules")}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Ir a Módulos
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Seleccionar Módulo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modules.map((module) => (
                        <div
                          key={module.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedModuleId === module.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleModuleSelect(module.id)}
                        >
                          <h4 className="font-semibold">{module.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {module.lessons.length} lecciones • {module.estimatedDuration} min
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedModuleId && (
                  <LessonManager
                    courseId={courseId}
                    moduleId={selectedModuleId}
                    lessons={moduleLessons}
                    onLessonsChange={setModuleLessons}
                  />
                )}
              </div>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <QuizManager
              courseId={courseId}
              quizzes={quizzes}
              onQuizzesChange={setQuizzes}
            />
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
