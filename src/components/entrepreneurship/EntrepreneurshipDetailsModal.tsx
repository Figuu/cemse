"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Eye,
  Star,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Building,
  DollarSign,
  TrendingUp,
  Target,
  Lightbulb,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useEntrepreneurship } from "@/hooks/useEntrepreneurships";
import { useEntrepreneurshipConnections } from "@/hooks/useEntrepreneurshipConnections";
import { ConnectionRequestModal } from "./ConnectionRequestModal";
import { ChatSidebar } from "./ChatSidebar";
import { useSession } from "next-auth/react";
import { BusinessStage } from "@prisma/client";

interface EntrepreneurshipDetailsModalProps {
  entrepreneurshipId: string;
  isOpen: boolean;
  onClose: () => void;
}

const businessStageLabels: Record<BusinessStage, string> = {
  IDEA: "Idea",
  STARTUP: "Inicio",
  GROWING: "Crecimiento",
  ESTABLISHED: "Establecido",
};

const businessStageColors: Record<BusinessStage, string> = {
  IDEA: "bg-blue-100 text-blue-800",
  STARTUP: "bg-green-100 text-green-800",
  GROWING: "bg-yellow-100 text-yellow-800",
  ESTABLISHED: "bg-purple-100 text-purple-800",
};

export function EntrepreneurshipDetailsModal({ 
  entrepreneurshipId, 
  isOpen, 
  onClose 
}: EntrepreneurshipDetailsModalProps) {
  const { data: session } = useSession();
  const { data: entrepreneurship, isLoading, error } = useEntrepreneurship(entrepreneurshipId);
  const { connections } = useEntrepreneurshipConnections();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargando...</DialogTitle>
            <DialogDescription>Obteniendo información del emprendimiento</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !entrepreneurship) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>No se pudo cargar la información del emprendimiento</DialogDescription>
          </DialogHeader>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Por favor, intenta nuevamente más tarde</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const images = entrepreneurship.images || [];
  const socialMedia = entrepreneurship.socialMedia ? 
    (typeof entrepreneurship.socialMedia === 'string' ? 
      JSON.parse(entrepreneurship.socialMedia) : 
      entrepreneurship.socialMedia) : {};

  // Check if user is authenticated and not trying to connect with themselves
  const isAuthenticated = !!session?.user?.id;
  const isOwnEntrepreneurship = session?.user?.id === entrepreneurship.owner.userId;

  // Debug logs
  console.log('Debug EntrepreneurshipDetailsModal:');
  console.log('session?.user?.id:', session?.user?.id);
  console.log('entrepreneurship.owner.userId:', entrepreneurship.owner.userId);
  console.log('isOwnEntrepreneurship:', isOwnEntrepreneurship);

  // Check connection status
  const existingConnection = connections.find(conn =>
    (conn.requesterId === session?.user?.id || conn.addresseeId === session?.user?.id) &&
    (conn.requesterId === entrepreneurship.owner.userId || conn.addresseeId === entrepreneurship.owner.userId)
  );

  const getConnectionButtonText = () => {
    if (!existingConnection) return "Conectar";
    switch (existingConnection.status) {
      case "PENDING":
        return existingConnection.requesterId === session?.user?.id ? "Solicitud Enviada" : "Responder Solicitud";
      case "ACCEPTED":
        return "Conectado";
      case "DECLINED":
        return "Conectar";
      default:
        return "Conectar";
    }
  };

  const canConnect = isAuthenticated && !isOwnEntrepreneurship && (!existingConnection || existingConnection.status === "DECLINED");
  
  // Debug logs for button logic
  console.log('canConnect:', canConnect);
  console.log('existingConnection:', existingConnection);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{entrepreneurship.name}</DialogTitle>
          <DialogDescription className="flex items-center mt-2">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={entrepreneurship.owner.avatarUrl} />
              <AvatarFallback>
                {entrepreneurship.owner.firstName.substring(0, 1)}{entrepreneurship.owner.lastName.substring(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span>{entrepreneurship.owner.firstName} {entrepreneurship.owner.lastName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="absolute right-4 top-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Images Section */}
          {images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Galería
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={images[currentImageIndex]}
                      alt={`${entrepreneurship.name} - Imagen ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === 0 ? images.length - 1 : prev - 1
                        )}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === images.length - 1 ? 0 : prev + 1
                        )}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex justify-center mt-4 space-x-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Descripción</h4>
                  <p className="text-sm">{entrepreneurship.description}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Categoría</span>
                    <Badge variant="secondary">{entrepreneurship.category}</Badge>
                  </div>
                  
                  {entrepreneurship.subcategory && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Subcategoría</span>
                      <span className="text-sm">{entrepreneurship.subcategory}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Etapa del Negocio</span>
                    <Badge className={businessStageColors[entrepreneurship.businessStage]}>
                      {businessStageLabels[entrepreneurship.businessStage]}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Información del Negocio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{entrepreneurship.municipality}, {entrepreneurship.department}</span>
                  </div>
                  
                  {entrepreneurship.founded && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Fundado en {new Date(entrepreneurship.founded).getFullYear()}</span>
                    </div>
                  )}
                  
                  {entrepreneurship.employees && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{entrepreneurship.employees} empleados</span>
                    </div>
                  )}
                  
                  {entrepreneurship.annualRevenue && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">${Number(entrepreneurship.annualRevenue).toLocaleString()} USD anuales</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{entrepreneurship.viewsCount} visualizaciones</span>
                  </div>
                  
                  {entrepreneurship.rating && Number(entrepreneurship.rating) > 0 && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                      <span className="text-sm">{Number(entrepreneurship.rating).toFixed(1)} ({entrepreneurship.reviewsCount} reseñas)</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{entrepreneurship.isActive ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Model & Target Market */}
          {(entrepreneurship.businessModel || entrepreneurship.targetMarket) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Modelo de Negocio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {entrepreneurship.businessModel && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Modelo de Negocio</h4>
                    <p className="text-sm">{entrepreneurship.businessModel}</p>
                  </div>
                )}
                
                {entrepreneurship.targetMarket && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Mercado Objetivo</h4>
                    <p className="text-sm">{entrepreneurship.targetMarket}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {entrepreneurship.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={entrepreneurship.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {entrepreneurship.website}
                      </a>
                    </div>
                  )}
                  
                  {entrepreneurship.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={`mailto:${entrepreneurship.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {entrepreneurship.email}
                      </a>
                    </div>
                  )}
                  
                  {entrepreneurship.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={`tel:${entrepreneurship.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {entrepreneurship.phone}
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {entrepreneurship.address && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{entrepreneurship.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          {Object.keys(socialMedia).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Redes Sociales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(socialMedia).map(([platform, url]) => (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={url as string} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {!isAuthenticated && (
              <Button disabled variant="outline">
                Inicia sesión para conectar
              </Button>
            )}
            {isAuthenticated && isOwnEntrepreneurship && (
              <Button disabled variant="outline">
                Tu propio emprendimiento
              </Button>
            )}
            {canConnect && (
              <Button onClick={() => setShowConnectionModal(true)}>
                {getConnectionButtonText()}
              </Button>
            )}
            {existingConnection?.status === "ACCEPTED" && (
              <Button onClick={() => setShowChat(true)}>
                Chatear
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {showConnectionModal && (
        <ConnectionRequestModal
          isOpen={showConnectionModal}
          onClose={() => setShowConnectionModal(false)}
          targetUser={{
            id: entrepreneurship.owner.userId,
            firstName: entrepreneurship.owner.firstName,
            lastName: entrepreneurship.owner.lastName,
            avatarUrl: entrepreneurship.owner.avatarUrl
          }}
          entrepreneurshipName={entrepreneurship.name}
        />
      )}

      {showChat && (
        <ChatSidebar
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          onMinimize={() => setShowChat(false)}
          recipientId={entrepreneurship.owner.userId}
          recipientName={`${entrepreneurship.owner.firstName} ${entrepreneurship.owner.lastName}`}
          recipientAvatar={entrepreneurship.owner.avatarUrl}
          entrepreneurshipId={entrepreneurship.id}
        />
      )}
    </Dialog>
  );
}
