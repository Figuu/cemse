"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  FileText,
  Clock,
  Target,
  Eye,
  Play
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit?: number;
  passingScore: number;
  isPublished: boolean;
  questions: any[];
}

interface LessonQuizzesProps {
  lessonId: string;
  courseId: string;
  quizzes: Quiz[];
  onQuizzesChange: (quizzes: Quiz[]) => void;
}

export function LessonQuizzes({ lessonId, courseId, quizzes, onQuizzesChange }: LessonQuizzesProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimit: "",
    passingScore: 70,
    isPublished: false,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      timeLimit: "",
      passingScore: 70,
      isPublished: false,
    });
  };

  const handleCreateQuiz = async () => {
    if (!formData.title) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/courses/${courseId}/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
          passingScore: formData.passingScore,
          isPublished: formData.isPublished,
          lessonId: lessonId,
          questions: [],
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
          title: formData.title,
          description: formData.description,
          timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
          passingScore: formData.passingScore,
          isPublished: formData.isPublished,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update quiz");
      }

      const data = await response.json();
      const updatedQuizzes = quizzes.map(q => 
        q.id === editingQuiz.id ? data.quiz : q
      );
      onQuizzesChange(updatedQuizzes);
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

  const openEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit?.toString() || "",
      passingScore: quiz.passingScore,
      isPublished: quiz.isPublished,
    });
    setIsEditModalOpen(true);
  };

  const formatTimeLimit = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}min`
        : `${hours}h`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">Cuestionarios de la Lección</h4>
          <p className="text-sm text-muted-foreground">
            Crea y gestiona cuestionarios para esta lección
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Cuestionario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Cuestionario</DialogTitle>
              <DialogDescription>
                Crea un nuevo cuestionario para esta lección
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título del cuestionario"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del cuestionario"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeLimit">Límite de Tiempo (minutos)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: e.target.value }))}
                    placeholder="Sin límite"
                    min="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="passingScore">Puntuación Mínima (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                />
                <Label htmlFor="isPublished">Publicar cuestionario</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateQuiz} disabled={!formData.title || isLoading}>
                {isLoading ? "Creando..." : "Crear Cuestionario"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay cuestionarios</h3>
            <p className="text-muted-foreground">
              Crea cuestionarios para evaluar el aprendizaje de esta lección
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <h5 className="font-medium">{quiz.title}</h5>
                      {quiz.description && (
                        <p className="text-sm text-muted-foreground">
                          {quiz.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                          {quiz.isPublished ? "Publicado" : "Borrador"}
                        </Badge>
                        {quiz.timeLimit && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeLimit(quiz.timeLimit)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Target className="h-3 w-3" />
                          <span>{quiz.passingScore}%</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <span>{quiz.questions.length} preguntas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to quiz editor
                        window.open(`/courses/${courseId}/quizzes/${quiz.id}/edit`, '_blank');
                      }}
                    >
                      <Edit className="h-4 w-4" />
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cuestionario</DialogTitle>
            <DialogDescription>
              Modifica la información del cuestionario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del cuestionario"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del cuestionario"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-timeLimit">Límite de Tiempo (minutos)</Label>
                <Input
                  id="edit-timeLimit"
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: e.target.value }))}
                  placeholder="Sin límite"
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-passingScore">Puntuación Mínima (%)</Label>
                <Input
                  id="edit-passingScore"
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
              />
              <Label htmlFor="edit-isPublished">Publicar cuestionario</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditQuiz} disabled={!formData.title || isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
