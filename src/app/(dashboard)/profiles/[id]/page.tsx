"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  MapPin, 
  Star,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  Download,
  Users,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Github
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import Link from "next/link";

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  title: string;
  location: string;
  experience: string;
  education: string;
  skills: string[];
  bio: string;
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  views: number;
  connections: number;
  lastActive: string;
  role: "YOUTH" | "COMPANIES" | "INSTITUTION" | "SUPERADMIN";
  workExperience: WorkExperience[];
  educationHistory: Education[];
  certifications: Certification[];
  projects: Project[];
  socialLinks: SocialLinks;
  contactInfo: ContactInfo;
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  url?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  imageUrl?: string;
}

interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
}

interface ContactInfo {
  email: string;
  phone?: string;
  address?: string;
}

const mockProfile: Profile = {
  id: "1",
  firstName: "María",
  lastName: "González",
  email: "maria.gonzalez@email.com",
  avatarUrl: "/api/placeholder/200/200",
  title: "Desarrolladora Frontend Senior",
  location: "La Paz, Bolivia",
  experience: "5 años",
  education: "Ingeniería de Sistemas - UMSA",
  skills: ["React", "TypeScript", "Node.js", "MongoDB", "AWS", "Docker", "GraphQL", "Next.js"],
  bio: "Desarrolladora frontend apasionada por crear experiencias web excepcionales. Especializada en React y tecnologías modernas, con experiencia en proyectos de gran escala y equipos ágiles. Me encanta resolver problemas complejos y crear soluciones elegantes que mejoren la vida de los usuarios.",
  isVerified: true,
  isAvailable: true,
  rating: 4.8,
  views: 1245,
  connections: 289,
  lastActive: "2024-01-20T10:30:00Z",
  role: "YOUTH",
  workExperience: [
    {
      id: "1",
      company: "TechCorp Bolivia",
      position: "Desarrolladora Frontend Senior",
      startDate: "2022-01-01",
      endDate: "2024-01-01",
      description: "Lideré el desarrollo de aplicaciones web modernas usando React y TypeScript.",
      achievements: [
        "Mejoré el rendimiento de la aplicación en un 40%",
        "Implementé un sistema de componentes reutilizables",
        "Mentoré a 3 desarrolladores junior"
      ]
    },
    {
      id: "2",
      company: "StartupXYZ",
      position: "Desarrolladora Frontend",
      startDate: "2020-06-01",
      endDate: "2021-12-31",
      description: "Desarrollé interfaces de usuario para una plataforma de e-commerce.",
      achievements: [
        "Creé un sistema de diseño consistente",
        "Implementé integración con APIs de pago",
        "Reduje el tiempo de carga en un 30%"
      ]
    }
  ],
  educationHistory: [
    {
      id: "1",
      institution: "Universidad Mayor de San Andrés",
      degree: "Ingeniería de Sistemas",
      field: "Ciencias de la Computación",
      startDate: "2016-01-01",
      endDate: "2020-12-31",
      gpa: 3.8
    }
  ],
  certifications: [
    {
      id: "1",
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2023-06-15",
      credentialId: "AWS-DEV-123456"
    },
    {
      id: "2",
      name: "React Developer Certification",
      issuer: "Meta",
      date: "2022-03-20"
    }
  ],
  projects: [
    {
      id: "1",
      name: "E-commerce Platform",
      description: "Plataforma completa de e-commerce con carrito de compras, pagos y gestión de inventario.",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      url: "https://ecommerce-demo.com",
      githubUrl: "https://github.com/maria/ecommerce-platform"
    },
    {
      id: "2",
      name: "Task Management App",
      description: "Aplicación de gestión de tareas con colaboración en tiempo real.",
      technologies: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
      githubUrl: "https://github.com/maria/task-manager"
    }
  ],
  socialLinks: {
    linkedin: "https://linkedin.com/in/maria-gonzalez",
    github: "https://github.com/maria-gonzalez",
    twitter: "https://twitter.com/maria_dev",
    website: "https://mariagonzalez.dev"
  },
  contactInfo: {
    email: "maria.gonzalez@email.com",
    phone: "+591 70123456",
    address: "La Paz, Bolivia"
  }
};

