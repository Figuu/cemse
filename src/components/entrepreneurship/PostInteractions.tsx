"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Flag, 
  MoreHorizontal,
  Eye,
  TrendingUp
} from "lucide-react";
import { EntrepreneurshipPost } from "@/hooks/useEntrepreneurshipPosts";
import { usePostLike, usePostShare } from "@/hooks/useEntrepreneurshipPosts";
import { PostShareModal } from "./PostShareModal";

interface PostInteractionsProps {
  post: EntrepreneurshipPost;
  currentUserId?: string;
  onComment?: (post: EntrepreneurshipPost) => void;
  onView?: (post: EntrepreneurshipPost) => void;
  onBookmark?: (postId: string) => void;
  onReport?: (postId: string) => void;
  showViewCount?: boolean;
  showShareCount?: boolean;
  variant?: "default" | "compact" | "detailed";
}

export function PostInteractions({ 
  post, 
  currentUserId,
  onComment,
  onView,
  onBookmark,
  onReport,
  showViewCount = true,
  showShareCount = true,
  variant = "default"
}: PostInteractionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const { toggleLike, isLiking } = usePostLike(post.id);
  const { sharePost, isSharing } = usePostShare(post.id);

  const handleLike = async () => {
    try {
      await toggleLike();
      setIsLiked(!isLiked);
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

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmark) {
      onBookmark(post.id);
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport(post.id);
    }
  };

  const handleComment = () => {
    if (onComment) {
      onComment(post);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(post);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : ''}`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{post.likes}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleComment}
          className="flex items-center gap-1"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments}</span>
        </Button>
        
        <PostShareModal post={post}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4" />
            <span>{post.shares}</span>
          </Button>
        </PostShareModal>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className="space-y-4">
        {/* Main Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{post.comments}</span>
            </Button>
            
            <PostShareModal post={post}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                disabled={isSharing}
                className="flex items-center gap-2"
              >
                <Share2 className="h-5 w-5" />
                <span className="font-medium">{post.shares}</span>
              </Button>
            </PostShareModal>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`flex items-center gap-2 ${isBookmarked ? 'text-amber-500' : ''}`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {showViewCount && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{post.views || 0}</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReport}
              className="h-8 w-8 p-0"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Engagement: {((post.likes + post.comments + post.shares) / Math.max(post.views || 1, 1) * 100).toFixed(1)}%</span>
          </div>
          
          {post.isPinned && (
            <Badge variant="secondary" className="text-xs">
              Destacado
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : ''}`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{post.likes}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleComment}
          className="flex items-center gap-1"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments}</span>
        </Button>
        
        <PostShareModal post={post}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4" />
            <span>{post.shares}</span>
          </Button>
        </PostShareModal>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className={`flex items-center gap-1 ${isBookmarked ? 'text-amber-500' : ''}`}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {showViewCount && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{post.views || 0}</span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleView}
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
