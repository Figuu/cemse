"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  Bookmark, 
  BookmarkCheck,
  DollarSign,
  Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logo: string;
    location: string;
  };
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  postedAt: Date;
  deadline: Date;
  isBookmarked: boolean;
  isApplied: boolean;
  experience: string;
  education: string;
  skills: string[];
  remote: boolean;
  urgent: boolean;
}

interface JobCardProps {
  job: Job;
  viewMode: "grid" | "list";
  onBookmark: (jobId: string) => void;
  onApply: (jobId: string) => void;
}

export function JobCard({ job, viewMode, onBookmark, onApply }: JobCardProps) {
  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "full-time":
        return "Tiempo Completo";
      case "part-time":
        return "Medio Tiempo";
      case "contract":
        return "Contrato";
      case "internship":
        return "Prácticas";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "full-time":
        return "bg-green-100 text-green-800";
      case "part-time":
        return "bg-blue-100 text-blue-800";
      case "contract":
        return "bg-purple-100 text-purple-800";
      case "internship":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isExpiringSoon = () => {
    const daysUntilDeadline = Math.ceil((job.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7;
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {job.title}
                    </h3>
                    {job.urgent && (
                      <Badge className="bg-red-100 text-red-800">
                        <Zap className="h-3 w-3 mr-1" />
                        Urgente
                      </Badge>
                    )}
                    {isExpiringSoon() && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pronto a expirar
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {job.company.name}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDistanceToNow(job.postedAt, { addSuffix: true, locale: es })}
                    </div>
                    {job.salary && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={getTypeColor(job.type)}>
                      {getTypeLabel(job.type)}
                    </Badge>
                    {job.remote && (
                      <Badge variant="outline">
                        Remoto
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {job.experience}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{job.skills.length - 4} más
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onBookmark(job.id)}
              >
                {job.isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-blue-600" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant={job.isApplied ? "outline" : "default"}
                size="sm"
                onClick={() => onApply(job.id)}
                disabled={job.isApplied}
              >
                {job.isApplied ? "Aplicado" : "Aplicar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                {job.title}
              </h3>
              {job.urgent && (
                <Badge className="bg-red-100 text-red-800">
                  <Zap className="h-3 w-3 mr-1" />
                  Urgente
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {job.company.name}
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              {job.remote && (
                <Badge variant="outline" className="text-xs">
                  Remoto
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmark(job.id)}
          >
            {job.isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-blue-600" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            {job.salary && (
              <div className="flex items-center text-muted-foreground">
                <DollarSign className="h-4 w-4 mr-1" />
                {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
              </div>
            )}
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {formatDistanceToNow(job.postedAt, { addSuffix: true, locale: es })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={getTypeColor(job.type)}>
              {getTypeLabel(job.type)}
            </Badge>
            <Badge variant="outline">
              {job.experience}
            </Badge>
            {isExpiringSoon() && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <Clock className="h-3 w-3 mr-1" />
                Pronto a expirar
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{job.skills.length - 3}
              </Badge>
            )}
          </div>

          <div className="pt-2">
            <Button
              className="w-full"
              variant={job.isApplied ? "outline" : "default"}
              onClick={() => onApply(job.id)}
              disabled={job.isApplied}
            >
              {job.isApplied ? "Aplicado" : "Aplicar"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
