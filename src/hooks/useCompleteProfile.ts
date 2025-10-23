import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface CompleteProfile {
  // Basic profile info
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  cityState: string;
  country: string;
  birthDate: string;
  gender: string;
  documentType: string;
  documentNumber: string;
  avatarUrl: string;
  
  // Professional info
  jobTitle: string;
  professionalSummary: string;
  experienceLevel: string;
  targetPosition: string;
  targetCompany: string;
  
  // Education info
  educationLevel: string;
  currentInstitution: string;
  graduationYear: string;
  isStudying: boolean;
  currentDegree: string;
  universityName: string;
  universityStartDate: string;
  universityEndDate: string;
  universityStatus: string;
  gpa: string;
  
  // Skills and interests
  skills: any;
  skillsWithLevel: any;
  languages: any;
  relevantSkills: any;
  interests: any;
  
  // Experience and activities
  workExperience: any;
  educationHistory: any;
  projects: any;
  achievements: any;
  academicAchievements: any;
  extracurricularActivities: any;
  websites: any;
  socialLinks: any;
  
  // Cover letter / Presentation letter fields
  coverLetterContent: string;
  coverLetterRecipient: any;
  coverLetterSubject: string;
  coverLetterTemplate: string;
  coverLetterRecipientName: string;
  coverLetterRecipientTitle: string;
  coverLetterCompanyName: string;
  coverLetterPosition: string;
  coverLetterClosing: string;
  coverLetterSignature: string;
  coverLetterDate: string;
  
  // Document URLs
  cvUrl: string;
  coverLetterUrl: string;
  
  // Related data
  institution: any;
  entrepreneurships: any[];
  youthApplications: any[];
  companyEmployments: any[];
  entrepreneurshipPosts: any[];
  entrepreneurshipResources: any[];
  certificates: any[];
  moduleCertificates: any[];
  courseEnrollments: any[];
  
  // Profile metadata
  profileCompletion: number;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  role: string;
}

export function useCompleteProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<CompleteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompleteProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setError('No session found');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/profile/me');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      if (data.success && data.profile) {
        setProfile(data.profile);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching complete profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchCompleteProfile();
  }, [fetchCompleteProfile]);

  const refetch = useCallback(() => {
    fetchCompleteProfile();
  }, [fetchCompleteProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch
  };
}
