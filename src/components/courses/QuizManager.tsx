"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus,
  Edit,
  Trash2,
  GripVertical,
  HelpCircle,
  Clock,
  Target,
  Eye,
  EyeOff,
  CheckCircle,
  X
} from "lucide-react";

interface QuizQuestion {
  id?: string;
  question: string;
  type: "multiple_choice" | "true_false" | "short_answer" | "fill_blank" | "essay";
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation?: string;
  points?: number;
  orderIndex?: number;
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

interface QuizManagerProps {
  courseId: string;
  quizzes: CourseQuiz[];
  onQuizzesChange: (quizzes: CourseQuiz[]) => void;
}

export function QuizManager({ courseId, quizzes, onQuizzesChange }: QuizManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<CourseQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimit: 0,
    passingScore: 70,
    isPublished: false,
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      timeLimit: 0,
      passingScore: 70,
      isPublished: false,
    });
    setQuestions([]);
    setEditingQuestion(null);
  };

  const handleCreateQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/courses/${courseId}/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          questions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create quiz");
      }

      const data = await response.json();
      onQuizzesChange([...quizzes, data.quiz]);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditQuiz = async () => {
    if (!editingQuiz) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/courses/${courseId}/quizzes/${editingQuiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          questions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update quiz");
      }

      const data = await response.json();
      onQuizzesChange(quizzes.map(q => q.id === editingQuiz.id ? data.quiz : q));
      setIsEditModalOpen(false);
      setEditingQuiz(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este cuestionario?")) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/courses/${courseId}/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete quiz");
      }

      onQuizzesChange(quizzes.filter(q => q.id !== quizId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (quiz: CourseQuiz) => {
    console.log('Opening edit modal for quiz:', quiz);
    console.log('Quiz questions:', quiz.questions);
    console.log('Questions type:', typeof quiz.questions);
    console.log('Questions is array:', Array.isArray(quiz.questions));

    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || "",
      timeLimit: quiz.timeLimit || 0,
      passingScore: quiz.passingScore,
      isPublished: quiz.isPublished,
    });

    // Process questions - they should already have the correct structure
    const processedQuestions = Array.isArray(quiz.questions)
      ? quiz.questions.map((q: any, index: number) => {
          console.log(`Processing question ${index + 1}:`, q);
          console.log(`  - Type: ${q.type} (typeof: ${typeof q.type})`);
          console.log(`  - Options:`, q.options);
          console.log(`  - CorrectAnswer:`, q.correctAnswer);

          // Ensure the question type is one of the allowed values
          let questionType: "multiple_choice" | "true_false" | "short_answer" | "fill_blank" | "essay" = "multiple_choice";

          if (q.type === "multiple_choice" || q.type === "true_false" ||
              q.type === "short_answer" || q.type === "fill_blank" || q.type === "essay") {
            questionType = q.type;
          } else {
            console.warn(`Unknown question type "${q.type}", defaulting to multiple_choice`);
          }

          // Process options - ensure it's an array of strings
          let options: string[] = [];
          if (questionType === "multiple_choice") {
            if (Array.isArray(q.options)) {
              options = q.options.map((opt: any) => String(opt || ''));
            } else {
              console.warn('Question options is not an array, using empty array');
              options = ['', '', '', ''];
            }
          }

          const processed = {
            id: q.id || `temp-${index}-${Date.now()}`,
            question: q.question || '',
            type: questionType,
            options: options,
            correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
            explanation: q.explanation || '',
            points: q.points || 1,
            orderIndex: q.orderIndex !== undefined ? q.orderIndex : index + 1,
          };

          console.log(`  - Processed:`, processed);
          return processed;
        })
      : [];

    console.log('All processed questions:', processedQuestions);
    setQuestions(processedQuestions);
    setIsEditModalOpen(true);
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: "",
      type: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      points: 1,
      orderIndex: questions.length + 1,
    };
    setEditingQuestion(newQuestion);
    setIsQuestionModalOpen(true);
  };

  const editQuestion = (question: QuizQuestion) => {
    console.log('Editing question:', question);
    console.log('Question type:', question.type);
    console.log('Question type typeof:', typeof question.type);

    // Ensure the question has all required fields with proper types
    const questionToEdit: QuizQuestion = {
      ...question,
      id: question.id || `temp-${Date.now()}`,
      question: question.question || '',
      type: (question.type as any) || 'multiple_choice',
      options: Array.isArray(question.options) ? question.options : ['', '', '', ''],
      correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : 0,
      explanation: question.explanation || '',
      points: question.points || 1,
      orderIndex: question.orderIndex || 0,
    };

    console.log('Processed question for editing:', questionToEdit);
    setEditingQuestion(questionToEdit);
    setIsQuestionModalOpen(true);
  };

  const saveQuestion = () => {
    if (!editingQuestion) return;

    if (editingQuestion.id) {
      // Update existing question
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? editingQuestion : q));
    } else {
      // Add new question
      setQuestions(prev => [...prev, { ...editingQuestion, id: Math.random().toString(36).substr(2, 9) }]);
    }

    setEditingQuestion(null);
    setIsQuestionModalOpen(false);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "Opción Múltiple";
      case "true_false":
        return "Verdadero/Falso";
      case "short_answer":
        return "Respuesta Corta";
      case "fill_blank":
        return "Llenar Espacio";
      case "essay":
        return "Ensayo";
      default:
        console.warn('Unknown question type:', type);
        return `Desconocido (${type})`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cuestionarios del Curso</h3>
          <p className="text-sm text-muted-foreground">
            Crea cuestionarios para evaluar el progreso de los estudiantes
          </p>
        </div>
        <div className="flex space-x-2">
          {/* Debug button - remove in production */}
          {process.env.NODE_ENV === 'development' && quizzes.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log('Debug: All quizzes:', quizzes);
                quizzes.forEach((quiz, index) => {
                  console.log(`Debug: Quiz ${index}:`, quiz);
                  console.log(`Debug: Quiz ${index} questions:`, quiz.questions);
                });
              }}
            >
              Debug Quizzes
            </Button>
          )}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Cuestionario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Cuestionario</DialogTitle>
              <DialogDescription>
                Crea un cuestionario para evaluar a los estudiantes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título del Cuestionario</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ingresa el título del cuestionario"
                  />
                </div>
                
                <div>
                  <Label htmlFor="passingScore">Puntuación Mínima (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                    placeholder="70"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el cuestionario"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeLimit">Límite de Tiempo (minutos)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="0"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                    placeholder="0 (sin límite)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                  />
                  <Label htmlFor="isPublished">Publicar Cuestionario</Label>
                </div>
              </div>

              {/* Questions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium">Preguntas</Label>
                  <Button onClick={addQuestion} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Pregunta
                  </Button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay preguntas agregadas</p>
                    <p className="text-sm text-muted-foreground">Haz clic en "Agregar Pregunta" para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Pregunta {index + 1}
                              </span>
                              <Badge variant="outline">
                                {getQuestionTypeLabel(question.type)}
                              </Badge>
                              <Badge variant="secondary">
                                {question.points} punto{question.points !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <p className="text-sm">{question.question}</p>
                            {question.type === "multiple_choice" && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">Opciones:</p>
                                <ul className="text-xs text-muted-foreground ml-4">
                                  {question.options.map((option, optIndex) => (
                                    <li key={optIndex}>
                                      {optIndex + 1}. {option}
                                      {optIndex === question.correctAnswer && (
                                        <span className="text-green-600 ml-2">✓ Correcta</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editQuestion(question)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeQuestion(question.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateQuiz} disabled={isLoading || questions.length === 0}>
                {isLoading ? "Creando..." : "Crear Cuestionario"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay cuestionarios</h3>
            <p className="text-muted-foreground mb-4">
              Crea cuestionarios para evaluar el progreso de los estudiantes
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Cuestionario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz, index) => (
            <Card key={quiz.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">{quiz.title}</h4>
                      {quiz.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {quiz.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <HelpCircle className="h-4 w-4 mr-1" />
                          {quiz.questions.length} preguntas
                        </div>
                        {quiz.timeLimit && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {quiz.timeLimit} min
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Target className="h-4 w-4 mr-1" />
                          {quiz.passingScore}% mínimo
                        </div>
                        {quiz.isPublished ? (
                          <Badge variant="default">Publicado</Badge>
                        ) : (
                          <Badge variant="secondary">Borrador</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(quiz)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Question Modal */}
      <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion?.id ? "Editar Pregunta" : "Agregar Pregunta"}
            </DialogTitle>
            <DialogDescription>
              Configura la pregunta y sus opciones de respuesta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Pregunta</Label>
              <Textarea
                id="question"
                value={editingQuestion?.question || ""}
                onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, question: e.target.value } : null)}
                placeholder="Ingresa la pregunta"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questionType">Tipo de Pregunta</Label>
                <Select
                  value={editingQuestion?.type || "multiple_choice"}
                  onValueChange={(value: any) => {
                    console.log('Type changing to:', value);
                    setEditingQuestion(prev => prev ? { ...prev, type: value } : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo">
                      {editingQuestion?.type ? getQuestionTypeLabel(editingQuestion.type) : "Selecciona el tipo"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Opción Múltiple</SelectItem>
                    <SelectItem value="true_false">Verdadero/Falso</SelectItem>
                    <SelectItem value="short_answer">Respuesta Corta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="points">Puntos</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={editingQuestion?.points || 1}
                  onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, points: parseInt(e.target.value) || 1 } : null)}
                />
              </div>
            </div>

            {editingQuestion?.type === "multiple_choice" && (
              <div>
                <Label>Opciones de Respuesta</Label>
                <div className="space-y-2 mt-2">
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={editingQuestion.correctAnswer === index}
                        onChange={() => setEditingQuestion(prev => prev ? { ...prev, correctAnswer: index } : null)}
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options];
                          newOptions[index] = e.target.value;
                          setEditingQuestion(prev => prev ? { ...prev, options: newOptions } : null);
                        }}
                        placeholder={`Opción ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editingQuestion?.type === "true_false" && (
              <div>
                <Label>Respuesta Correcta</Label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={editingQuestion.correctAnswer === "true"}
                      onChange={() => setEditingQuestion(prev => prev ? { ...prev, correctAnswer: "true" } : null)}
                    />
                    <span>Verdadero</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={editingQuestion.correctAnswer === "false"}
                      onChange={() => setEditingQuestion(prev => prev ? { ...prev, correctAnswer: "false" } : null)}
                    />
                    <span>Falso</span>
                  </label>
                </div>
              </div>
            )}

            {editingQuestion?.type === "short_answer" && (
              <div>
                <Label htmlFor="correctAnswer">Respuesta Correcta</Label>
                <Input
                  id="correctAnswer"
                  value={editingQuestion.correctAnswer as string || ""}
                  onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, correctAnswer: e.target.value } : null)}
                  placeholder="Ingresa la respuesta correcta"
                />
              </div>
            )}

            <div>
              <Label htmlFor="explanation">Explicación (Opcional)</Label>
              <Textarea
                id="explanation"
                value={editingQuestion?.explanation || ""}
                onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, explanation: e.target.value } : null)}
                placeholder="Explica por qué esta es la respuesta correcta"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuestionModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveQuestion} disabled={!editingQuestion?.question}>
              {editingQuestion?.id ? "Actualizar" : "Agregar"} Pregunta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quiz Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cuestionario</DialogTitle>
            <DialogDescription>
              Modifica la información del cuestionario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Título del Cuestionario</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ingresa el título del cuestionario"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-passingScore">Puntuación Mínima (%)</Label>
                <Input
                  id="edit-passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                  placeholder="70"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el cuestionario"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-timeLimit">Límite de Tiempo (minutos)</Label>
                <Input
                  id="edit-timeLimit"
                  type="number"
                  min="0"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                  placeholder="0 (sin límite)"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                />
                <Label htmlFor="edit-isPublished">Publicar Cuestionario</Label>
              </div>
            </div>

            {/* Questions Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">Preguntas</Label>
                <Button onClick={addQuestion} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Pregunta
                </Button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay preguntas agregadas</p>
                  <p className="text-sm text-muted-foreground">Haz clic en "Agregar Pregunta" para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Pregunta {index + 1}
                            </span>
                            <Badge variant="outline">
                              {getQuestionTypeLabel(question.type)}
                            </Badge>
                            <Badge variant="secondary">
                              {question.points} punto{question.points !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <p className="text-sm">{question.question}</p>
                          {question.type === "multiple_choice" && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Opciones:</p>
                              <ul className="text-xs text-muted-foreground ml-4">
                                {question.options.map((option, optIndex) => (
                                  <li key={optIndex}>
                                    {optIndex + 1}. {option}
                                    {optIndex === question.correctAnswer && (
                                      <span className="text-green-600 ml-2">✓ Correcta</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editQuestion(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(question.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditQuiz} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
