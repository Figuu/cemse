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

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logo: string;
    location: string;
  };
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  postedAt: Date;
  deadline: Date;
  isBookmarked: boolean;
  isApplied: boolean;
  experience: string;
  education: string;
  skills: string[];
  remote: boolean;
  urgent: boolean;
  bookmarkedAt: Date;
}

export default function BookmarkedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app, this would come from an API
  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: "1",
        title: "Desarrollador Frontend React",
        company: {
          name: "TechCorp México",
          logo: "/logos/techcorp.png",
          location: "Ciudad de México"
        },
        location: "Ciudad de México",
        type: "full-time",
        salary: {
          min: 25000,
          max: 40000,
          currency: "MXN"
        },
        description: "Buscamos un desarrollador frontend con experiencia en React para unirse a nuestro equipo de desarrollo.",
        requirements: [
          "3+ años de experiencia con React",
          "Conocimiento de TypeScript",
          "Experiencia con Redux o Context API",
          "Conocimiento de HTML5, CSS3 y JavaScript ES6+"
        ],
        benefits: [
          "Seguro médico",
          "Vales de despensa",
          "Horario flexible",
          "Trabajo remoto"
        ],
        postedAt: new Date("2024-01-15"),
        deadline: new Date("2024-02-15"),
        isBookmarked: true,
        isApplied: false,
        experience: "3-5 años",
        education: "Licenciatura",
        skills: ["React", "TypeScript", "JavaScript", "CSS"],
        remote: true,
        urgent: false,
        bookmarkedAt: new Date("2024-01-16")
      },
      {
        id: "2",
        title: "Diseñador UX/UI",
        company: {
          name: "DesignStudio",
          logo: "/logos/designstudio.png",
          location: "Guadalajara"
        },
        location: "Guadalajara",
        type: "full-time",
        salary: {
          min: 20000,
          max: 35000,
          currency: "MXN"
        },
        description: "Estamos buscando un diseñador UX/UI creativo y apasionado para diseñar experiencias digitales excepcionales.",
        requirements: [
          "Portafolio sólido en diseño UX/UI",
          "Experiencia con Figma o Sketch",
          "Conocimiento de principios de UX",
          "Experiencia trabajando con equipos de desarrollo"
        ],
        benefits: [
          "Seguro médico",
          "Bonos por desempeño",
          "Capacitación continua",
          "Ambiente creativo"
        ],
        postedAt: new Date("2024-01-14"),
        deadline: new Date("2024-02-10"),
        isBookmarked: true,
        isApplied: true,
        experience: "2-4 años",
        education: "Licenciatura",
        skills: ["Figma", "Sketch", "Adobe Creative Suite", "Prototyping"],
        remote: false,
        urgent: true,
        bookmarkedAt: new Date("2024-01-15")
      },
      {
        id: "3",
        title: "Marketing Digital Specialist",
        company: {
          name: "Growth Agency",
          logo: "/logos/growth.png",
          location: "Monterrey"
        },
        location: "Monterrey",
        type: "contract",
        salary: {
          min: 18000,
          max: 28000,
          currency: "MXN"
        },
        description: "Especialista en marketing digital para gestionar campañas en redes sociales y Google Ads.",
        requirements: [
          "Experiencia en Google Ads y Facebook Ads",
          "Conocimiento de Google Analytics",
          "Experiencia en gestión de redes sociales",
          "Habilidades de copywriting"
        ],
        benefits: [
          "Trabajo remoto",
          "Horario flexible",
          "Proyectos diversos"
        ],
        postedAt: new Date("2024-01-13"),
        deadline: new Date("2024-02-05"),
        isBookmarked: true,
        isApplied: false,
        experience: "1-3 años",
        education: "Técnico",
        skills: ["Google Ads", "Facebook Ads", "Analytics", "Social Media"],
        remote: true,
        urgent: false,
        bookmarkedAt: new Date("2024-01-14")
      }
    ];

    setTimeout(() => {
      setJobs(mockJobs);
      setFilteredJobs(mockJobs);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = jobs;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.bookmarkedAt.getTime() - a.bookmarkedAt.getTime();
        case "oldest":
          return a.bookmarkedAt.getTime() - b.bookmarkedAt.getTime();
        case "deadline":
          return a.deadline.getTime() - b.deadline.getTime();
        case "salary-high":
          return b.salary.max - a.salary.max;
        case "salary-low":
          return a.salary.min - b.salary.min;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, sortBy]);

  const handleBookmark = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const handleApply = (jobId: string) => {
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, isApplied: true } : job
    ));
  };

  const clearAllBookmarks = () => {
    setJobs([]);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trabajos Guardados</h1>
          <p className="text-muted-foreground">
            {filteredJobs.length} trabajos guardados
          </p>
        </div>
        {jobs.length > 0 && (
          <Button variant="outline" onClick={clearAllBookmarks}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar Todo
          </Button>
        )}
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar trabajos guardados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm"
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
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        }>
          {filteredJobs.map(job => {
            const jobPosting = {
              id: job.id,
              title: job.title,
              description: job.description || "",
              requirements: job.requirements || [],
              responsibilities: [],
              benefits: job.benefits || [],
              location: job.location,
              city: job.location,
              state: "",
              country: "",
              remoteWork: job.remote,
              hybridWork: false,
              officeWork: !job.remote,
              employmentType: job.type.toUpperCase() as any,
              experienceLevel: "MID_LEVEL" as any,
              salaryMin: job.salary.min,
              salaryMax: job.salary.max,
              currency: job.salary.currency,
              isActive: true,
              isFeatured: false,
              isUrgent: false,
              applicationDeadline: job.deadline.toISOString(),
              startDate: undefined,
              totalViews: 0,
              totalApplications: 0,
              totalLikes: 0,
              totalShares: 0,
              tags: [],
              skills: job.skills || [],
              department: undefined,
              reportingTo: undefined,
              companyId: "company-" + job.id,
              company: {
                id: "company-" + job.id,
                name: job.company.name,
                logo: job.company.logo,
                location: job.company.location,
                description: "",
                website: "",
                industry: "",
                size: "MEDIUM" as any,
                foundedYear: 2020,
                isVerified: true,
                isActive: true,
                socialMedia: {},
                benefits: [],
                culture: "",
                mission: "",
                vision: "",
                values: [],
                technologies: [],
                languages: [],
                remoteWork: false,
                hybridWork: false,
                officeWork: true,
                totalEmployees: 0,
                totalJobs: 0,
                totalApplications: 0,
                averageRating: 0,
                totalReviews: 0,
                views: 0,
                followers: 0,
                isPublic: true,
                isFeatured: false,
                ownerId: "",
                owner: {
                  id: "",
                  email: "",
                  profile: {
                    firstName: "",
                    lastName: "",
                    avatarUrl: ""
                  }
                },
                jobs: [],
                reviews: [],
                followersList: [],
                createdAt: "",
                updatedAt: "",
                _count: {
                  jobs: 0,
                  reviews: 0,
                  followersList: 0,
                  applications: 0
                }
              },
              applications: [],
              likes: [],
              shares: [],
              createdAt: job.postedAt.toISOString(),
              updatedAt: job.postedAt.toISOString(),
              _count: {
                applications: 0
              }
            };
            
            return (
              <JobCard
                key={job.id}
                job={jobPosting}
                onBookmark={handleBookmark}
                onApply={handleApply}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
