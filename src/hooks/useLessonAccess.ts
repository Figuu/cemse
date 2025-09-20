import { useQuery } from "@tanstack/react-query";

interface LessonAccessResponse {
  accessible: boolean;
  reason: string;
  blockingLesson?: {
    id: string;
    title: string;
    moduleTitle: string;
  };
  requiredQuiz?: {
    id: string;
    title: string;
    passingScore: number;
    currentScore: number;
  };
}

export function useLessonAccess(courseId: string, lessonId: string) {
  return useQuery<LessonAccessResponse>({
    queryKey: ["lesson-access", courseId, lessonId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/access`);
      if (!response.ok) {
        throw new Error("Failed to check lesson access");
      }
      return response.json();
    },
    enabled: !!courseId && !!lessonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


