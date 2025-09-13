import { prisma } from "@/lib/prisma";

export interface DiscoveryFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  businessStage?: string;
  municipality?: string;
  department?: string;
  minEmployees?: number;
  maxEmployees?: number;
  minRevenue?: number;
  maxRevenue?: number;
  foundedAfter?: string;
  foundedBefore?: string;
  hasWebsite?: boolean;
  hasSocialMedia?: boolean;
  isPublic?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface DiscoveryResult {
  startups: any[];
  total: number;
  facets: {
    categories: Array<{ name: string; count: number }>;
    businessStages: Array<{ name: string; count: number; value: string }>;
    municipalities: Array<{ name: string; count: number }>;
    departments: Array<{ name: string; count: number }>;
  };
  trending: any[];
  recommendations: any[];
}

export class StartupDiscoveryService {
  /**
   * Get comprehensive discovery results with facets and recommendations
   */
  static async discoverStartups(
    filters: DiscoveryFilters,
    userId?: string
  ): Promise<DiscoveryResult> {
    try {
      const where = this.buildWhereClause(filters);
      const orderBy = this.buildOrderByClause(filters.sortBy, filters.sortOrder);
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;

      // Get main results
      const [startups, total, facets] = await Promise.all([
        this.getStartups(where, orderBy, limit, offset),
        this.getTotalCount(where),
        this.getFacets(where),
      ]);

      // Get trending and recommendations
      const [trending, recommendations] = await Promise.all([
        this.getTrendingStartups(5),
        userId ? this.getRecommendedStartups(userId, 5) : [],
      ]);

      return {
        startups,
        total,
        facets,
        trending,
        recommendations,
      };
    } catch (error) {
      console.error("Error discovering startups:", error);
      throw error;
    }
  }

