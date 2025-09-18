"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  CheckCircle,
  XCircle,
  Type,
  List,
  FileText,
  Clock,
  Save,
  Eye,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'text-input' | 'essay';
  question: string;
  points: number;
  timeLimit?: number; // in seconds
  options?: QuestionOption[]; // for multiple choice and true/false
  correctAnswer?: string; // for text input
  explanation?: string;
  orderIndex: number;
}

interface QuizQuestionEditorProps {
  quizId: string;
  questions: QuizQuestion[];
  onQuestionsChange: (questions: QuizQuestion[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function QuizQuestionEditor({
  quizId,
  questions,
  onQuestionsChange,
  isOpen,
  onClose,
}: QuizQuestionEditorProps) {
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questionForm, setQuestionForm] = useState<{
    type: 'multiple-choice' | 'true-false' | 'text-input' | 'essay';
    question: string;
    points: number;
    timeLimit: number;
    explanation: string;
  }>({
    type: 'multiple-choice',
    question: '',
    points: 1,
    timeLimit: 0,
    explanation: '',
  });

  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const resetForm = () => {
    setQuestionForm({
      type: 'multiple-choice',
      question: '',
      points: 1,
      timeLimit: 0,
      explanation: '',
    });
    setOptions([]);
    setCorrectAnswer('');
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      type: question.type,
      question: question.question,
      points: question.points,
      timeLimit: question.timeLimit || 0,
      explanation: question.explanation || '',
    });
    
    if (question.options) {
      setOptions(question.options);
    } else {
      setOptions([]);
    }
    
    setCorrectAnswer(question.correctAnswer || '');
    setIsCreateModalOpen(true);
  };

  const addOption = () => {
    const newOption: QuestionOption = {
      id: Date.now().toString(),
      text: '',
      isCorrect: false,
      explanation: '',
    };
    setOptions([...options, newOption]);
  };

  const updateOption = (optionId: string, field: keyof QuestionOption, value: any) => {
    setOptions(options.map(opt => 
      opt.id === optionId ? { ...opt, [field]: value } : opt
    ));
  };

  const removeOption = (optionId: string) => {
    setOptions(options.filter(opt => opt.id !== optionId));
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.question.trim()) {
      setError('La pregunta es requerida');
      return;
    }

    if (questionForm.type === 'multiple-choice' && options.length < 2) {
      setError('Se requieren al menos 2 opciones para preguntas de opción múltiple');
      return;
    }

    if (questionForm.type === 'multiple-choice' && !options.some(opt => opt.isCorrect)) {
      setError('Debe seleccionar al menos una respuesta correcta');
      return;
    }

    if (questionForm.type === 'text-input' && !correctAnswer.trim()) {
      setError('La respuesta correcta es requerida para preguntas de texto');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const questionData: QuizQuestion = {
        id: editingQuestion?.id || Date.now().toString(),
        type: questionForm.type,
        question: questionForm.question,
        points: questionForm.points,
        timeLimit: questionForm.timeLimit || undefined,
        explanation: questionForm.explanation || undefined,
        orderIndex: editingQuestion?.orderIndex || questions.length,
        ...(questionForm.type === 'multiple-choice' || questionForm.type === 'true-false' 
          ? { options: options.filter(opt => opt.text.trim()) }
          : { correctAnswer: correctAnswer.trim() }
        ),
      };

      let updatedQuestions;
      if (editingQuestion) {
        updatedQuestions = questions.map(q => q.id === editingQuestion.id ? questionData : q);
      } else {
        updatedQuestions = [...questions, questionData];
      }

      onQuestionsChange(updatedQuestions);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la pregunta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      const updatedQuestions = questions.filter(q => q.id !== questionId);
      onQuestionsChange(updatedQuestions);
    }
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updatedQuestions = [...questions];
    const [movedQuestion] = updatedQuestions.splice(currentIndex, 1);
    updatedQuestions.splice(newIndex, 0, movedQuestion);

    // Update order indices
    const reorderedQuestions = updatedQuestions.map((q, index) => ({
      ...q,
      orderIndex: index,
    }));

