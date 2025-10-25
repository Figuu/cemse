import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useCompleteProfile } from './useCompleteProfile';

export interface CVData {
  profile: any;
  certificates: Array<{
    id: string;
    title: string;
    issuer: string;
    issueDate: string;
    courseName?: string;
    fileUrl?: string;
  }>;
  completedCourses: Array<{
    id: string;
    title: string;
    institution: string;
    completedAt: string;
    progress: number;
    certificateUrl?: string;
  }>;
  entrepreneurships: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    businessStage: string;
    website: string;
    email: string;
    phone: string;
    address: string;
    municipality: string;
    department: string;
    founded: string;
    employees: number;
    annualRevenue: number;
    businessModel: string;
    targetMarket: string;
  }>;
  youthApplications: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    isPublic: boolean;
    viewsCount: number;
    applicationsCount: number;
    createdAt: string;
    cvUrl: string;
    coverLetterUrl: string;
  }>;
  companyEmployments: Array<{
    id: string;
    companyName: string;
    position: string;
    hiredAt: string;
    terminatedAt: string;
    status: string;
    notes: string;
    salary: number;
    contractType: string;
  }>;
  entrepreneurshipPosts: Array<{
    id: string;
    content: string;
    type: string;
    tags: string[];
    likes: number;
    comments: number;
    shares: number;
    views: number;
    createdAt: string;
  }>;
  entrepreneurshipResources: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    tags: string[];
    url: string;
    fileUrl: string;
    views: number;
    likes: number;
    createdAt: string;
  }>;
  isLoading: boolean;
  error: string | null;
}

export function useCVData(): CVData {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { profile: completeProfile, isLoading: profileLoading } = useCompleteProfile();

  const [cvData, setCvData] = useState<CVData>({
    profile: null,
    certificates: [],
    completedCourses: [],
    entrepreneurships: [],
    youthApplications: [],
    companyEmployments: [],
    entrepreneurshipPosts: [],
    entrepreneurshipResources: [],
    isLoading: true,
    error: null,
  });

  const fetchCVData = useCallback(async () => {
    if (!completeProfile) {
      setCvData(prev => ({
        ...prev,
        isLoading: false,
        error: 'No profile data available',
      }));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Format certificates from complete profile
      const formattedCertificates = completeProfile.certificates?.map(cert => ({
        id: cert.id,
        title: cert.course?.title || "Certificado",
        issuer: cert.course?.instructor?.name || "Emplea Emprende",
        issueDate: new Date(cert.issuedAt).toISOString().split('T')[0],
        courseName: cert.course?.title,
        fileUrl: (cert as any).fileUrl,
      })) || [];

      // Format completed courses from complete profile
      const completedCourses = completeProfile.courseEnrollments
        ?.filter(course => course.progress === 100)
        .map(course => ({
          id: course.id,
          title: course.course?.title || "Curso",
          institution: course.course?.instructor?.name || "Emplea Emprende",
          completedAt: new Date().toISOString().split('T')[0], // You might want to get actual completion date
          progress: course.progress || 100,
          certificateUrl: undefined, // Link to certificate if available
        })) || [];

      // Format additional data from profile relations
      const entrepreneurships = completeProfile.entrepreneurships?.map((business: any) => ({
        id: business.id,
        name: business.name,
        description: business.description,
        category: business.category,
        subcategory: business.subcategory || '',
        businessStage: business.businessStage,
        website: business.website || '',
        email: business.email || '',
        phone: business.phone || '',
        address: business.address || '',
        municipality: business.municipality,
        department: business.department,
        founded: business.founded ? new Date(business.founded).toISOString().split('T')[0] : '',
        employees: business.employees || 0,
        annualRevenue: business.annualRevenue || 0,
        businessModel: business.businessModel || '',
        targetMarket: business.targetMarket || '',
      })) || [];

      const youthApplications = completeProfile.youthApplications?.map((app: any) => ({
        id: app.id,
        title: app.title,
        description: app.description,
        status: app.status,
        isPublic: app.isPublic,
        viewsCount: app.viewsCount,
        applicationsCount: app.applicationsCount,
        createdAt: new Date(app.createdAt).toISOString().split('T')[0],
        cvUrl: app.cvUrl || '',
        coverLetterUrl: app.coverLetterUrl || '',
      })) || [];

      const companyEmployments = completeProfile.companyEmployments?.map((emp: any) => ({
        id: emp.id,
        companyName: emp.company?.name || 'Empresa',
        position: emp.position,
        hiredAt: new Date(emp.hiredAt).toISOString().split('T')[0],
        terminatedAt: emp.terminatedAt ? new Date(emp.terminatedAt).toISOString().split('T')[0] : '',
        status: emp.status,
        notes: emp.notes || '',
        salary: emp.salary || 0,
        contractType: emp.contractType || '',
      })) || [];

      const entrepreneurshipPosts = completeProfile.entrepreneurshipPosts?.map((post: any) => ({
        id: post.id,
        content: post.content,
        type: post.type,
        tags: post.tags || [],
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        views: post.views,
        createdAt: new Date(post.createdAt).toISOString().split('T')[0],
      })) || [];

      const entrepreneurshipResources = completeProfile.entrepreneurshipResources?.map((resource: any) => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        category: resource.category,
        tags: resource.tags || [],
        url: resource.url || '',
        fileUrl: resource.fileUrl || '',
        views: resource.views,
        likes: resource.likes,
        createdAt: new Date(resource.createdAt).toISOString().split('T')[0],
      })) || [];

      setCvData({
        profile: completeProfile,
        certificates: formattedCertificates,
        completedCourses: completedCourses,
        entrepreneurships: entrepreneurships,
        youthApplications: youthApplications,
        companyEmployments: companyEmployments,
        entrepreneurshipPosts: entrepreneurshipPosts,
        entrepreneurshipResources: entrepreneurshipResources,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching CV data');
      setCvData(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error fetching CV data',
      }));
    }
  }, [completeProfile]);

  useEffect(() => {
    fetchCVData();
  }, [fetchCVData]);

  useEffect(() => {
    setIsLoading(profileLoading);
  }, [profileLoading]);

  return {
    ...cvData,
    isLoading: cvData.isLoading || profileLoading,
  };
}