export default function ProfileDetailPage() {
  const params = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProfile(mockProfile);
      setIsLoading(false);
    }, 1000);
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Activo ahora";
    if (diffInHours < 24) return `Activo hace ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Activo hace ${diffInDays}d`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Perfil no encontrado</h3>
            <p className="text-muted-foreground">
              El perfil que buscas no existe o ha sido eliminado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/profiles">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Perfiles
        </Link>
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center lg:items-start">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.firstName, profile.lastName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center lg:text-left">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  {profile.isVerified && (
                    <Badge variant="secondary">Verificado</Badge>
                  )}
                </div>
                <p className="text-lg text-muted-foreground mb-2">{profile.title}</p>
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    {profile.rating}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {profile.views} vistas
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {profile.connections} conexiones
                  </div>
                </div>
              </div>
            </div>

            {/* Bio and Actions */}
            <div className="flex-1">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Acerca de</h3>
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
                <Button variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar CV
                </Button>
              </div>
            </div>

            {/* Status and Contact */}
            <div className="lg:w-64">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                        profile.isAvailable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      )}>
                        {profile.isAvailable ? "Disponible" : "No disponible"}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatLastActive(profile.lastActive)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="truncate">{profile.contactInfo.email}</span>
                      </div>
                      {profile.contactInfo.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{profile.contactInfo.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {profile.socialLinks.linkedin && (
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Button>
                      )}
                      {profile.socialLinks.github && (
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </Button>
                      )}
                      {profile.socialLinks.website && (
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Globe className="h-4 w-4 mr-2" />
                          Sitio Web
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="experience">Experiencia</TabsTrigger>
          <TabsTrigger value="education">Educación</TabsTrigger>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Experiencia Laboral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.workExperience.slice(0, 2).map((exp) => (
                    <div key={exp.id} className="border-l-2 border-blue-500 pl-4">
                      <h4 className="font-semibold">{exp.position}</h4>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Presente"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Educación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.educationHistory.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-green-500 pl-4">
                      <h4 className="font-semibold">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : "Presente"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Experiencia Laboral Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {profile.workExperience.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-blue-500 pl-6 pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold">{exp.position}</h4>
                        <p className="text-muted-foreground">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Presente"}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{exp.description}</p>
                    <div>
                      <h5 className="font-medium mb-2">Logros:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {exp.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Educación y Certificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Educación</h4>
                  <div className="space-y-4">
                    {profile.educationHistory.map((edu) => (
                      <div key={edu.id} className="border-l-2 border-green-500 pl-6">
                        <h5 className="font-semibold">{edu.degree}</h5>
                        <p className="text-muted-foreground">{edu.institution}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : "Presente"}
                        </p>
                        {edu.gpa && (
                          <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Certificaciones</h4>
                  <div className="space-y-4">
                    {profile.certifications.map((cert) => (
                      <div key={cert.id} className="border-l-2 border-purple-500 pl-6">
                        <h5 className="font-semibold">{cert.name}</h5>
                        <p className="text-muted-foreground">{cert.issuer}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(cert.date)}
                        </p>
                        {cert.credentialId && (
                          <p className="text-sm text-muted-foreground">
                            ID: {cert.credentialId}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proyectos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.projects.map((project) => (
                  <Card key={project.id}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">{project.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        {project.url && (
                          <Button size="sm" variant="outline">
                            <Globe className="h-4 w-4 mr-1" />
                            Ver Demo
                          </Button>
                        )}
                        {project.githubUrl && (
                          <Button size="sm" variant="outline">
                            <Github className="h-4 w-4 mr-1" />
                            Código
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
