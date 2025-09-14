"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  MessageSquare, 
  TrendingUp,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  HelpCircle,
  Award,
  Megaphone
} from "lucide-react";
import { PostCard } from "@/components/entrepreneurship/PostCard";
import { CreatePostForm } from "@/components/entrepreneurship/CreatePostForm";
import { 
  useEntrepreneurshipPosts, 
  EntrepreneurshipPost,
  PostType 
} from "@/hooks/useEntrepreneurshipPosts";
import Link from "next/link";

const postTypeIcons: Record<PostType, React.ComponentType<{ className?: string }>> = {
  TEXT: MessageSquare,
  IMAGE: ImageIcon,
  VIDEO: Video,
  LINK: LinkIcon,
  POLL: HelpCircle,
  ANNOUNCEMENT: Megaphone,
  ACHIEVEMENT: Award,
  QUESTION: HelpCircle,
};

const postTypeLabels: Record<PostType, string> = {
  TEXT: "Publicaciones",
  IMAGE: "Imágenes",
  VIDEO: "Videos",
  LINK: "Enlaces",
  POLL: "Encuestas",
  ANNOUNCEMENT: "Anuncios",
  ACHIEVEMENT: "Logros",
  QUESTION: "Preguntas",
};

export default function EntrepreneurshipNetworkPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<PostType | "all">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock current user - in real app, this would come from auth context
  const currentUser = {
    id: "user-1",
    name: "Usuario Actual",
    image: undefined,
  };

  // Fetch posts
  const { 
    posts, 
    isLoading, 
    error, 
    refetch,
    deletePost 
  } = useEntrepreneurshipPosts({
    search: searchTerm || undefined,
    type: selectedType !== "all" ? selectedType : undefined,
    limit: 20,
  });

  const handleCreatePost = () => {
    setShowCreateForm(true);
  };

  const handlePostCreated = () => {
    setShowCreateForm(false);
    refetch();
  };

  const handleViewPost = (post: EntrepreneurshipPost) => {
    setSelectedPost(post);
  };

  const handleEditPost = (post: EntrepreneurshipPost) => {
    // TODO: Implement edit functionality
    console.log("Edit post:", post.id);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta publicación?")) {
      try {
        await deletePost(postId);
        refetch();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    if (selectedType !== "all" && post.type !== selectedType) {
      return false;
    }
    if (searchTerm && !post.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/entrepreneurship">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Red de Emprendedores
          </h1>
          <p className="text-muted-foreground">
            Conecta con otros jóvenes emprendedores, comparte ideas y aprende juntos
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Publicaciones</span>
            </div>
            <p className="text-2xl font-bold">{posts.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Emprendedores Activos</span>
            </div>
            <p className="text-2xl font-bold">
              {new Set(posts.map(p => p.authorId)).size}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Interacciones</span>
            </div>
            <p className="text-2xl font-bold">
              {posts.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">Logros Compartidos</span>
            </div>
            <p className="text-2xl font-bold">
              {posts.filter(p => p.type === "ACHIEVEMENT").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar publicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Create Post Button */}
          <Card>
            <CardContent className="p-4">
              <Button 
                onClick={handleCreatePost} 
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear Publicación
              </Button>
            </CardContent>
          </Card>

          {/* Post Types Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipos de Contenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedType === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedType("all")}
                className="w-full justify-start"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Todos
              </Button>
              {Object.entries(postTypeLabels).map(([type, label]) => {
                const IconComponent = postTypeIcons[type as PostType];
                return (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedType(type as PostType)}
                    className="w-full justify-start"
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Popular Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Etiquetas Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {Array.from(new Set(posts.flatMap(p => p.tags)))
                  .slice(0, 10)
                  .map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs cursor-pointer">
                      #{tag}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Create Post Form */}
          {showCreateForm && (
            <CreatePostForm
              currentUser={currentUser}
              onSuccess={handlePostCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          {/* Posts Feed */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-3 bg-muted rounded w-20"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error al cargar publicaciones</h3>
                  <p className="text-muted-foreground mb-4">
                    No se pudieron cargar las publicaciones. Inténtalo de nuevo.
                  </p>
                  <Button onClick={() => refetch()}>
                    Reintentar
                  </Button>
                </CardContent>
              </Card>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser.id}
                  onView={handleViewPost}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay publicaciones</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedType !== "all" 
                      ? "No se encontraron publicaciones con los filtros seleccionados."
                      : "Aún no hay publicaciones en la red de emprendedores."
                    }
                  </p>
                  <Button onClick={handleCreatePost}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Publicación
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