  /**
   * Get trending startups based on recent activity
   */
  static async getTrendingStartups(limit: number = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const startups = await prisma.entrepreneurship.findMany({
      where: {
        isActive: true,
        isPublic: true,
        viewsCount: { gt: 0 },
        OR: [
          { createdAt: { gte: thirtyDaysAgo } },
          { updatedAt: { gte: thirtyDaysAgo } },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            // Add any relations that need counting
          },
        },
      },
      orderBy: [
        { viewsCount: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return startups.map(startup => ({
      ...startup,
      trendScore: this.calculateTrendScore(startup),
    }));
  }

  /**
   * Get recommended startups for a user
   */
  static async getRecommendedStartups(userId: string, limit: number = 10) {
    // Get user's profile and preferences
    const userProfile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        skills: true,
        interests: true,
        experienceLevel: true,
      },
    });

    if (!userProfile) {
      return [];
    }

    const userSkills = (userProfile.skills as string[]) || [];
    const userInterests = (userProfile.interests as string[]) || [];

    // Get user's bookmarked/followed startups to avoid duplicates
    // TODO: Implement when bookmark/follow functionality is added

    // Build recommendation query
    const where: any = {
      isActive: true,
      isPublic: true,
    };

    // Find startups with matching skills or interests
    if (userSkills.length > 0 || userInterests.length > 0) {
      where.OR = [
        { category: { in: userInterests } },
        { subcategory: { in: userInterests } },
        { name: { contains: userSkills.join(" "), mode: "insensitive" } },
        { description: { contains: userSkills.join(" "), mode: "insensitive" } },
      ];
    }

    const startups = await prisma.entrepreneurship.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            // Add any relations that need counting
          },
        },
      },
      orderBy: [
        { rating: "desc" },
        { viewsCount: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return startups.map(startup => ({
      ...startup,
      recommendationScore: this.calculateRecommendationScore(startup, userProfile),
      recommendationReason: this.getRecommendationReason(startup, userProfile),
    }));
  }

  /**
   * Get startups by category with detailed information
   */
  static async getStartupsByCategory(category: string, limit: number = 20) {
    const startups = await prisma.entrepreneurship.findMany({
      where: {
        category,
        isActive: true,
        isPublic: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            // Add any relations that need counting
          },
        },
      },
      orderBy: [
        { rating: "desc" },
        { viewsCount: "desc" },
      ],
      take: limit,
    });

    return startups;
  }

  /**
   * Get startups by business stage
   */
  static async getStartupsByStage(stage: string, limit: number = 20) {
    const startups = await prisma.entrepreneurship.findMany({
      where: {
        businessStage: stage as any,
        isActive: true,
        isPublic: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            // Add any relations that need counting
          },
        },
      },
      orderBy: [
        { rating: "desc" },
        { viewsCount: "desc" },
      ],
      take: limit,
    });

    return startups;
  }

  /**
   * Get startups by location
   */
  static async getStartupsByLocation(municipality?: string, department?: string, limit: number = 20) {
    const where: any = {
      isActive: true,
      isPublic: true,
    };

    if (municipality) {
      where.municipality = municipality;
    }

    if (department) {
      where.department = department;
    }

    const startups = await prisma.entrepreneurship.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            // Add any relations that need counting
          },
        },
      },
      orderBy: [
        { rating: "desc" },
        { viewsCount: "desc" },
      ],
      take: limit,
    });

    return startups;
  }

  /**
   * Search startups with advanced text search
   */
  static async searchStartups(query: string, limit: number = 20) {
    const startups = await prisma.entrepreneurship.findMany({
      where: {
        isActive: true,
        isPublic: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
          { subcategory: { contains: query, mode: "insensitive" } },
          { businessModel: { contains: query, mode: "insensitive" } },
          { targetMarket: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            // Add any relations that need counting
          },
        },
      },
      orderBy: [
        { rating: "desc" },
        { viewsCount: "desc" },
      ],
      take: limit,
    });

    return startups.map(startup => ({
      ...startup,
      searchScore: this.calculateSearchScore(startup, query),
    }));
  }

  /**
   * Get discovery analytics
   */
  static async getDiscoveryAnalytics() {
    const [
      totalStartups,
      categoryStats,
      stageStats,
      locationStats,
      recentActivity,
    ] = await Promise.all([
      prisma.entrepreneurship.count({
        where: { isActive: true, isPublic: true },
      }),
      this.getCategoryStats(),
      this.getStageStats(),
      this.getLocationStats(),
      this.getRecentActivity(),
    ]);

    return {
      totalStartups,
      categoryStats,
      stageStats,
      locationStats,
      recentActivity,
    };
  }

  // Private helper methods

  private static buildWhereClause(filters: DiscoveryFilters): any {
    const where: any = {
      isActive: true,
    };

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { category: { contains: filters.search, mode: "insensitive" } },
        { subcategory: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.subcategory) {
      where.subcategory = filters.subcategory;
    }

    if (filters.businessStage) {
      where.businessStage = filters.businessStage;
    }

    if (filters.municipality) {
      where.municipality = filters.municipality;
    }

    if (filters.department) {
      where.department = filters.department;
    }

    if (filters.minEmployees !== undefined || filters.maxEmployees !== undefined) {
      where.employees = {};
      if (filters.minEmployees !== undefined) {
        where.employees.gte = filters.minEmployees;
      }
      if (filters.maxEmployees !== undefined) {
        where.employees.lte = filters.maxEmployees;
      }
    }

    if (filters.minRevenue !== undefined || filters.maxRevenue !== undefined) {
      where.annualRevenue = {};
      if (filters.minRevenue !== undefined) {
        where.annualRevenue.gte = filters.minRevenue;
      }
      if (filters.maxRevenue !== undefined) {
        where.annualRevenue.lte = filters.maxRevenue;
      }
    }

    if (filters.foundedAfter || filters.foundedBefore) {
      where.founded = {};
      if (filters.foundedAfter) {
        where.founded.gte = new Date(filters.foundedAfter);
      }
      if (filters.foundedBefore) {
        where.founded.lte = new Date(filters.foundedBefore);
      }
    }

    if (filters.hasWebsite) {
      where.website = { not: null };
    }

    if (filters.hasSocialMedia) {
      where.socialMedia = { not: null };
    }

    return where;
  }

  private static buildOrderByClause(sortBy?: string, sortOrder?: string): any {
    const orderBy: any = {};
    const field = sortBy || "createdAt";
    const order = sortOrder || "desc";
    orderBy[field] = order;
    return orderBy;
  }

  private static async getStartups(where: any, orderBy: any, limit: number, offset: number) {
    return prisma.entrepreneurship.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            // Add any relations that need counting
          },
        },
      },
    });
  }

  private static async getTotalCount(where: any): Promise<number> {
    return prisma.entrepreneurship.count({ where });
  }

  private static async getFacets(where: any) {
    const [categories, businessStages, municipalities, departments] = await Promise.all([
      this.getCategoryStats(),
      this.getStageStats(),
      this.getLocationStats(),
      this.getDepartmentStats(),
    ]);

    return {
      categories,
      businessStages,
      municipalities,
      departments,
    };
  }

  private static async getCategoryStats() {
    const stats = await prisma.entrepreneurship.groupBy({
      by: ["category"],
      where: { isActive: true, isPublic: true },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
    });

    return stats.map(stat => ({
      name: stat.category,
      count: stat._count.category,
    }));
  }

  private static async getStageStats() {
    const stats = await prisma.entrepreneurship.groupBy({
      by: ["businessStage"],
      where: { isActive: true, isPublic: true },
      _count: { businessStage: true },
      orderBy: { _count: { businessStage: "desc" } },
    });

    return stats.map(stat => ({
      name: stat.businessStage,
      count: stat._count.businessStage,
      value: stat.businessStage,
    }));
  }

  private static async getLocationStats() {
    const stats = await prisma.entrepreneurship.groupBy({
      by: ["municipality"],
      where: { isActive: true, isPublic: true },
      _count: { municipality: true },
      orderBy: { _count: { municipality: "desc" } },
    });

    return stats.map(stat => ({
      name: stat.municipality,
      count: stat._count.municipality,
    }));
  }

  private static async getDepartmentStats() {
    const stats = await prisma.entrepreneurship.groupBy({
      by: ["department"],
      where: { isActive: true, isPublic: true },
      _count: { department: true },
      orderBy: { _count: { department: "desc" } },
    });

    return stats.map(stat => ({
      name: stat.department,
      count: stat._count.department,
    }));
  }

  private static async getRecentActivity() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return prisma.entrepreneurship.count({
      where: {
        isActive: true,
        isPublic: true,
        createdAt: { gte: sevenDaysAgo },
      },
    });
  }

  private static calculateTrendScore(startup: any): number {
    const viewsWeight = 0.4;
    const recencyWeight = 0.3;
    const ratingWeight = 0.3;

    const viewsScore = Math.min(startup.viewsCount / 100, 1);
    const recencyScore = Math.max(0, 1 - (Date.now() - new Date(startup.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000));
    const ratingScore = (startup.rating || 0) / 5;

    return (viewsScore * viewsWeight) + (recencyScore * recencyWeight) + (ratingScore * ratingWeight);
  }

  private static calculateRecommendationScore(startup: any, userProfile: any): number {
    let score = 0;
    const userSkills = (userProfile.skills as string[]) || [];
    const userInterests = (userProfile.interests as string[]) || [];

    // Category matching
    if (userInterests.includes(startup.category)) {
      score += 10;
    }

    // Subcategory matching
    if (userInterests.includes(startup.subcategory)) {
      score += 5;
    }

    // Skill matching in name/description
    const text = `${startup.name} ${startup.description}`.toLowerCase();
    const skillMatches = userSkills.filter(skill => 
      text.includes(skill.toLowerCase())
    ).length;
    score += skillMatches * 3;

    // Rating and popularity
    score += (startup.rating || 0) * 2;
    score += Math.min(startup.viewsCount / 100, 5);

    return Math.min(score, 100);
  }

  private static getRecommendationReason(startup: any, userProfile: any): string {
    const userInterests = (userProfile.interests as string[]) || [];
    
    if (userInterests.includes(startup.category)) {
      return `Basado en tu interés en ${startup.category}`;
    }
    
    if (startup.rating && startup.rating > 4) {
      return "Alta calificación y popular";
    }
    
    if (startup.viewsCount > 100) {
      return "Muy popular entre los usuarios";
    }
    
    return "Recomendado para ti";
  }

  private static calculateSearchScore(startup: any, query: string): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Exact name match
    if (startup.name.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Category match
    if (startup.category.toLowerCase().includes(queryLower)) {
      score += 8;
    }

    // Description match
    if (startup.description.toLowerCase().includes(queryLower)) {
      score += 5;
    }

    // Subcategory match
    if (startup.subcategory?.toLowerCase().includes(queryLower)) {
      score += 3;
    }

    return score;
  }
}
