"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
  MapPin, 
  Users, 
  Star, 
  ExternalLink, 
  Heart,
  Share2,
  Eye,
  Briefcase,
  Calendar,
  Globe,
  Phone,
  Mail
} from "lucide-react";
import { Company, CompanySizeLabels } from "@/types/company";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface CompanyCardProps {
  company: Company;
  currentUserId?: string;
  onFollow?: (companyId: string) => void;
  onLike?: (companyId: string) => void;
  onShare?: (companyId: string) => void;
  variant?: "default" | "featured" | "compact";
  showActions?: boolean;
}

export function CompanyCard({ 
  company, 
  currentUserId,
  onFollow,
  onLike,
  onShare,
  variant = "default",
  showActions = true
}: CompanyCardProps) {
  const isFollowing = false; // This would come from a hook in real app
  const isLiked = false; // This would come from a hook in real app

  const handleFollow = () => {
    if (onFollow) {
      onFollow(company.id);
    }
  };

  const handleLike = () => {
    if (onLike) {
      onLike(company.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(company.id);
    }
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={company.logo} />
              <AvatarFallback>
                <Building2 className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{company.name}</h3>
                {company.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {company.industry} • {company.location}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {company.totalEmployees || "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {company.totalJobs}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {company.averageRating?.toFixed(1) || "N/A"}
                </span>
              </div>
            </div>
            <Link href={`/companies/${company.id}`}>
              <Button variant="outline" size="sm">
                Ver
              </Button>
            </Link>
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
              <Avatar className="h-16 w-16">
                <AvatarImage src={company.logo} />
                <AvatarFallback>
                  <Building2 className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">{company.name}</h3>
                  {company.isVerified && (
                    <Badge variant="default" className="text-xs">
                      Verificado
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    Destacado
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {company.industry} • {company.location}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(company.createdAt), { 
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
                onClick={handleLike}
                className="flex items-center gap-1"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                <span>{company.followers}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {company.description && (
              <p className="text-sm leading-relaxed line-clamp-3">
                {company.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {company.technologies.slice(0, 5).map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {company.technologies.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{company.technologies.length - 5}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{company.totalEmployees || "N/A"} empleados</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{company.totalJobs} trabajos</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span>{company.averageRating?.toFixed(1) || "N/A"} rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>{company.views} vistas</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant={isFollowing ? "default" : "outline"}
                size="sm"
                onClick={handleFollow}
              >
                {isFollowing ? "Siguiendo" : "Seguir"}
              </Button>
              <Link href={`/companies/${company.id}`}>
                <Button variant="outline" size="sm">
                  Ver Perfil
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {company.website && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(company.website, "_blank")}
                  className="h-8 w-8 p-0"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              )}
              <Link href={`/companies/${company.id}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={company.logo} />
              <AvatarFallback>
                <Building2 className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">{company.name}</h3>
                {company.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {company.industry} • {company.location}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="h-8 w-8 p-0"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {company.description && (
            <p className="text-sm leading-relaxed line-clamp-2">
              {company.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-1">
            {company.technologies.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {company.technologies.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{company.technologies.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{company.totalEmployees || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              <span>{company.totalJobs}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>{company.averageRating?.toFixed(1) || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{company.views}</span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t mt-3">
            <Button
              variant={isFollowing ? "default" : "outline"}
              size="sm"
              onClick={handleFollow}
            >
              {isFollowing ? "Siguiendo" : "Seguir"}
            </Button>
            <Link href={`/companies/${company.id}`}>
              <Button variant="outline" size="sm">
                Ver Perfil
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
