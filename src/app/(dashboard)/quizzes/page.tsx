"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HelpCircle, 
  Plus,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useQuizzes } from "@/hooks/useQuizzes";
import { QuizCard } from "@/components/courses/QuizCard";
import { QuizViewer } from "@/components/courses/QuizViewer";
import { Quiz } from "@/hooks/useQuizzes";

export default function QuizzesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const {
    quizzes,
    isLoading,
    error,
    refetch,
    submitQuiz,
  } = useQuizzes();

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = 
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (quiz.lesson && quiz.lesson.module.course.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (quiz.course && quiz.course.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCourse = courseFilter === "all" || 
      (quiz.course && quiz.course.id === courseFilter) ||
      (quiz.lesson && quiz.lesson.module.course.id === courseFilter);
    
    return matchesSearch && matchesCourse;
  });

  const availableQuizzes = filteredQuizzes.filter(quiz => quiz.attempts.canRetake);
  const completedQuizzes = filteredQuizzes.filter(quiz => quiz.attempts.isPassed);
  const failedQuizzes = filteredQuizzes.filter(quiz => !quiz.attempts.isPassed && !quiz.attempts.canRetake);

  const handleStartQuiz = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setShowQuiz(true);
    }
  };

  const handleViewResults = (quizId: string) => {
    // Navigate to quiz results page
    window.location.href = `/quizzes/${quizId}/results`;
  };

  const handleSubmitQuiz = async (answers: Record<string, string | number | boolean>) => {
    if (!selectedQuiz) return null;
    return await submitQuiz(selectedQuiz.id, answers);
  };

  const handleExitQuiz = () => {
    setShowQuiz(false);
    setSelectedQuiz(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cuestionarios</h1>
            <p className="text-muted-foreground">Gestiona tus cuestionarios y evaluaciones</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cuestionarios</h1>
            <p className="text-muted-foreground">Gestiona tus cuestionarios y evaluaciones</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar cuestionarios</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showQuiz && selectedQuiz) {
    return (
      <QuizViewer
        quiz={selectedQuiz}
        onSubmit={handleSubmitQuiz}
        onExit={handleExitQuiz}
      />
    );
  }

  return (
    <RoleGuard allowedRoles={["YOUTH", "COMPANIES", "INSTITUTION", "ADMIN", "INSTRUCTOR"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cuestionarios</h1>
            <p className="text-muted-foreground">
              Gestiona tus cuestionarios y evaluaciones
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Cuestionario
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar cuestionarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los cursos</option>
                  {/* TODO: Add course options */}
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="text-center py-4">
              <div className="flex items-center justify-center mb-2">
                <HelpCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{quizzes.length}</div>
              <div className="text-sm text-muted-foreground">Total Cuestionarios</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-4">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{completedQuizzes.length}</div>
              <div className="text-sm text-muted-foreground">Aprobados</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{availableQuizzes.length}</div>
              <div className="text-sm text-muted-foreground">Disponibles</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-4">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{failedQuizzes.length}</div>
              <div className="text-sm text-muted-foreground">Fallidos</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos ({filteredQuizzes.length})</TabsTrigger>
            <TabsTrigger value="available">Disponibles ({availableQuizzes.length})</TabsTrigger>
            <TabsTrigger value="completed">Aprobados ({completedQuizzes.length})</TabsTrigger>
            <TabsTrigger value="failed">Fallidos ({failedQuizzes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredQuizzes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron cuestionarios</h3>
                  <p className="text-muted-foreground">
                    Intenta ajustar tus filtros de búsqueda
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onStart={handleStartQuiz}
                    onViewResults={handleViewResults}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            {availableQuizzes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay cuestionarios disponibles</h3>
                  <p className="text-muted-foreground">
                    Todos los cuestionarios han sido completados o no tienes intentos restantes
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onStart={handleStartQuiz}
                    onViewResults={handleViewResults}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedQuizzes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay cuestionarios aprobados</h3>
                  <p className="text-muted-foreground">
                    Completa algunos cuestionarios para verlos aquí
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onStart={handleStartQuiz}
                    onViewResults={handleViewResults}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="failed" className="space-y-4">
            {failedQuizzes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay cuestionarios fallidos</h3>
                  <p className="text-muted-foreground">
                    ¡Excelente! No tienes cuestionarios fallidos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {failedQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onStart={handleStartQuiz}
                    onViewResults={handleViewResults}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
