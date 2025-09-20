"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from "./CourseForm";
import { useCourseCreation } from "@/hooks/useCourseCreation";
import { toast } from "sonner";

interface CourseCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CourseCreationModal = ({ isOpen, onClose, onSuccess }: CourseCreationModalProps) => {
  const { createCourse, isLoading } = useCourseCreation();

  const handleSubmit = async (data: any) => {
    try {
      await createCourse(data);
      toast.success("Curso creado exitosamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Error al crear el curso. Inténtalo de nuevo.");
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Crear Nuevo Curso</DialogTitle>
        </DialogHeader>
        <CourseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
