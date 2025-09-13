"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon, 
  HelpCircle, 
  Megaphone, 
  Award,
  X,
  Plus
} from "lucide-react";
import { PostType } from "@/hooks/useEntrepreneurshipPosts";
import { useEntrepreneurshipPosts } from "@/hooks/useEntrepreneurshipPosts";

interface CreatePostFormProps {
  currentUser?: {
    id: string;
    name: string;
    image?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const postTypes: { value: PostType; label: string; icon: any; description: string }[] = [
  { 
    value: "TEXT", 
    label: "Publicación", 
    icon: ImageIcon, 
    description: "Comparte tus pensamientos e ideas" 
  },
  { 
    value: "IMAGE", 
    label: "Imagen", 
    icon: ImageIcon, 
    description: "Comparte una imagen o foto" 
  },
  { 
    value: "VIDEO", 
    label: "Video", 
    icon: Video, 
    description: "Comparte un video" 
  },
  { 
    value: "LINK", 
    label: "Enlace", 
    icon: LinkIcon, 
    description: "Comparte un enlace interesante" 
  },
  { 
    value: "QUESTION", 
    label: "Pregunta", 
    icon: HelpCircle, 
    description: "Haz una pregunta a la comunidad" 
  },
  { 
    value: "ACHIEVEMENT", 
    label: "Logro", 
    icon: Award, 
    description: "Celebra un logro o hito" 
  },
  { 
    value: "ANNOUNCEMENT", 
    label: "Anuncio", 
    icon: Megaphone, 
    description: "Haz un anuncio importante" 
  },
];

export function CreatePostForm({ currentUser, onSuccess, onCancel }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<PostType>("TEXT");
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPost } = useEntrepreneurshipPosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createPost({
        content: content.trim(),
        type,
        images,
        tags,
      });
      
      // Reset form
      setContent("");
      setImages([]);
      setTags([]);
      setTagInput("");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const selectedPostType = postTypes.find(pt => pt.value === type);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {selectedPostType?.icon && <selectedPostType.icon className="h-5 w-5" />}
          Crear {selectedPostType?.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Info */}
          {currentUser && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.image} />
                <AvatarFallback>
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{currentUser.name}</span>
            </div>
          )}

          {/* Post Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="postType">Tipo de Publicación</Label>
            <Select value={type} onValueChange={(value) => setType(value as PostType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {postTypes.map((postType) => (
                  <SelectItem key={postType.value} value={postType.value}>
                    <div className="flex items-center gap-2">
                      <postType.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{postType.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {postType.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`¿Qué quieres compartir? ${selectedPostType?.description.toLowerCase()}...`}
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Images */}
          {type === "IMAGE" && (
            <div className="space-y-2">
              <Label>Imágenes</Label>
              <div className="space-y-2">
                {images.map((image, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={image}
                      onChange={(e) => {
                        const newImages = [...images];
                        newImages[index] = e.target.value;
                        setImages(newImages);
                      }}
                      placeholder="URL de la imagen"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newImages = images.filter((_, i) => i !== index);
                        setImages(newImages);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImages([...images, ""])}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Imagen
                </Button>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Etiquetas</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Agregar etiqueta..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={!content.trim() || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
