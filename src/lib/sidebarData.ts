import {
  LayoutDashboard,
  Search,
  FileText,
  GraduationCap,
  Lightbulb,
  User,
  BarChart3,
  Briefcase,
  Building2,
  Users,
  Settings,
  PieChart,
  UserCog,
  Command,
  GalleryVerticalEnd,
  AudioWaveform,
  Newspaper,
  UserCircle,
  MessageCircle,
  Calendar,
  Award,
  BookOpen,
  Compass,
  Shield,
  Database,
  Globe,
  Bookmark,
  UserPlus,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import type { UserRole, InstitutionType } from "@/types";

export interface SidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export interface SidebarData {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  teams: Array<{
    name: string;
    logo: React.ComponentType<{ className?: string }>;
    plan: string;
  }>;
  navGroups: SidebarGroup[];
}

const commonTeams = [
  {
    name: "CEMSE Platform",
    logo: Command,
    plan: "Employability & Entrepreneurship",
  },
  {
    name: "Cochabamba",
    logo: GalleryVerticalEnd,
    plan: "Regional Hub",
  },
  {
    name: "Bolivia",
    logo: AudioWaveform,
    plan: "National Network",
  },
];

// YOUTH navigation
export const youthSidebarData: SidebarData = {
  user: {
    name: "Usuario Joven",
    email: "youth@example.com",
    avatar: "/avatars/youth.jpg",
  },
  teams: commonTeams,
  navGroups: [
    {
      title: "Principal",
      items: [
        {
          title: "Panel Principal",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Empleos",
          url: "/jobs",
          icon: Search,
        },
        {
          title: "Mis Postulaciones",
          url: "/youth-applications",
          icon: FileText,
        },
        {
          title: "Instituciones",
          url: "/institutions",
          icon: Building2,
        },
        {
          title: "Mi Perfil",
          url: "/profile",
          icon: User,
        },
      ],
    },
    {
      title: "Desarrollo",
      items: [
        {
          title: "Cursos",
          url: "/courses",
          icon: GraduationCap,
        },
        {
          title: "Certificados",
          url: "/certificates",
          icon: Award,
        },
        {
          title: "Recursos",
          url: "/resources",
          icon: FileText,
        },
      ],
    },
    {
      title: "Emprendimiento",
      items: [
        {
          title: "Hub de Emprendimiento",
          url: "/entrepreneurship",
          icon: Lightbulb,
        },
      ],
    },
    {
      title: "Información",
      items: [
        {
          title: "Noticias",
          icon: Newspaper,
          url: "/news",
        },
      ],
    },
  ],
};

// COMPANIES navigation
export const companySidebarData: SidebarData = {
  user: {
    name: "Empresa",
    email: "company@example.com",
    avatar: "/avatars/company.jpg",
  },
  teams: commonTeams,
  navGroups: [
    {
      title: "Principal",
      items: [
        {
          title: "Panel Principal",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Ofertas de Trabajo",
          url: "/jobs",
          icon: Briefcase,
        },
        /*{
          title: "Candidatos",
          url: "/candidates",
          icon: Users,
        },*/
        {
          title: "Descubre Talento",
          url: "/talent",
          icon: UserPlus,
        },
      ],
    },
    //{
      //title: "Comunicación",
      //items: [
        //{
          //title: "Mensajes",
          //url: "/messages",
          //icon: MessageSquare,
        //},
      //],
    //},
    {
      title: "Recursos",
      items: [
        {
          title: "Ver Recursos",
          url: "/resources",
          icon: FileText,
        },
      ],
    },
    {
      title: "Información",
      items: [
        {
          title: "Noticias",
          url: "/news",
          icon: Newspaper,
        },
      ],
    },
    //{
      //title: "Análisis",
      //items: [
        //{
          //title: "Estadísticas",
          //url: "/analytics",
          //icon: BarChart3,
        //},
      //],
    //},
    //},
    {
      title: "Personal",
      items: [
        {
          title: "Mi Empresa",
          url: "/company",
          icon: Building2,
        },
        {
          title: "Configuración",
          url: "/settings",
          icon: Settings,
        },
      ],
    },
  ],
};

// INSTITUTION navigation - Municipality type
export const municipalitySidebarData: SidebarData = {
  user: {
    name: "Gobierno Municipal",
    email: "municipality@example.com",
    avatar: "/avatars/municipality.jpg",
  },
  teams: commonTeams,
  navGroups: [
    {
      title: "Principal",
      items: [
        {
          title: "Panel Principal",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Gestión de Empresas",
          url: "/admin/companies",
          icon: Building2,
        },
        {
          title: "Gestión de Instituciones",
          url: "/admin/institutions",
          icon: Building2,
        },
        {
          title: "Gestión de Jóvenes",
          url: "/admin/users",
          icon: UserCog,
        },
      ],
    },
    {
      title: "Programas",
      items: [
        {
          title: "Gestión de Cursos",
          url: "/admin/courses",
          icon: GraduationCap,
        },
        {
          title: "Gestión de Recursos",
          url: "/resources",
          icon: FileText,
        },
      ],
    },
    {
      title: "Comunicación",
      items: [
        {
          title: "Gestión de Noticias",
          url: "/news",
          icon: Newspaper,
        },
      ],
    },
    {
      title: "Personal",
      items: [
        {
          title: "Mi Institución",
          url: "/institution",
          icon: Building2,
        },
        {
          title: "Configuración",
          url: "/settings",
          icon: Settings,
        },
      ],
    },
  ],
};

// INSTITUTION navigation - Other types (NGO, Training Center, Foundation)
export const otherInstitutionSidebarData: SidebarData = {
  user: {
    name: "Institución",
    email: "institution@example.com",
    avatar: "/avatars/institution.jpg",
  },
  teams: commonTeams,
  navGroups: [
    {
      title: "Principal",
      items: [
        {
          title: "Panel Principal",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Estudiantes",
          url: "/students",
          icon: Users,
        },
      ],
    },
    {
      title: "Programas",
      items: [
        {
          title: "Gestión de Cursos",
          url: "/admin/courses",
          icon: GraduationCap,
        },
        {
          title: "Gestión de Recursos",
          url: "/resources",
          icon: FileText,
        },
      ],
    },
    {
      title: "Comunicación",
      items: [
        {
          title: "Gestión de Noticias",
          url: "/news",
          icon: Newspaper,
        },
      ],
    },
    {
      title: "Personal",
      items: [
        {
          title: "Mi Institución",
          url: "/institution",
          icon: Building2,
        },
        {
          title: "Configuración",
          url: "/settings",
          icon: Settings,
        },
      ],
    },
  ],
};

// SUPERADMIN navigation
export const superAdminSidebarData: SidebarData = {
  user: {
    name: "Super Administrador",
    email: "admin@cemse.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: commonTeams,
  navGroups: [
    {
      title: "Principal",
      items: [
        {
          title: "Panel Principal",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Gestión de Jóvenes",
          url: "/admin/users",
          icon: UserCog,
        },
        {
          title: "Gestión de Instituciones",
          url: "/admin/institutions",
          icon: Building2,
        },
        {
          title: "Gestión de Empresas",
          url: "/admin/companies",
          icon: Building2,
        },
      ],
    },
    {
      title: "Capacitación",
      items: [
        {
          title: "Gestión de Cursos",
          url: "/admin/courses",
          icon: GraduationCap,
        },
      ],
    },
    {
      title: "Empleos",
      items: [
        {
          title: "Gestión de Empleos",
          url: "/admin/jobs",
          icon: Briefcase,
        },
        {
          title: "Candidatos",
          url: "/admin/job-applications",
          icon: Users,
        },
      ],
    },
    {
      title: "Emprendimiento",
      items: [
        {
          title: "Gestión de Recursos",
          url: "/admin/entrepreneurship",
          icon: Lightbulb,
        },
      ],
    },
    {
      title: "Comunicación",
      items: [
        {
          title: "Gestión de Noticias",
          url: "/admin/news",
          icon: Newspaper,
        },
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          title: "Base de Datos",
          url: "/admin/database",
          icon: Database,
        },
        {
          title: "Estadísticas",
          url: "/admin/analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Personal",
      items: [
        {
          title: "Configuración",
          url: "/admin/settings",
          icon: Settings,
        },
        {
          title: "Mi Perfil",
          url: "/profile",
          icon: User,
        },
      ],
    },
  ],
};

export function getSidebarDataByRole(role: UserRole, institutionType?: InstitutionType): SidebarData {
  console.log("🔍 getSidebarDataByRole - Role:", role, "InstitutionType:", institutionType);

  switch (role) {
    case "YOUTH":
      return youthSidebarData;
    case "COMPANIES":
      return companySidebarData;
    case "INSTITUTION":
      // Check institution type to determine which sidebar to show
      if (institutionType === "MUNICIPALITY") {
        return municipalitySidebarData;
      }
      return otherInstitutionSidebarData;
    case "SUPERADMIN":
      return superAdminSidebarData;
    default:
      console.log(
        "🔍 getSidebarDataByRole - No match for role:",
        role,
        "using youthSidebarData as fallback"
      );
      return youthSidebarData; // Default fallback to youth data
  }
}
