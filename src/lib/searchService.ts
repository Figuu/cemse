import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface SearchResult {
  type: 'job' | 'company' | 'youth' | 'course' | 'institution';
  id: string;
  title: string;
  description: string;
  url: string;
  metadata: Record<string, string | number | string[] | Date | null>;
  score: number;
}

export interface SearchFilters {
  type?: string[];
  location?: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  skills?: string[];
  experience?: string;
  salary?: {
    min: number;
    max: number;
  };
}

export class SearchService {
  /**
   * Perform global search across all entities
   */
  static async globalSearch(
    query: string,
    filters: SearchFilters = {},
    limit = 20,
    offset = 0
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // Search jobs
    if (!filters.type || filters.type.includes('job')) {
      const jobs = await this.searchJobs(query, filters, limit, offset);
      results.push(...jobs);
    }

    // Search companies
    if (!filters.type || filters.type.includes('company')) {
      const companies = await this.searchCompanies(query, filters, limit, offset);
      results.push(...companies);
    }

    // Search youth profiles
    if (!filters.type || filters.type.includes('youth')) {
      const youth = await this.searchYouth(query, filters, limit, offset);
      results.push(...youth);
    }

    // Search courses
    if (!filters.type || filters.type.includes('course')) {
      const courses = await this.searchCourses(query, filters, limit, offset);
      results.push(...courses);
    }

    // Search institutions
    if (!filters.type || filters.type.includes('institution')) {
      const institutions = await this.searchInstitutions(query, filters, limit, offset);
      results.push(...institutions);
    }

    // Sort by relevance score
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Search job offers
   */
  private static async searchJobs(
    query: string,
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    const whereClause: Prisma.JobOfferWhereInput = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { requirements: { contains: query, mode: 'insensitive' } },
        { company: { name: { contains: query, mode: 'insensitive' } } }
      ],
      status: 'ACTIVE'
    };

    // Apply filters
    if (filters.location) {
      whereClause.location = { contains: filters.location, mode: 'insensitive' };
    }

    // Note: JobOffer doesn't have a category field, skipping this filter

    if (filters.salary) {
      whereClause.salaryMin = { gte: filters.salary.min };
      whereClause.salaryMax = { lte: filters.salary.max };
    }

    if (filters.dateRange) {
      whereClause.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }

    const jobs = await prisma.jobOffer.findMany({
      where: whereClause,
      include: {
        company: true
      },
      take: limit,
      skip: offset
    });

