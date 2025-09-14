import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CourseCreationData {
  title: string;
  shortDescription: string;
  description: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category: "SOFT_SKILLS" | "BASIC_COMPETENCIES" | "JOB_PLACEMENT" | "ENTREPRENEURSHIP" | "TECHNICAL_SKILLS" | "DIGITAL_LITERACY" | "COMMUNICATION" | "LEADERSHIP";
  duration: number;
  isMandatory?: boolean;
  certification?: boolean;
  thumbnail?: string;
  videoPreview?: string;
  objectives: string[];
  prerequisites?: string[];
  tags: string[];
  includedMaterials?: string[];
  institutionName: string;
}

export const useCourseCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createCourse = async (data: CourseCreationData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el curso");
      }

      const result = await response.json();
      
      // Invalidate and refetch courses data
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      
      return result;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      // Additional success handling if needed
    },
    onError: (error) => {
      console.error("Course creation mutation error:", error);
    },
  });

  return {
    createCourse: mutation.mutateAsync,
    isLoading: mutation.isPending || isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
};
