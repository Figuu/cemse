import { useQuery } from "@tanstack/react-query";

export function useJobSkills() {
  return useQuery({
    queryKey: ["job-skills"],
    queryFn: async (): Promise<{ skills: string[] }> => {
      const response = await fetch("/api/jobs/skills");
      if (!response.ok) {
        throw new Error("Failed to fetch job skills");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
