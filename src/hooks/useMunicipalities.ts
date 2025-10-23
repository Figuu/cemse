import { useQuery } from "@tanstack/react-query";

export function useMunicipalities() {
  return useQuery({
    queryKey: ["municipalities"],
    queryFn: async (): Promise<{ municipalities: Array<{ id: string; name: string; department: string; region: string }> }> => {
      const response = await fetch("/api/municipalities");
      if (!response.ok) {
        throw new Error("Failed to fetch municipalities");
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}
