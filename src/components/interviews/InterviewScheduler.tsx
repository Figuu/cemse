"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  Users, 
  Code,
  Save,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/utils";

interface InterviewSchedulerProps {
  applicationId: string;
  jobTitle: string;
  candidateName: string;
  onSave: (data: {
    type: string;
    scheduledAt: string;
    duration: number;
    location?: string;
    meetingLink?: string;
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export function InterviewScheduler({ 
  applicationId, 
  jobTitle, 
  candidateName, 
  onSave, 
  onCancel, 
  isLoading = false,
  className 
}: InterviewSchedulerProps) {
  const [formData, setFormData] = useState({
    type: "VIDEO" as "PHONE" | "VIDEO" | "IN_PERSON" | "TECHNICAL",
    scheduledAt: "",
    duration: 60,
    location: "",
    meetingLink: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PHONE":
        return <Phone className="h-4 w-4" />;
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "IN_PERSON":
        return <Users className="h-4 w-4" />;
      case "TECHNICAL":
        return <Code className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "PHONE":
        return "Llamada Telefónica";
      case "VIDEO":
        return "Videollamada";
      case "IN_PERSON":
        return "Presencial";
      case "TECHNICAL":
        return "Técnica";
      default:
        return type;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = "La fecha y hora son requeridas";
    } else if (new Date(formData.scheduledAt) <= new Date()) {
      newErrors.scheduledAt = "La fecha debe ser futura";
    }

    if (formData.duration < 15 || formData.duration > 480) {
      newErrors.duration = "La duración debe estar entre 15 y 480 minutos";
    }

    if (formData.type === "IN_PERSON" && !formData.location.trim()) {
      newErrors.location = "La ubicación es requerida para entrevistas presenciales";
    }

    if (formData.type === "VIDEO" && !formData.meetingLink.trim()) {
      newErrors.meetingLink = "El enlace de la reunión es requerido para videollamadas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSave({
        type: formData.type,
        scheduledAt: formData.scheduledAt,
        duration: formData.duration,
        location: formData.location || undefined,
        meetingLink: formData.meetingLink || undefined,
        notes: formData.notes || undefined,
      });
    } catch (error) {
      console.error("Error saving interview:", error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Programar Entrevista
        </CardTitle>
        <CardDescription>
          Programar entrevista para {candidateName} - {jobTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interview Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Entrevista</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PHONE">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Llamada Telefónica
                  </div>
                </SelectItem>
                <SelectItem value="VIDEO">
                  <div className="flex items-center">
                    <Video className="h-4 w-4 mr-2" />
                    Videollamada
                  </div>
                </SelectItem>
                <SelectItem value="IN_PERSON">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Presencial
                  </div>
                </SelectItem>
                <SelectItem value="TECHNICAL">
                  <div className="flex items-center">
                    <Code className="h-4 w-4 mr-2" />
                    Técnica
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Fecha y Hora</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => handleInputChange("scheduledAt", e.target.value)}
                className={errors.scheduledAt ? "border-red-500" : ""}
              />
              {errors.scheduledAt && (
                <p className="text-sm text-red-500">{errors.scheduledAt}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="480"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 60)}
                className={errors.duration ? "border-red-500" : ""}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration}</p>
              )}
            </div>
          </div>

          {/* Location (for in-person interviews) */}
          {formData.type === "IN_PERSON" && (
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Dirección de la entrevista"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className={cn("pl-10", errors.location ? "border-red-500" : "")}
                />
              </div>
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          )}

          {/* Meeting Link (for video interviews) */}
          {formData.type === "VIDEO" && (
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Enlace de la Reunión</Label>
              <div className="relative">
                <Video className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="meetingLink"
                  placeholder="https://meet.google.com/..."
                  value={formData.meetingLink}
                  onChange={(e) => handleInputChange("meetingLink", e.target.value)}
                  className={cn("pl-10", errors.meetingLink ? "border-red-500" : "")}
                />
              </div>
              {errors.meetingLink && (
                <p className="text-sm text-red-500">{errors.meetingLink}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              placeholder="Información adicional sobre la entrevista..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Vista Previa</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                {getTypeIcon(formData.type)}
                <span className="ml-2">{getTypeLabel(formData.type)}</span>
              </div>
              {formData.scheduledAt && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4" />
                  <span className="ml-2">
                    {formatDateTime(formData.scheduledAt)} ({formData.duration} min)
                  </span>
                </div>
              )}
              {formData.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4" />
                  <span className="ml-2">{formData.location}</span>
                </div>
              )}
              {formData.meetingLink && (
                <div className="flex items-center">
                  <Video className="h-4 w-4" />
                  <span className="ml-2 text-blue-600 hover:underline">
                    {formData.meetingLink}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Programando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Programar Entrevista
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
