"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Share2, 
  Copy, 
  ExternalLink, 
  MessageCircle, 
  Mail, 
  Twitter, 
  Facebook, 
  Linkedin,
  X
} from "lucide-react";
import { EntrepreneurshipPost } from "@/hooks/useEntrepreneurshipPosts";
import { usePostShare } from "@/hooks/useEntrepreneurshipPosts";

interface PostShareModalProps {
  post: EntrepreneurshipPost;
  currentUser?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  onShare?: (postId: string) => void;
  children?: React.ReactNode;
}

export function PostShareModal({ 
  post, 
  currentUser,
  onShare,
  children 
}: PostShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const { sharePost } = usePostShare(post.id);

  const postUrl = `${window.location.origin}/entrepreneurship/network/post/${post.id}`;
  const shareText = `Mira esta publicación de ${post.author.firstName} ${post.author.lastName}: ${post.content.substring(0, 100)}...`;

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await sharePost();
      if (onShare) {
        onShare(post.id);
      }
      setIsOpen(false);
      setShareMessage("");
    } catch (error) {
      console.error("Error sharing post:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareUrl = "";
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "mail":
        shareUrl = `mailto:?subject=${encodeURIComponent(`Publicación de ${post.author.firstName} ${post.author.lastName}`)}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const handleWhatsAppShare = () => {
    const encodedText = encodeURIComponent(`${shareText}\n\n${postUrl}`);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir Publicación
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Post Preview */}
          <div className="border rounded-lg p-3 bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {post.author.firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{post.author.firstName} {post.author.lastName}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.content}
            </p>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Share Message */}
          <div className="space-y-2">
            <Label htmlFor="shareMessage">Mensaje (opcional)</Label>
            <Textarea
              id="shareMessage"
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              placeholder="Agrega un mensaje personalizado..."
              className="min-h-[80px]"
            />
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <Label>Enlace de la publicación</Label>
            <div className="flex gap-2">
              <Input
                value={postUrl}
                readOnly
                className="text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex items-center gap-1"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>

          {/* Social Media Share */}
          <div className="space-y-2">
            <Label>Compartir en redes sociales</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare("twitter")}
                className="flex items-center gap-2"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare("facebook")}
                className="flex items-center gap-2"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare("linkedin")}
                className="flex items-center gap-2"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare("mail")}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(postUrl, "_blank")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              {isSharing ? "Compartiendo..." : "Compartir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