    onQuestionsChange(reorderedQuestions);
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice': return <List className="h-4 w-4 text-blue-500" />;
      case 'true-false': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'text-input': return <Type className="h-4 w-4 text-purple-500" />;
      case 'essay': return <FileText className="h-4 w-4 text-orange-500" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple-choice': return 'Opción Múltiple';
      case 'true-false': return 'Verdadero/Falso';
      case 'text-input': return 'Texto Libre';
      case 'essay': return 'Ensayo';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Preguntas del Cuestionario</h3>
          <p className="text-sm text-muted-foreground">
            {questions.length} pregunta{questions.length !== 1 ? 's' : ''} configurada{questions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Pregunta
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <HelpCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No hay preguntas en este cuestionario
              </p>
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Pregunta
              </Button>
            </CardContent>
          </Card>
        ) : (
          questions
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((question, index) => (
              <Card key={question.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getQuestionTypeIcon(question.type)}
                          <Badge variant="outline">
                            {getQuestionTypeLabel(question.type)}
                          </Badge>
                          <Badge variant="secondary">
                            {question.points} punto{question.points !== 1 ? 's' : ''}
                          </Badge>
                          {question.timeLimit && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {question.timeLimit}s
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium mb-2">{question.question}</p>
                        
                        {question.type === 'multiple-choice' && question.options && (
                          <div className="space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div key={option.id} className="flex items-center space-x-2 text-sm">
                                <span className="w-4 text-center">
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                <span className={option.isCorrect ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                  {option.text}
                                </span>
                                {option.isCorrect && (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === 'true-false' && question.options && (
                          <div className="space-y-1">
                            {question.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2 text-sm">
                                <span className={option.isCorrect ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                  {option.text}
                                </span>
                                {option.isCorrect && (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === 'text-input' && question.correctAnswer && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Respuesta correcta:</span> {question.correctAnswer}
                          </div>
                        )}

                        {question.type === 'essay' && (
                          <div className="text-sm text-gray-600">
                            Pregunta de desarrollo (sin respuesta específica)
                          </div>
                        )}

                        {question.explanation && (
                          <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            <strong>Explicación:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveQuestion(question.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveQuestion(question.id, 'down')}
                        disabled={index === questions.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Create/Edit Question Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion 
                ? 'Modifica los detalles de la pregunta'
                : 'Crea una nueva pregunta para el cuestionario'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Question Type */}
            <div>
              <Label htmlFor="question-type">Tipo de Pregunta</Label>
              <Select
                value={questionForm.type}
                onValueChange={(value: any) => {
                  setQuestionForm(prev => ({ ...prev, type: value }));
                  if (value === 'multiple-choice') {
                    setOptions([
                      { id: '1', text: '', isCorrect: false },
                      { id: '2', text: '', isCorrect: false },
                    ]);
                  } else if (value === 'true-false') {
                    setOptions([
                      { id: '1', text: 'Verdadero', isCorrect: false },
                      { id: '2', text: 'Falso', isCorrect: false },
                    ]);
                  } else {
                    setOptions([]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Opción Múltiple</SelectItem>
                  <SelectItem value="true-false">Verdadero/Falso</SelectItem>
                  <SelectItem value="text-input">Texto Libre</SelectItem>
                  <SelectItem value="essay">Ensayo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question Text */}
            <div>
              <Label htmlFor="question-text">Pregunta</Label>
              <Textarea
                id="question-text"
                value={questionForm.question}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Escribe tu pregunta aquí..."
                rows={3}
              />
            </div>

            {/* Points and Time Limit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="question-points">Puntos</Label>
                <Input
                  id="question-points"
                  type="number"
                  min="1"
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="question-time">Tiempo Límite (segundos)</Label>
                <Input
                  id="question-time"
                  type="number"
                  min="0"
                  value={questionForm.timeLimit}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                  placeholder="0 = Sin límite"
                />
              </div>
            </div>

            {/* Options for Multiple Choice and True/False */}
            {(questionForm.type === 'multiple-choice' || questionForm.type === 'true-false') && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Opciones de Respuesta</Label>
                  {questionForm.type === 'multiple-choice' && (
                    <Button size="sm" onClick={addOption}>
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Opción
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) => updateOption(option.id, 'isCorrect', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-green-600">
                          Correcta
                        </span>
                      </div>
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                        placeholder={`Opción ${index + 1}`}
                        className="flex-1"
                      />
                      {questionForm.type === 'multiple-choice' && options.length > 2 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeOption(option.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Correct Answer for Text Input */}
            {questionForm.type === 'text-input' && (
              <div>
                <Label htmlFor="correct-answer">Respuesta Correcta</Label>
                <Input
                  id="correct-answer"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="Escribe la respuesta correcta..."
                />
              </div>
            )}

            {/* Explanation */}
            <div>
              <Label htmlFor="question-explanation">Explicación (Opcional)</Label>
              <Textarea
                id="question-explanation"
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Explicación que se mostrará después de responder..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveQuestion} disabled={isLoading}>
              {isLoading ? 'Guardando...' : editingQuestion ? 'Guardar Cambios' : 'Crear Pregunta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
