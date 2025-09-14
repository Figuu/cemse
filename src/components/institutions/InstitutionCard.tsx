"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Users, 
  GraduationCap,
  Calendar,
  Star,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface InstitutionCardProps {
  institution: {
    id: string;
    name: string;
    description: string;
    type: "MUNICIPALITY" | "NGO" | "TRAINING_CENTER";
    city: string;
    country: string;
    website?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      email: string;
      profile: {
        firstName: string;
        lastName: string;
      };
    };
    _count: {
      courses: number;
      programs: number;
      students: number;
    };
  };
  onEdit?: (institution: any) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onManage?: (id: string) => void;
  className?: string;
}

export function InstitutionCard({
  institution,
  onEdit,
  onDelete,
  onView,
  onManage,
  className
}: InstitutionCardProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "MUNICIPALITY":
        return "Municipio";
      case "NGO":
        return "ONG";
      case "TRAINING_CENTER":
        return "Centro de Capacitación";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "MUNICIPALITY":
        return "bg-blue-100 text-blue-800";
      case "NGO":
        return "bg-green-100 text-green-800";
      case "TRAINING_CENTER":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MUNICIPALITY":
        return Building;
      case "NGO":
        return Users;
      case "TRAINING_CENTER":
        return GraduationCap;
      default:
        return Building;
    }
  };

  const TypeIcon = getTypeIcon(institution.type);

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={institution.logoUrl} />
              <AvatarFallback>
                <TypeIcon className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{institution.name}</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <Badge className={`${getTypeColor(institution.type)}`}>
                  {getTypeLabel(institution.type)}
                </Badge>
                {institution.isActive ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Inactivo
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(institution)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(institution.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {institution.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {institution.city}, {institution.country}
          </div>
          {institution.website && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Globe className="h-4 w-4 mr-2" />
              <a 
                href={institution.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline truncate"
              >
                {institution.website}
              </a>
            </div>
          )}
          {institution.email && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              <span className="truncate">{institution.email}</span>
            </div>
          )}
          {institution.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              {institution.phone}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <div className="text-lg font-bold text-blue-600">{institution._count.courses}</div>
            <div className="text-xs text-muted-foreground">Cursos</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{institution._count.programs}</div>
            <div className="text-xs text-muted-foreground">Programas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{institution._count.students}</div>
            <div className="text-xs text-muted-foreground">Estudiantes</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>
              Creado {formatDistanceToNow(new Date(institution.createdAt), { addSuffix: true, locale: es })}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{institution.user.profile.firstName} {institution.user.profile.lastName}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          {onView && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(institution.id)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalles
            </Button>
          )}
          {onManage && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onManage(institution.id)}>
              <Users className="h-4 w-4 mr-2" />
              Gestionar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
