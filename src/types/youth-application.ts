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
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
  youthProfileId: string;
  youthProfile: {
    userId: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    phone?: string;
    address?: string;
    user: {
      id: string;
      email: string;
    };
  };
  companyInterests?: YouthApplicationCompanyInterest[];
  _count?: {
    companyInterests: number;
  };
}

export interface YouthApplicationCompanyInterest {
  id: string;
  applicationId: string;
  companyId: string;
  status: CompanyInterestStatus;
  interestedAt: string;
  contactedAt?: string;
  notes?: string;
  application: YouthApplication;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    ownerId?: string;
  };
}

export enum YouthApplicationStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  CLOSED = "CLOSED",
  HIRED = "HIRED",
}

export enum CompanyInterestStatus {
  INTERESTED = "INTERESTED",
  CONTACTED = "CONTACTED",
  INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED",
  HIRED = "HIRED",
  NOT_INTERESTED = "NOT_INTERESTED",
}

export const YouthApplicationStatusLabels: Record<YouthApplicationStatus, string> = {
  [YouthApplicationStatus.ACTIVE]: "Activo",
  [YouthApplicationStatus.PAUSED]: "Pausado",
  [YouthApplicationStatus.CLOSED]: "Cerrado",
  [YouthApplicationStatus.HIRED]: "Contratado",
};

export const CompanyInterestStatusLabels: Record<CompanyInterestStatus, string> = {
  [CompanyInterestStatus.INTERESTED]: "Interesado",
  [CompanyInterestStatus.CONTACTED]: "Contactado",
  [CompanyInterestStatus.INTERVIEW_SCHEDULED]: "Entrevista Programada",
  [CompanyInterestStatus.HIRED]: "Contratado",
  [CompanyInterestStatus.NOT_INTERESTED]: "No Interesado",
};

export interface CreateYouthApplicationData {
  title: string;
  description: string;
  cvFile?: string;
  coverLetterFile?: string;
  cvUrl?: string;
  coverLetterUrl?: string;
  isPublic?: boolean;
}

export interface UpdateYouthApplicationData {
  title?: string;
  description?: string;
  cvFile?: string;
  coverLetterFile?: string;
  cvUrl?: string;
  coverLetterUrl?: string;
  status?: YouthApplicationStatus;
  isPublic?: boolean;
}

export interface CreateInterestData {
  status?: CompanyInterestStatus;
  notes?: string;
}

export interface UpdateInterestData {
  status?: CompanyInterestStatus;
  notes?: string;
}
