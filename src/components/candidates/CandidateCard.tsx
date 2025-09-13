"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Star, 
  Heart,
  MessageCircle,
  ExternalLink,
  Clock,
  DollarSign,
  Globe,
  Phone,
  Mail,
  Save,
  Eye
} from "lucide-react";
import { Candidate, EXPERIENCE_LEVELS, AVAILABILITY_OPTIONS } from "@/hooks/useCandidates";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface CandidateCardProps {
  candidate: Candidate;
  currentUserId?: string;
  onSave?: (candidateId: string) => void;
  onContact?: (candidateId: string) => void;
  onView?: (candidateId: string) => void;
  variant?: "default" | "featured" | "compact";
  showActions?: boolean;
}

export function CandidateCard({ 
  candidate, 
  currentUserId,
  onSave,
  onContact,
  onView,
  variant = "default",
  showActions = true
}: CandidateCardProps) {
  const isSaved = false; // This would come from a hook in real app
  const hasContacted = false; // This would come from a hook in real app

  const handleSave = () => {
    if (onSave) {
      onSave(candidate.id);
    }
  };

  const handleContact = () => {
    if (onContact) {
      onContact(candidate.id);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(candidate.id);
    }
  };

  const getExperienceLevelLabel = (level: string) => {
    const experienceLevel = EXPERIENCE_LEVELS.find(exp => exp.value === level);
    return experienceLevel?.label || level;
  };

  const getAvailabilityLabel = (availability: string) => {
    const availabilityOption = AVAILABILITY_OPTIONS.find(avail => avail.value === availability);
    return availabilityOption?.label || availability;
  };

  const getWorkArrangementLabels = () => {
    if (!candidate.workArrangementPreferences) return [];
    
    const arrangements = [];
    if (candidate.workArrangementPreferences.office) arrangements.push("Oficina");
    if (candidate.workArrangementPreferences.remote) arrangements.push("Remoto");
    if (candidate.workArrangementPreferences.hybrid) arrangements.push("Híbrido");
    return arrangements;
  };

  const formatSalaryExpectations = () => {
    if (!candidate.salaryExpectations) return null;
    
    const { min, max, currency } = candidate.salaryExpectations;
    
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    } else if (min) {
      return `Desde ${min.toLocaleString()} ${currency}`;
    } else if (max) {
      return `Hasta ${max.toLocaleString()} ${currency}`;
    }
    
    return null;
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={candidate.profile?.avatarUrl} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">
                  {candidate.profile?.firstName || ""} {candidate.profile?.lastName || ""}
                </h3>
                {candidate.availability === "IMMEDIATE" && (
                  <Badge variant="destructive" className="text-xs">
                    Disponible
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {candidate.profile?.address || "Ubicación no especificada"}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>{getExperienceLevelLabel(candidate.experienceLevel || "ENTRY_LEVEL")}</span>
                <span>{candidate.statistics?.totalApplications || 0} aplicaciones</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0"
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-red-500' : ''}`} />
              </Button>
              <Link href={`/candidates/${candidate.id}`}>
                <Button variant="outline" size="sm">
                  Ver
                </Button>
              </Link>
            </div>
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
                <AvatarImage src={candidate.profile?.avatarUrl} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">
                    {candidate.profile?.firstName || ""} {candidate.profile?.lastName || ""}
                  </h3>
                  {candidate.availability === "IMMEDIATE" && (
                    <Badge variant="destructive" className="text-xs">
                      Disponible
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    Destacado
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {candidate.profile?.address || "Ubicación no especificada"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(candidate.createdAt), { 
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
                onClick={handleSave}
                className="flex items-center gap-1"
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-red-500' : ''}`} />
                <span>Guardar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleContact}
                className="flex items-center gap-1"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Contactar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {candidate.skills?.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills && candidate.skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 5}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span>{getExperienceLevelLabel(candidate.experienceLevel || "ENTRY_LEVEL")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{getAvailabilityLabel(candidate.availability || "FLEXIBLE")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.statistics?.totalApplications || 0} aplicaciones</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.languages?.length || 0} idiomas</span>
              </div>
            </div>

            {formatSalaryExpectations() && (
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <DollarSign className="h-4 w-4" />
                <span>{formatSalaryExpectations()}</span>
              </div>
            )}

            {getWorkArrangementLabels().length > 0 && (
              <div className="flex flex-wrap gap-1">
                {getWorkArrangementLabels().map((arrangement) => (
                  <Badge key={arrangement} variant="secondary" className="text-xs">
                    {arrangement}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant={isSaved ? "default" : "outline"}
                size="sm"
                onClick={handleSave}
              >
                {isSaved ? "Guardado" : "Guardar"}
              </Button>
              <Button
                variant={hasContacted ? "outline" : "default"}
                size="sm"
                onClick={handleContact}
              >
                {hasContacted ? "Contactado" : "Contactar"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/candidates/${candidate.id}`}>
                <Button variant="outline" size="sm">
                  Ver Perfil
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
            <Avatar className="h-10 w-10">
              <AvatarImage src={candidate.profile?.avatarUrl} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">
                  {candidate.profile?.firstName || ""} {candidate.profile?.lastName || ""}
                </h3>
                {candidate.availability === "IMMEDIATE" && (
                  <Badge variant="destructive" className="text-xs">
                    Disponible
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {candidate.profile?.address || "Ubicación no especificada"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="h-8 w-8 p-0"
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleContact}
              className="h-8 w-8 p-0"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {candidate.skills?.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {candidate.skills && candidate.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{candidate.skills.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>{getExperienceLevelLabel(candidate.experienceLevel || "ENTRY_LEVEL")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{getAvailabilityLabel(candidate.availability || "FLEXIBLE")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              <span>{candidate.statistics?.totalApplications || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span>{candidate.languages?.length || 0}</span>
            </div>
          </div>

          {formatSalaryExpectations() && (
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <DollarSign className="h-4 w-4" />
              <span>{formatSalaryExpectations()}</span>
            </div>
          )}

          {getWorkArrangementLabels().length > 0 && (
            <div className="flex flex-wrap gap-1">
              {getWorkArrangementLabels().map((arrangement) => (
                <Badge key={arrangement} variant="secondary" className="text-xs">
                  {arrangement}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t mt-3">
            <div className="flex items-center gap-2">
              <Button
                variant={isSaved ? "default" : "outline"}
                size="sm"
                onClick={handleSave}
              >
                {isSaved ? "Guardado" : "Guardar"}
              </Button>
              <Button
                variant={hasContacted ? "outline" : "default"}
                size="sm"
                onClick={handleContact}
              >
                {hasContacted ? "Contactado" : "Contactar"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/candidates/${candidate.id}`}>
                <Button variant="outline" size="sm">
                  Ver Perfil
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
