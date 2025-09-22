"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/jobs/JobCard";
import { 
  Search, 
  Bookmark, 
  Grid,
  List,
  Trash2,
} from "lucide-react";
import { useBookmarkedJobs } from "@/hooks/useBookmarkedJobs";


export default function BookmarkedJobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch real data from API
  const { data: bookmarkedJobsData, isLoading } = useBookmarkedJobs({
    search: searchTerm,
    sortBy: sortBy === "newest" ? "createdAt" : sortBy === "oldest" ? "createdAt" : sortBy,
    sortOrder: sortBy === "newest" ? "desc" : sortBy === "oldest" ? "asc" : "desc",
    limit: 50
  });

  const jobs = bookmarkedJobsData?.jobs || [];
  const filteredJobs = jobs; // API already handles filtering

  const handleBookmark = (jobId: string) => {
    // This would call the API to remove bookmark
    // For now, just a placeholder
    console.log("Remove bookmark for job:", jobId);
  };

  const handleApply = (jobId: string) => {
    // This would call the API to apply to job
    // For now, just a placeholder
    console.log("Apply to job:", jobId);
  };

  const clearAllBookmarks = () => {
    // This would call the API to clear all bookmarks
    // For now, just a placeholder
    console.log("Clear all bookmarks");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trabajos Guardados</h1>
            <p className="text-muted-foreground">Tus trabajos favoritos guardados</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Trabajos Guardados</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {filteredJobs.length} trabajos guardados
          </p>
        </div>
        {jobs.length > 0 && (
          <Button variant="outline" onClick={clearAllBookmarks} size="sm" className="w-full sm:w-auto">
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar Todo
          </Button>
        )}
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar trabajos guardados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm flex-1 sm:flex-none"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="deadline">Por fecha límite</option>
            <option value="salary-high">Mayor salario</option>
            <option value="salary-low">Menor salario</option>
            <option value="title">Título A-Z</option>
          </select>
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? "No se encontraron trabajos" : "No tienes trabajos guardados"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? "Intenta ajustar tu búsqueda"
                : "Guarda trabajos que te interesen para revisarlos más tarde"
              }
            </p>
            {!searchTerm && (
              <Button className="mt-4" asChild>
                <a href="/jobs">Explorar Trabajos</a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-3 sm:space-y-4"
        }>
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              currentUserId="current-user" // This would come from session in real app
              onBookmark={handleBookmark}
              onApply={handleApply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
