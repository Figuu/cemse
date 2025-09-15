import { UserRole, UserStatus, InstitutionType, EducationLevel, CompanySize, JobStatus, ApplicationStatus, ContractType, WorkModality, ExperienceLevel, CourseCategory, CourseLevel, LessonType, BusinessStage, NewsType, NewsStatus, NewsPriority, YouthApplicationStatus, CompanyInterestStatus } from '@prisma/client';

export type {
  UserRole,
  UserStatus,
  InstitutionType,
  EducationLevel,
  CompanySize,
  JobStatus,
  ApplicationStatus,
  ContractType,
  WorkModality,
  ExperienceLevel,
  CourseCategory,
  CourseLevel,
  LessonType,
  BusinessStage,
  NewsType,
  NewsStatus,
  NewsPriority,
  YouthApplicationStatus,
  CompanyInterestStatus,
};

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  municipalityId?: string;
  country?: string;
  birthDate?: Date;
  gender?: string;
  documentType?: string;
  documentNumber?: string;
  educationLevel?: EducationLevel;
  currentInstitution?: string;
  graduationYear?: number;
  isStudying?: boolean;
  skills?: string[];
  interests?: string[];
  socialLinks?: Record<string, string>;
  workExperience?: WorkExperience[];
  profileCompletion: number;
  lastLoginAt?: Date;
  parentalConsent: boolean;
  parentEmail?: string;
  consentDate?: Date;
  achievements?: Achievement[];
  addressLine?: string;
  city?: string;
  state?: string;
  cityState?: string;
  professionalSummary?: string;
  extracurricularActivities?: string[];
  jobTitle?: string;
  experienceLevel?: ExperienceLevel;
  languages?: Language[];
  projects?: Project[];
  skillsWithLevel?: SkillLevel[];
  websites?: string[];
  coverLetterContent?: string;
  coverLetterRecipient?: string;
  coverLetterSubject?: string;
  coverLetterTemplate?: string;
  academicAchievements?: AcademicAchievement[];
  currentDegree?: string;
  educationHistory?: EducationHistory[];
  gpa?: number;
  universityEndDate?: Date;
  universityName?: string;
  universityStartDate?: Date;
  universityStatus?: string;
  targetPosition?: string;
  targetCompany?: string;
  relevantSkills: string[];
  cvUrl?: string;
  coverLetterUrl?: string;
  cvTemplate?: string;
  avatarUrl?: string;
  active: boolean;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  videoPreview?: string;
  objectives: string[];
  prerequisites: string[];
  duration: number;
  level: CourseLevel;
  category: CourseCategory;
  isMandatory?: boolean;
  isActive?: boolean;
  rating?: number;
  studentsCount: number;
  completionRate?: number;
  totalLessons: number;
  totalQuizzes: number;
  totalResources: number;
  tags: string[];
  certification?: boolean;
  includedMaterials: string[];
  instructorId?: string;
  institutionName?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  contractType: ContractType;
  workSchedule: string;
  workModality: WorkModality;
  location: string;
  municipality: string;
  department: string;
  experienceLevel: ExperienceLevel;
  educationRequired?: EducationLevel;
  skillsRequired: string[];
  desiredSkills: string[];
  applicationDeadline?: Date;
  isActive: boolean;
  status: JobStatus;
  viewsCount: number;
  applicationsCount: number;
  featured: boolean;
  expiresAt?: Date;
  publishedAt: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  latitude?: number;
  longitude?: number;
  images: string[];
  logo?: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  taxId?: string;
  legalRepresentative?: string;
  businessSector?: string;
  companySize?: CompanySize;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  foundedYear?: number;
  logoUrl?: string;
  isActive: boolean;
  municipalityId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Institution {
  id: string;
  name: string;
  department: string;
  region?: string;
  population?: number;
  mayorName?: string;
  mayorEmail?: string;
  mayorPhone?: string;
  address?: string;
  website?: string;
  isActive: boolean;
  email: string;
  phone?: string;
  institutionType: InstitutionType;
  customType?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Municipality {
  id: string;
  name: string;
  department: string;
  region?: string;
  population?: number;
  mayorName?: string;
  mayorEmail?: string;
  mayorPhone?: string;
  address?: string;
  website?: string;
  isActive: boolean;
  email: string;
  phone?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  customType?: string;
  institutionType: InstitutionType;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl?: string;
  videoUrl?: string;
  authorId: string;
  authorName: string;
  authorType: NewsType;
  authorLogo?: string;
  status: NewsStatus;
  priority: NewsPriority;
  featured: boolean;
  tags: string[];
  category: string;
  publishedAt?: Date;
  expiresAt?: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  targetAudience: string[];
  region?: string;
  relatedLinks?: string[];
  createdAt: Date;
  updatedAt: Date;
  isEntrepreneurshipRelated: boolean;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  format: string;
  downloadUrl?: string;
  externalUrl?: string;
  thumbnail: string;
  author: string;
  publishedDate: Date;
  downloads: number;
  rating: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  isEntrepreneurshipRelated: boolean;
  createdByUserId: string;
}

export interface Entrepreneurship {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  businessStage: BusinessStage;
  logo?: string;
  images: string[];
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  municipality: string;
  department: string;
  socialMedia?: Record<string, string>;
  founded?: Date;
  employees?: number;
  annualRevenue?: number;
  businessModel?: string;
  targetMarket?: string;
  isPublic: boolean;
  isActive: boolean;
  viewsCount: number;
  rating?: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface YouthApplication {
  id: string;
  title: string;
  description: string;
  cvFile?: string;
  coverLetterFile?: string;
  cvUrl?: string;
  coverLetterUrl?: string;
  status: YouthApplicationStatus;
  isPublic: boolean;
  viewsCount: number;
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
  youthProfileId: string;
}

export interface JobApplication {
  id: string;
  applicantId: string;
  jobOfferId: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  notes?: string;
  rating?: number;
  cvData?: Record<string, unknown>;
  profileImage?: string;
  coverLetterFile?: string;
  cvFile?: string;
  decisionReason?: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface SignInForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ProfileForm {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  municipalityId?: string;
  country?: string;
  birthDate?: string;
  gender?: string;
  documentType?: string;
  documentNumber?: string;
  educationLevel?: EducationLevel;
  currentInstitution?: string;
  graduationYear?: number;
  isStudying?: boolean;
  skills?: string[];
  interests?: string[];
  socialLinks?: Record<string, string>;
  workExperience?: WorkExperience[];
  professionalSummary?: string;
  jobTitle?: string;
  languages?: Record<string, string>[];
  projects?: Project[];
  skillsWithLevel?: Record<string, string>[];
  websites?: string[];
  targetPosition?: string;
  targetCompany?: string;
  relevantSkills?: string[];
}

export interface CourseForm {
  title: string;
  description: string;
  shortDescription?: string;
  objectives: string[];
  prerequisites: string[];
  duration: number;
  level: CourseLevel;
  category: CourseCategory;
  isMandatory?: boolean;
  certification?: boolean;
  includedMaterials: string[];
  instructorId?: string;
  institutionName?: string;
  tags: string[];
}

export interface JobOfferForm {
  title: string;
  description: string;
  requirements: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  contractType: ContractType;
  workSchedule: string;
  workModality: WorkModality;
  location: string;
  municipality: string;
  department: string;
  experienceLevel: ExperienceLevel;
  educationRequired?: EducationLevel;
  skillsRequired: string[];
  desiredSkills: string[];
  applicationDeadline?: string;
  featured?: boolean;
  expiresAt?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  logo?: string;
}

export interface CompanyForm {
  name: string;
  description?: string;
  taxId?: string;
  legalRepresentative?: string;
  businessSector?: string;
  companySize?: CompanySize;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  foundedYear?: number;
  logoUrl?: string;
  municipalityId: string;
}

export interface InstitutionForm {
  name: string;
  department: string;
  region?: string;
  population?: number;
  mayorName?: string;
  mayorEmail?: string;
  mayorPhone?: string;
  address?: string;
  website?: string;
  email: string;
  phone?: string;
  institutionType: InstitutionType;
  customType?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface NewsArticleForm {
  title: string;
  content: string;
  summary: string;
  imageUrl?: string;
  videoUrl?: string;
  authorName: string;
  authorType: NewsType;
  authorLogo?: string;
  priority: NewsPriority;
  featured: boolean;
  tags: string[];
  category: string;
  publishedAt?: string;
  expiresAt?: string;
  targetAudience: string[];
  region?: string;
  relatedLinks?: string[];
  isEntrepreneurshipRelated: boolean;
}

export interface ResourceForm {
  title: string;
  description: string;
  type: string;
  category: string;
  format: string;
  downloadUrl?: string;
  externalUrl?: string;
  thumbnail: string;
  author: string;
  publishedDate: string;
  tags: string[];
  isPublic: boolean;
  isEntrepreneurshipRelated: boolean;
}

export interface EntrepreneurshipForm {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  businessStage: BusinessStage;
  logo?: string;
  images: string[];
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  municipality: string;
  department: string;
  socialMedia?: Record<string, string>;
  founded?: string;
  employees?: number;
  annualRevenue?: number;
  businessModel?: string;
  targetMarket?: string;
  isPublic: boolean;
}

export interface YouthApplicationForm {
  title: string;
  description: string;
  cvFile?: string;
  coverLetterFile?: string;
  isPublic: boolean;
}

// Additional interfaces for better type safety
export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  issuer?: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate: string;
  endDate?: string;
}

export interface SkillLevel {
  skill: string;
  level: number;
}

export interface AcademicAchievement {
  id: string;
  title: string;
  description: string;
  date: string;
  institution: string;
}

export interface EducationHistory {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
}
