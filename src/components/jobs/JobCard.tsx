"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Heart,
  Share2,
  Eye,
  Calendar,
  Star,
  ExternalLink,
  Building2
} from "lucide-react";
import { JobPosting, EmploymentTypeLabels, ExperienceLevelLabels } from "@/types/company";
import { formatTimeAgo } from "@/lib/utils";
import Link from "next/link";

interface JobCardProps {
  job: JobPosting;
  currentUserId?: string;
  onLike?: (jobId: string) => void;
  onShare?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  onBookmark?: (jobId: string) => void;
  variant?: "default" | "featured" | "compact";
  showActions?: boolean;
  hasApplied?: boolean;
  applicationId?: string;
}

export function JobCard({ 
  job, 
  currentUserId,
  onLike,
  onShare,
  onApply,
  onBookmark,
  variant = "default",
  showActions = true,
  hasApplied = false,
  applicationId
}: JobCardProps) {
  const isLiked = false; // This would come from a hook in real app
  
  // Use currentUserId to determine if user can interact with the job
  const canInteract = Boolean(currentUserId);

  const handleLike = () => {
    if (onLike) {
      onLike(job.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(job.id);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(job.id);
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(job.id);
    }
  };

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    
    const min = job.salaryMin ? job.salaryMin.toLocaleString() : "";
    const max = job.salaryMax ? job.salaryMax.toLocaleString() : "";
    
    if (min && max) {
      return `${min} - ${max} ${job.currency}`;
    } else if (min) {
      return `Desde ${min} ${job.currency}`;
    } else if (max) {
      return `Hasta ${max} ${job.currency}`;
    }
    
    return null;
  };

  const getWorkArrangements = () => {
    const arrangements = [];
    if (job.officeWork) arrangements.push("Oficina");
    if (job.remoteWork) arrangements.push("Remoto");
    if (job.hybridWork) arrangements.push("Híbrido");
    return arrangements;
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={job.company.logo} />
              <AvatarFallback>
                <Building2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{job.title}</h3>
                {job.isUrgent && (
                  <Badge variant="destructive" className="text-xs flex-shrink-0">
                    Urgente
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {job.company.name} • <MapPin className="inline h-3 w-3 mr-1" />{job.location}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="truncate"><Briefcase className="inline h-3 w-3 mr-1" />{EmploymentTypeLabels[job.employmentType]}</span>
                <span className="truncate">{ExperienceLevelLabels[job.experienceLevel]}</span>
                <span className="truncate">{job.totalApplications} aplicaciones</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBookmark ? handleBookmark : handleLike}
                disabled={!canInteract}
                className="h-8 w-8 p-0"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
              </Button>
              <Link href={`/jobs/${job.id}`}>
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
      <Card className="hover:shadow-lg transition-shadow group border-2 border-primary/20 h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={job.company.logo} />
                <AvatarFallback>
                  <Building2 className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold truncate">{job.title}</h3>
                  {job.isUrgent && (
                    <Badge variant="destructive" className="text-xs flex-shrink-0">
                      Urgente
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    Destacado
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {job.company.name} • <MapPin className="inline h-3 w-3 mr-1" />{job.location}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  {formatTimeAgo(job.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBookmark ? handleBookmark : handleLike}
                disabled={!canInteract}
                className="flex items-center gap-1"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                <span>{job.totalLikes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                disabled={!canInteract}
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                <span>{job.totalShares}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            <p className="text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
              {job.description}
            </p>
            
            <div className="flex flex-wrap gap-2 min-h-[1.5rem]">
              {job.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills.length - 5}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{EmploymentTypeLabels[job.employmentType]}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Star className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{ExperienceLevelLabels[job.experienceLevel]}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{job.totalViews} vistas</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{job.totalApplications} aplicaciones</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t mt-4 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {!hasApplied ? (
                <Button onClick={handleApply} disabled={!canInteract} className="flex-shrink-0">
                  Aplicar Ahora
                </Button>
              ) : (
                <Link href={`/applications/${applicationId}`}>
                  <Button variant="outline" className="flex-shrink-0">
                    Ver Aplicación
                  </Button>
                </Link>
              )}
              <Link href={`/jobs/${job.id}`}>
                <Button variant="outline" className="flex-shrink-0">
                  Ver Detalles
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <Link href={`/companies/${job.company.id}`}>
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
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={job.company.logo} />
              <AvatarFallback>
                <Building2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm lg:text-base truncate">{job.title}</h3>
                {job.isUrgent && (
                  <Badge variant="destructive" className="text-xs flex-shrink-0">
                    Urgente
                  </Badge>
                )}
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground truncate">
                {job.company.name} • <MapPin className="inline h-3 w-3 mr-1" />{job.location}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBookmark ? handleBookmark : handleLike}
              disabled={!canInteract}
              className="h-8 w-8 p-0"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              disabled={!canInteract}
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="space-y-3 lg:space-y-4 flex-1">
          <p className="text-sm lg:text-base leading-relaxed line-clamp-2 min-h-[2.5rem] lg:min-h-[3rem]">
            {job.description}
          </p>
          
          <div className="flex flex-wrap gap-1 lg:gap-2 min-h-[1.5rem]">
            {job.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs lg:text-sm">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="outline" className="text-xs lg:text-sm">
                +{job.skills.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 lg:gap-3 text-xs lg:text-sm text-muted-foreground">
            <div className="flex items-center gap-1 lg:gap-2 min-w-0">
              <Briefcase className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
              <span className="truncate">{EmploymentTypeLabels[job.employmentType]}</span>
            </div>
            <div className="flex items-center gap-1 lg:gap-2 min-w-0">
              <Star className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
              <span className="truncate">{ExperienceLevelLabels[job.experienceLevel]}</span>
            </div>
            <div className="flex items-center gap-1 lg:gap-2 min-w-0">
              <Eye className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
              <span className="truncate">{job.totalViews}</span>
            </div>
            <div className="flex items-center gap-1 lg:gap-2 min-w-0">
              <Users className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
              <span className="truncate">{job.totalApplications}</span>
            </div>
          </div>

          {formatSalary() && (
            <div className="flex items-center gap-1 lg:gap-2 text-sm lg:text-base font-medium text-green-600">
              <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
              <span className="truncate">{formatSalary()}</span>
            </div>
          )}

          {getWorkArrangements().length > 0 && (
            <div className="flex flex-wrap gap-1 lg:gap-2">
              {getWorkArrangements().map((arrangement) => (
                <Badge key={arrangement} variant="secondary" className="text-xs lg:text-sm">
                  {arrangement}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center justify-between pt-3 lg:pt-4 border-t mt-3 lg:mt-4 flex-shrink-0">
            <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
              {!hasApplied ? (
                <Button size="sm" onClick={handleApply} disabled={!canInteract} className="flex-shrink-0 text-xs lg:text-sm">
                  Aplicar
                </Button>
              ) : (
                <Link href={`/applications/${applicationId}`}>
                  <Button variant="outline" size="sm" className="flex-shrink-0 text-xs lg:text-sm">
                    Ver Aplicación
                  </Button>
                </Link>
              )}
              <Link href={`/jobs/${job.id}`}>
                <Button variant="outline" size="sm" className="flex-shrink-0 text-xs lg:text-sm">
                  Ver Detalles
                </Button>
              </Link>
            </div>
            <div className="text-xs lg:text-sm text-muted-foreground flex-shrink-0 ml-2">
              <Calendar className="inline h-3 w-3 lg:h-4 lg:w-4 mr-1" />
              <span className="truncate">{formatTimeAgo(job.createdAt)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}