    return jobs.map(job => ({
      type: 'job' as const,
      id: job.id,
      title: job.title,
      description: job.description,
      url: `/jobs/${job.id}`,
      metadata: {
        company: job.company.name,
        location: job.location,
        salary: job.salaryMin ? `${job.salaryMin} - ${job.salaryMax}` : 'No especificado',
        contractType: job.contractType,
        workModality: job.workModality,
        createdAt: job.createdAt
      },
      score: this.calculateRelevanceScore(query, job.title, job.description)
    }));
  }

  /**
   * Search companies
   */
  private static async searchCompanies(
    query: string,
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    const whereClause: Prisma.CompanyWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { businessSector: { contains: query, mode: 'insensitive' } },
        { website: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (filters.location) {
      whereClause.address = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.category) {
      whereClause.businessSector = { contains: filters.category, mode: 'insensitive' };
    }

    const companies = await prisma.company.findMany({
      where: whereClause,
      take: limit,
      skip: offset
    });

    return companies.map(company => ({
      type: 'company' as const,
      id: company.id,
      title: company.name,
      description: company.description || 'Empresa sin descripción',
      url: `/companies/${company.id}`,
      metadata: {
        businessSector: company.businessSector,
        address: company.address,
        website: company.website,
        companySize: company.companySize,
        createdAt: company.createdAt
      },
      score: this.calculateRelevanceScore(query, company.name, company.description || '')
    }));
  }

  /**
   * Search youth profiles
   */
  private static async searchYouth(
    query: string,
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    const whereClause: Prisma.ProfileWhereInput = {
      user: {
        role: 'YOUTH'
      },
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { jobTitle: { contains: query, mode: 'insensitive' } },
        { professionalSummary: { contains: query, mode: 'insensitive' } },
        { relevantSkills: { has: query } }
      ]
    };

    if (filters.location) {
      whereClause.city = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.skills && filters.skills.length > 0) {
      whereClause.relevantSkills = { hasSome: filters.skills };
    }

    // Note: Experience filtering would need to be implemented based on workExperience JSON field
    // For now, we'll skip this filter

    const profiles = await prisma.profile.findMany({
      where: whereClause,
      include: {
        user: true
      },
      take: limit,
      skip: offset
    });

    return profiles.map(profile => ({
      type: 'youth' as const,
      id: profile.userId,
      title: `${profile.firstName} ${profile.lastName}`,
      description: profile.professionalSummary || 'Perfil profesional',
      url: `/profiles/${profile.userId}`,
      metadata: {
        jobTitle: profile.jobTitle,
        relevantSkills: profile.relevantSkills,
        city: profile.city,
        createdAt: profile.createdAt
      },
      score: this.calculateRelevanceScore(
        query, 
        `${profile.firstName} ${profile.lastName}`, 
        profile.professionalSummary || ''
      )
    }));
  }

  /**
   * Search courses
   */
  private static async searchCourses(
    query: string,
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    const whereClause: Prisma.CourseWhereInput = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ],
      isActive: true
    };

    // Note: Course category is an enum, so we can't use contains filter
    // This would need to be implemented with a mapping from string to enum values

    if (filters.skills && filters.skills.length > 0) {
      whereClause.tags = { hasSome: filters.skills };
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      take: limit,
      skip: offset
    });

    return courses.map(course => ({
      type: 'course' as const,
      id: course.id,
      title: course.title,
      description: course.description,
      url: `/courses/${course.id}`,
      metadata: {
        institutionName: course.institutionName,
        category: course.category,
        duration: course.duration,
        level: course.level,
        tags: course.tags,
        createdAt: course.createdAt
      },
      score: this.calculateRelevanceScore(query, course.title, course.description)
    }));
  }

  /**
   * Search institutions
   */
  private static async searchInstitutions(
    query: string,
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    const whereClause: Prisma.InstitutionWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { customType: { contains: query, mode: 'insensitive' } },
        { department: { contains: query, mode: 'insensitive' } }
      ],
      isActive: true
    };

    if (filters.location) {
      whereClause.department = { contains: filters.location, mode: 'insensitive' };
    }

    // Note: InstitutionType is an enum, so we can't use contains filter
    // This would need to be implemented with a mapping from string to enum values

    const institutions = await prisma.institution.findMany({
      where: whereClause,
      take: limit,
      skip: offset
    });

    return institutions.map(institution => ({
      type: 'institution' as const,
      id: institution.id,
      title: institution.name,
      description: 'Institución educativa',
      url: `/institutions/${institution.id}`,
      metadata: {
        institutionType: institution.institutionType,
        department: institution.department,
        website: institution.website,
        createdAt: institution.createdAt
      },
      score: this.calculateRelevanceScore(query, institution.name, 'Institución educativa')
    }));
  }

  /**
   * Calculate relevance score for search results
   */
  private static calculateRelevanceScore(query: string, title: string, description: string): number {
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const descriptionLower = description.toLowerCase();

    let score = 0;

    // Exact title match gets highest score
    if (titleLower === queryLower) {
      score += 100;
    } else if (titleLower.includes(queryLower)) {
      score += 80;
    }

    // Title word matches
    const titleWords = titleLower.split(/\s+/);
    const queryWords = queryLower.split(/\s+/);
    const titleMatches = queryWords.filter(word => 
      titleWords.some(titleWord => titleWord.includes(word))
    ).length;
    score += titleMatches * 20;

    // Description matches
    if (descriptionLower.includes(queryLower)) {
      score += 30;
    }

    // Description word matches
    const descriptionWords = descriptionLower.split(/\s+/);
    const descriptionMatches = queryWords.filter(word => 
      descriptionWords.some(descWord => descWord.includes(word))
    ).length;
    score += descriptionMatches * 10;

    return Math.min(score, 100);
  }

  /**
   * Get search suggestions
   */
  static async getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
    const suggestions = new Set<string>();

    // Get job title suggestions
    const jobTitles = await prisma.jobOffer.findMany({
      where: {
        title: { contains: query, mode: 'insensitive' }
      },
      select: { title: true },
      take: limit
    });

    jobTitles.forEach(job => suggestions.add(job.title));

    // Get company name suggestions
    const companyNames = await prisma.company.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      select: { name: true },
      take: limit
    });

    companyNames.forEach(company => suggestions.add(company.name));

    // Get skill suggestions
    const profiles = await prisma.profile.findMany({
      where: {
        relevantSkills: { has: query }
      },
      select: { relevantSkills: true },
      take: limit * 2
    });

    profiles.forEach(profile => {
      if (profile.relevantSkills) {
        profile.relevantSkills.forEach((skill: string) => {
          if (skill.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(skill);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get popular searches
   */
  static async getPopularSearches(limit = 10): Promise<string[]> {
    // This would typically come from a search analytics table
    // For now, return some common search terms
    return [
      'Desarrollador Frontend',
      'Marketing Digital',
      'Diseño Gráfico',
      'Administración',
      'Ventas',
      'Recursos Humanos',
      'Contabilidad',
      'Ingeniería',
      'Medicina',
      'Educación'
    ].slice(0, limit);
  }
}
