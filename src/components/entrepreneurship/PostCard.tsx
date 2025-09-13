"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Pin,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Award,
  HelpCircle,
  Megaphone
} from "lucide-react";
import { EntrepreneurshipPost, PostType } from "@/hooks/useEntrepreneurshipPosts";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { usePostLike, usePostShare } from "@/hooks/useEntrepreneurshipPosts";

interface PostCardProps {
  post: EntrepreneurshipPost;
  onView?: (post: EntrepreneurshipPost) => void;
  onEdit?: (post: EntrepreneurshipPost) => void;
  onDelete?: (postId: string) => void;
  currentUserId?: string;
  showComments?: boolean;
}

const postTypeIcons: Record<PostType, any> = {
  TEXT: MessageCircle,
  IMAGE: ImageIcon,
  VIDEO: Video,
  LINK: LinkIcon,
  POLL: HelpCircle,
  ANNOUNCEMENT: Megaphone,
  ACHIEVEMENT: Award,
  QUESTION: HelpCircle,
};

const postTypeLabels: Record<PostType, string> = {
  TEXT: "Publicación",
  IMAGE: "Imagen",
  VIDEO: "Video",
  LINK: "Enlace",
  POLL: "Encuesta",
  ANNOUNCEMENT: "Anuncio",
  ACHIEVEMENT: "Logro",
  QUESTION: "Pregunta",
};

export function PostCard({ 
  post, 
  onView, 
  onEdit, 
  onDelete, 
  currentUserId,
  showComments = true 
}: PostCardProps) {
  const [showAllComments, setShowAllComments] = useState(false);
  const { toggleLike, isLiking } = usePostLike(post.id);
  const { sharePost, isSharing } = usePostShare(post.id);

  const isLiked = post.postLikes.some(like => like.userId === currentUserId);
  const isAuthor = post.authorId === currentUserId;
  const IconComponent = postTypeIcons[post.type];
  const typeLabel = postTypeLabels[post.type];

  const handleLike = async () => {
    try {
      await toggleLike();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleShare = async () => {
    try {
      await sharePost();
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

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

  const displayComments = showAllComments ? post.postComments : post.postComments.slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.image} />
              <AvatarFallback>
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{post.author.name}</h4>
                {post.isPinned && (
                  <Pin className="h-3 w-3 text-amber-500" />
                )}
                <Badge variant="secondary" className="text-xs">
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
          
          {isAuthor && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post Content */}
        <div className="space-y-4">
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
          
          {/* Images */}
          {post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={image}
                    alt={`Post image ${index + 1}`}
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

          {/* Tags */}
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

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleView}
              className="flex items-center gap-1 text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center gap-1 text-muted-foreground"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">{post.shares}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{typeLabel}</span>
          </div>
        </div>

        {/* Comments Preview */}
        {showComments && post.postComments.length > 0 && (
          <div className="mt-4 space-y-2">
            {displayComments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={comment.author.image} />
                  <AvatarFallback className="text-xs">
                    {comment.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
            
            {post.postComments.length > 2 && !showAllComments && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllComments(true)}
                className="text-xs text-muted-foreground h-auto p-0"
              >
                Ver {post.postComments.length - 2} comentarios más
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
