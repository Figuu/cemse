export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  industry?: string;
  size?: CompanySize;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  foundedYear?: number;
  isVerified: boolean;
  isActive: boolean;
  socialMedia?: Record<string, string>;
  benefits: string[];
  culture?: string;
  mission?: string;
  vision?: string;
  values: string[];
  technologies: string[];
  languages: string[];
  remoteWork: boolean;
  hybridWork: boolean;
  officeWork: boolean;
  totalEmployees?: number;
  totalJobs: number;
  totalApplications: number;
  averageRating?: number;
  totalReviews: number;
  views: number;
  followers: number;
  isPublic: boolean;
  isFeatured: boolean;
  ownerId: string;
  owner: {
    id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    };
  };
  jobs?: JobPosting[];
  reviews?: CompanyReview[];
  followersList?: CompanyFollow[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    jobs: number;
    reviews: number;
    followersList: number;
    applications: number;
  };
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  location: string;
  city?: string;
  state?: string;
  country?: string;
  remoteWork: boolean;
  hybridWork: boolean;
  officeWork: boolean;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  applicationDeadline?: string;
  startDate?: string;
  totalViews: number;
  totalApplications: number;
  totalLikes: number;
  totalShares: number;
  tags: string[];
  skills: string[];
  department?: string;
  reportingTo?: string;
  companyId: string;
  company: Company;
  applications?: JobApplication[];
  likes?: JobLike[];
  shares?: JobShare[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

export interface JobApplication {
  id: string;
  coverLetter?: string;
  resume?: string;
  portfolio?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  status: ApplicationStatus;
  notes?: string;
  appliedAt: string;
  reviewedAt?: string;
  interviewedAt?: string;
  rejectedAt?: string;
  hiredAt?: string;
  jobId: string;
  job: JobPosting;
  applicantId: string;
  applicant: {
    id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    };
  };
  companyId: string;
  company: Company;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyReview {
  id: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  workLifeBalance?: number;
  culture?: number;
  management?: number;
  benefits?: number;
  careerGrowth?: number;
  isVerified: boolean;
  isAnonymous: boolean;
  helpfulVotes: number;
  totalVotes: number;
  companyId: string;
  company: Company;
  authorId: string;
  author: {
    id: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CompanyFollow {
  id: string;
  companyId: string;
  company: Company;
  userId: string;
  user: {
    id: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    };
  };
  createdAt: string;
}

export interface JobLike {
  id: string;
  jobId: string;
  job: JobPosting;
  userId: string;
  user: {
    id: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    };
  };
  createdAt: string;
}

export interface JobShare {
  id: string;
  jobId: string;
  job: JobPosting;
  userId: string;
  user: {
    id: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    };
  };
  createdAt: string;
}

export enum CompanySize {
  STARTUP = "STARTUP",
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
  ENTERPRISE = "ENTERPRISE",
}

export enum EmploymentType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  INTERNSHIP = "INTERNSHIP",
  FREELANCE = "FREELANCE",
  TEMPORARY = "TEMPORARY",
}

export enum ExperienceLevel {
  ENTRY_LEVEL = "ENTRY_LEVEL",
  MID_LEVEL = "MID_LEVEL",
  SENIOR_LEVEL = "SENIOR_LEVEL",
  EXECUTIVE = "EXECUTIVE",
  INTERN = "INTERN",
}

export enum ApplicationStatus {
  PENDING = "PENDING",
  REVIEWED = "REVIEWED",
  INTERVIEWED = "INTERVIEWED",
  REJECTED = "REJECTED",
  HIRED = "HIRED",
  WITHDRAWN = "WITHDRAWN",
}

export const CompanySizeLabels: Record<CompanySize, string> = {
  [CompanySize.STARTUP]: "Startup",
  [CompanySize.SMALL]: "Pequeña (1-50 empleados)",
  [CompanySize.MEDIUM]: "Mediana (51-200 empleados)",
  [CompanySize.LARGE]: "Grande (201-1000 empleados)",
  [CompanySize.ENTERPRISE]: "Empresa (1000+ empleados)",
};

export const EmploymentTypeLabels: Record<EmploymentType, string> = {
  [EmploymentType.FULL_TIME]: "Tiempo completo",
  [EmploymentType.PART_TIME]: "Medio tiempo",
  [EmploymentType.CONTRACT]: "Contrato",
  [EmploymentType.INTERNSHIP]: "Pasantía",
  [EmploymentType.FREELANCE]: "Freelance",
  [EmploymentType.TEMPORARY]: "Temporal",
};

export const ExperienceLevelLabels: Record<ExperienceLevel, string> = {
  [ExperienceLevel.ENTRY_LEVEL]: "Nivel inicial",
  [ExperienceLevel.MID_LEVEL]: "Nivel medio",
  [ExperienceLevel.SENIOR_LEVEL]: "Nivel senior",
  [ExperienceLevel.EXECUTIVE]: "Ejecutivo",
  [ExperienceLevel.INTERN]: "Interno",
};

export const ApplicationStatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: "Pendiente",
  [ApplicationStatus.REVIEWED]: "Revisado",
  [ApplicationStatus.INTERVIEWED]: "Entrevistado",
  [ApplicationStatus.REJECTED]: "Rechazado",
  [ApplicationStatus.HIRED]: "Contratado",
  [ApplicationStatus.WITHDRAWN]: "Retirado",
};
