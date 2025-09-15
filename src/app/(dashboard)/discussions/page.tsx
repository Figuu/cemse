"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Plus,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  HelpCircle,
  Calendar
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useDiscussions, useQuestions } from "@/hooks/useDiscussions";
import { DiscussionCard } from "@/components/courses/DiscussionCard";
import { QuestionCard } from "@/components/courses/QuestionCard";

export default function DiscussionsPage() {
  const [activeTab, setActiveTab] = useState("discussions");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const {
    discussions,
    isLoading: discussionsLoading,
    error: discussionsError,
    refetch: refetchDiscussions,
    vote: voteDiscussion,
  } = useDiscussions({
    search: searchTerm || undefined,
    sortBy,
    sortOrder,
  });

  const {
    questions,
    isLoading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions,
    vote: voteQuestion,
  } = useQuestions({
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    sortBy,
    sortOrder,
  });

  const filteredDiscussions = discussions.filter(discussion => {
    if (searchTerm) {
      return discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const filteredQuestions = questions.filter(question => {
    if (searchTerm) {
      return question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             question.content.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleCreateDiscussion = () => {
    // This would open a modal or navigate to a create discussion page
    console.log("Create discussion");
  };

  const handleCreateQuestion = () => {
    // This would open a modal or navigate to a create question page
    console.log("Create question");
  };

  const handleReply = (discussionId: string) => {
    // This would open a reply modal or navigate to discussion detail
    console.log("Reply to discussion:", discussionId);
  };

  const handleAnswer = (questionId: string) => {
    // This would open an answer modal or navigate to question detail
    console.log("Answer question:", questionId);
  };

  const handleVoteDiscussion = async (targetType: string, targetId: string, isUpvote: boolean) => {
    await voteDiscussion(targetType, targetId, isUpvote);
  };

  const handleVoteQuestion = async (targetType: string, targetId: string, isUpvote: boolean) => {
    await voteQuestion(targetType, targetId, isUpvote);
  };

  const handleViewReplies = (discussionId: string) => {
    // This would navigate to discussion detail page
    console.log("View replies for discussion:", discussionId);
  };

  const handleViewAnswers = (questionId: string) => {
    // This would navigate to question detail page
    console.log("View answers for question:", questionId);
  };

  if (discussionsLoading || questionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Discusiones y Preguntas</h1>
            <p className="text-muted-foreground">Participa en discusiones y resuelve dudas</p>
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

  if (discussionsError || questionsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Discusiones y Preguntas</h1>
            <p className="text-muted-foreground">Participa en discusiones y resuelve dudas</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar contenido</h3>
            <p className="text-muted-foreground mb-4">
              {discussionsError || questionsError}
            </p>
            <Button onClick={() => {
              refetchDiscussions();
              refetchQuestions();
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["YOUTH", "COMPANIES", "INSTITUTION", "SUPERADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Discusiones y Preguntas</h1>
            <p className="text-muted-foreground">
              Participa en discusiones y resuelve dudas
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={() => {
              refetchDiscussions();
              refetchQuestions();
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={handleCreateDiscussion}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Discusión
            </Button>
            <Button onClick={handleCreateQuestion}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Hacer Pregunta
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
                    placeholder="Buscar discusiones y preguntas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="open">Sin respuestas</option>
                  <option value="answered">Con respuestas</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt">Fecha de creación</option>
                  <option value="title">Título</option>
                  <option value="replyCount">Número de respuestas</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Descendente</option>
                  <option value="asc">Ascendente</option>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="text-center py-4">
              <div className="flex items-center justify-center mb-2">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{filteredDiscussions.length}</div>
              <div className="text-sm text-muted-foreground">Discusiones</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-4">
              <div className="flex items-center justify-center mb-2">
                <HelpCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{filteredQuestions.length}</div>
              <div className="text-sm text-muted-foreground">Preguntas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-4">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {filteredDiscussions.length + filteredQuestions.length}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discussions">
              Discusiones ({filteredDiscussions.length})
            </TabsTrigger>
            <TabsTrigger value="questions">
              Preguntas ({filteredQuestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-4">
            {filteredDiscussions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron discusiones</h3>
                  <p className="text-muted-foreground">
                    Inicia una nueva discusión para comenzar la conversación
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredDiscussions.map((discussion) => (
                  <DiscussionCard
                    key={discussion.id}
                    discussion={discussion}
                    onReply={handleReply}
                    onVote={handleVoteDiscussion}
                    onViewReplies={handleViewReplies}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron preguntas</h3>
                  <p className="text-muted-foreground">
                    Haz una pregunta para obtener ayuda de la comunidad
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onAnswer={handleAnswer}
                    onVote={handleVoteQuestion}
                    onViewAnswers={handleViewAnswers}
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
