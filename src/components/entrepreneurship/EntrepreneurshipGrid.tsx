"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Eye,
  Star,
  ExternalLink
} from "lucide-react";
import { useEntrepreneurships, EntrepreneurshipsFilters } from "@/hooks/useEntrepreneurships";
import { BusinessStage } from "@prisma/client";
import { EntrepreneurshipDetailsModal } from "./EntrepreneurshipDetailsModal";

interface EntrepreneurshipGridProps {
  filters: EntrepreneurshipsFilters;
}

const businessStageLabels: Record<BusinessStage, string> = {
  IDEA: "Idea",
  STARTUP: "Startup",
  GROWTH: "Crecimiento",
  MATURE: "Maduro",
  SCALE: "Escalado",
};

const businessStageColors: Record<BusinessStage, string> = {
  IDEA: "bg-blue-100 text-blue-800",
  STARTUP: "bg-green-100 text-green-800",
  GROWTH: "bg-yellow-100 text-yellow-800",
  MATURE: "bg-purple-100 text-purple-800",
  SCALE: "bg-orange-100 text-orange-800",
};

export function EntrepreneurshipGrid({ filters }: EntrepreneurshipGridProps) {
  const { entrepreneurships, isLoading, error } = useEntrepreneurships(filters);
  const [selectedEntrepreneurshipId, setSelectedEntrepreneurshipId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error al cargar los emprendimientos</p>
      </div>
    );
  }

  if (entrepreneurships.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron emprendimientos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {entrepreneurships.map((entrepreneurship) => (
        <Card key={entrepreneurship.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={entrepreneurship.logo} />
                  <AvatarFallback>
                    {entrepreneurship.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg line-clamp-1">
                    {entrepreneurship.name}
                  </CardTitle>
                  <CardDescription className="flex items-center text-sm">
                    <span>{entrepreneurship.owner.firstName} {entrepreneurship.owner.lastName}</span>
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {entrepreneurship.description}
            </p>

            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className={businessStageColors[entrepreneurship.businessStage]}
              >
                {businessStageLabels[entrepreneurship.businessStage]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {entrepreneurship.category}
              </span>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{entrepreneurship.municipality}, {entrepreneurship.department}</span>
              </div>
              
              {entrepreneurship.founded && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Fundado en {new Date(entrepreneurship.founded).getFullYear()}</span>
                </div>
              )}

              {entrepreneurship.employees && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{entrepreneurship.employees} empleados</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{entrepreneurship.viewsCount}</span>
                </div>
                {entrepreneurship.rating && Number(entrepreneurship.rating) > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
                    <span>{Number(entrepreneurship.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {entrepreneurship.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={entrepreneurship.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button size="sm" onClick={() => setSelectedEntrepreneurshipId(entrepreneurship.id)}>
                  Ver Detalles
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedEntrepreneurshipId && (
        <EntrepreneurshipDetailsModal
          entrepreneurshipId={selectedEntrepreneurshipId}
          isOpen={!!selectedEntrepreneurshipId}
          onClose={() => setSelectedEntrepreneurshipId(null)}
        />
      )}
    </div>
  );
}