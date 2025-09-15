"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Pin,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Award,
  HelpCircle,
  Megaphone,
  MoreHorizontal,
  Bookmark,
  Flag,
  Eye,
  Calendar
} from "lucide-react";
import { PostType } from "@prisma/client";
import { EntrepreneurshipPost } from "@/hooks/useEntrepreneurshipPosts";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { PostInteractions } from "./PostInteractions";
import { PostAnalytics } from "./PostAnalytics";

interface EnhancedPostCardProps {
  post: EntrepreneurshipPost;
  currentUserId?: string;
  onView?: (post: EntrepreneurshipPost) => void;
  onEdit?: (post: EntrepreneurshipPost) => void;
  onDelete?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onReport?: (postId: string) => void;
  showAnalytics?: boolean;
  showDetailedInteractions?: boolean;
  variant?: "default" | "featured" | "compact";
}

const postTypeIcons: Record<PostType, React.ComponentType<{ className?: string }>> = {
  TEXT: Megaphone,
  IMAGE: ImageIcon,
  VIDEO: Video,
  LINK: LinkIcon,
  POLL: HelpCircle,
  EVENT: Calendar,
  [PostType.ANNOUNCEMENT]: Megaphone,
  ACHIEVEMENT: Award,
  QUESTION: HelpCircle,
};

const postTypeLabels: Record<PostType, string> = {
  TEXT: "Publicación",
  IMAGE: "Imagen",
  VIDEO: "Video",
  LINK: "Enlace",
  POLL: "Encuesta",
  EVENT: "Evento",
  [PostType.ANNOUNCEMENT]: "Anuncio",
  ACHIEVEMENT: "Logro",
  QUESTION: "Pregunta",
};

export function EnhancedPostCard({ 
  post, 
  currentUserId,
  onView, 
  onEdit, 
  onDelete,
  onBookmark,
  onReport,
  showAnalytics = false,
  showDetailedInteractions = false,
  variant = "default" 
}: EnhancedPostCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const isAuthor = post.authorId === currentUserId;
  const IconComponent = postTypeIcons[post.type];
  const typeLabel = postTypeLabels[post.type];
  const shouldTruncate = post.content.length > 200 && !showFullContent;

  const handleView = () => {
    if (onView) {
      onView(post);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(post.id);
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport(post.id);
    }
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.avatarUrl} />
              <AvatarFallback className="text-xs">
                {post.author.firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{post.author.firstName} {post.author.lastName}</span>
                {post.isPinned && <Pin className="h-3 w-3 text-amber-500" />}
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <IconComponent className="h-3 w-3" />
                  {typeLabel}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {post.content}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>{post.likes} likes</span>
                <span>{post.comments} comentarios</span>
                <span>{post.shares} compartidos</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleView}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card className="hover:shadow-lg transition-shadow group border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatarUrl} />
                <AvatarFallback>
                  {post.author.firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{post.author.firstName} {post.author.lastName}</h4>
                  <Pin className="h-4 w-4 text-amber-500" />
                  <Badge variant="default" className="text-xs">
                    Destacado
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalyticsModal(true)}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Analytics
              </Button>
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <p className="text-base leading-relaxed">
              {shouldTruncate ? `${post.content.substring(0, 200)}...` : post.content}
              {shouldTruncate && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowFullContent(true)}
                  className="p-0 h-auto text-primary"
                >
                  Ver más
                </Button>
              )}
            </p>
            
            {post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {post.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={image}
                      alt={`Post image ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={handleView}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <PostInteractions
            post={post}
            currentUserId={currentUserId}
            onComment={handleView}
            onView={handleView}
            onBookmark={handleBookmark}
            onReport={handleReport}
            showViewCount={true}
            showShareCount={true}
            variant="detailed"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatarUrl} />
              <AvatarFallback>
                {post.author.firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">{post.author.firstName} {post.author.lastName}</h4>
                {post.isPinned && <Pin className="h-3 w-3 text-amber-500" />}
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <IconComponent className="h-3 w-3" />
                  {typeLabel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {showAnalytics && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalyticsModal(true)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className="h-8 w-8 p-0"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReport}
              className="h-8 w-8 p-0"
            >
              <Flag className="h-4 w-4" />
            </Button>
            {isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">
            {shouldTruncate ? `${post.content.substring(0, 200)}...` : post.content}
            {shouldTruncate && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowFullContent(true)}
                className="p-0 h-auto text-primary"
              >
                Ver más
              </Button>
            )}
          </p>
          
          {post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={image}
                    alt={`Post image ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={handleView}
                  />
                </div>
              ))}
              {post.images.length > 4 && (
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    +{post.images.length - 4} más
                  </span>
                </div>
              )}
            </div>
          )}
          
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {post.tags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 5}
                </Badge>
              )}
            </div>
          )}
        </div>

        <PostInteractions
          post={post}
          currentUserId={currentUserId}
          onComment={handleView}
          onView={handleView}
          onBookmark={handleBookmark}
          onReport={handleReport}
          showViewCount={true}
          showShareCount={true}
          variant={showDetailedInteractions ? "detailed" : "default"}
        />
      </CardContent>

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Analytics del Post</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalyticsModal(false)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <PostAnalytics post={post} showDetailed={true} />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
