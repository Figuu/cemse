import { prisma } from "@/lib/prisma";

export interface RecommendationResult {
  courseId: string;
  score: number;
  reason: string;
  confidence: number;
}

export interface UserProfile {
  userId: string;
  skills: string[];
  experienceLevel: string;
  educationLevel: string;
  interests: string[];
  enrolledCourses: string[];
  completedCourses: string[];
}

export class RecommendationService {
  /**
   * Get personalized course recommendations for a user
   */
  static async getPersonalizedRecommendations(
    userId: string, 
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    try {
      // Get user profile
      const userProfile = await this.getUserProfile(userId);
      
      // Get various recommendation types
      const [
        skillBasedRecs,
        collaborativeRecs,
        contentBasedRecs,
        trendingRecs
      ] = await Promise.all([
        this.getSkillBasedRecommendations(userProfile, limit),
        this.getCollaborativeRecommendations(userProfile, limit),
        this.getContentBasedRecommendations(userProfile, limit),
        this.getTrendingRecommendations(userProfile, limit),
      ]);

      // Combine and score all recommendations
      const allRecommendations = [
        ...skillBasedRecs.map(rec => ({ ...rec, type: 'skill' })),
        ...collaborativeRecs.map(rec => ({ ...rec, type: 'collaborative' })),
        ...contentBasedRecs.map(rec => ({ ...rec, type: 'content' })),
        ...trendingRecs.map(rec => ({ ...rec, type: 'trending' })),
      ];

      // Group by courseId and combine scores
      const combinedRecs = this.combineRecommendations(allRecommendations);
      
      // Sort by combined score and return top results
      return combinedRecs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error("Error getting personalized recommendations:", error);
      return [];
    }
  }

  /**
   * Get user profile for recommendations
   */
  private static async getUserProfile(userId: string): Promise<UserProfile> {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        skills: true,
        educationLevel: true,
        interests: true,
      },
    });

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { studentId: userId },
      select: {
        courseId: true,
        completedAt: true,
      },
    });

    const enrolledCourses = enrollments.map(e => e.courseId);
    const completedCourses = enrollments
      .filter(e => e.completedAt !== null)
      .map(e => e.courseId);

    return {
      userId,
      skills: (profile?.skills as string[]) || [],
      experienceLevel: "NO_EXPERIENCE", // Default value since field doesn't exist
      educationLevel: profile?.educationLevel || "HIGH_SCHOOL",
      interests: (profile?.interests as string[]) || [],
      enrolledCourses,
      completedCourses,
    };
  }

  /**
   * Get skill-based recommendations
   */
  private static async getSkillBasedRecommendations(
    userProfile: UserProfile, 
    limit: number
  ): Promise<RecommendationResult[]> {
    if (userProfile.skills.length === 0) {
      return [];
    }

    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
        id: { notIn: userProfile.enrolledCourses },
        OR: [
          { tags: { hasSome: userProfile.skills } },
          { title: { contains: userProfile.skills.join(" "), mode: "insensitive" } },
          { description: { contains: userProfile.skills.join(" "), mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        tags: true,
        level: true,
        category: true,
      },
      take: limit * 2,
    });

    return courses.map(course => {
      const courseTags = (course.tags as string[]) || [];
      const skillMatches = courseTags.filter(tag => 
        userProfile.skills.includes(tag)
      ).length;
      
      const titleMatches = this.calculateTextSimilarity(
        course.title, 
        userProfile.skills.join(" ")
      );
      
      const score = (skillMatches * 10) + (titleMatches * 5);
      const confidence = Math.min(skillMatches / userProfile.skills.length, 1);
      
      return {
        courseId: course.id,
        score,
        reason: `Basado en tus habilidades (${skillMatches} coincidencias)`,
        confidence,
      };
    });
  }

  /**
   * Get collaborative filtering recommendations
   */
  private static async getCollaborativeRecommendations(
    userProfile: UserProfile, 
    limit: number
  ): Promise<RecommendationResult[]> {
    if (userProfile.enrolledCourses.length === 0) {
      return [];
    }

    // Find users with similar course preferences
    const similarUsers = await prisma.courseEnrollment.findMany({
      where: {
        courseId: { in: userProfile.enrolledCourses },
        studentId: { not: userProfile.userId },
      },
      select: { studentId: true },
      distinct: ['studentId'],
    });

    if (similarUsers.length === 0) {
      return [];
    }

    const similarUserIds = similarUsers.map(u => u.studentId);

    // Get courses that similar users enrolled in
    const recommendedCourses = await prisma.courseEnrollment.findMany({
      where: {
        studentId: { in: similarUserIds },
        courseId: { notIn: userProfile.enrolledCourses },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            category: true,
          },
        },
      },
    });

    // Group by course and calculate popularity
    const coursePopularity = recommendedCourses.reduce((acc, enrollment) => {
      const courseId = enrollment.course.id;
      if (!acc[courseId]) {
        acc[courseId] = {
          course: enrollment.course,
          count: 0,
          users: new Set(),
        };
      }
      acc[courseId].count++;
      acc[courseId].users.add(enrollment.studentId);
      return acc;
    }, {} as Record<string, { course: { id: string; title: string; level: string; category: string }; count: number; users: Set<string> }>);

    return Object.values(coursePopularity)
      .map(({ course, count }) => {
        const score = count * 5; // Base score from popularity
        const confidence = Math.min(count / similarUsers.length, 1);
        
        return {
          courseId: course.id,
          score,
          reason: `Estudiantes con intereses similares también se inscribieron`,
          confidence,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get content-based recommendations
   */
  private static async getContentBasedRecommendations(
    userProfile: UserProfile, 
    limit: number
  ): Promise<RecommendationResult[]> {
    if (userProfile.completedCourses.length === 0) {
      return [];
    }

    // Get details of completed courses
    const completedCourses = await prisma.course.findMany({
      where: {
        id: { in: userProfile.completedCourses },
      },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        level: true,
        category: true,
      },
    });

    // Find courses with similar content
    const similarCourses = await prisma.course.findMany({
      where: {
        isActive: true,
        id: { notIn: userProfile.enrolledCourses },
        OR: [
          { level: { in: completedCourses.map(c => c.level) } },
          { category: { in: completedCourses.map(c => c.category) } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        level: true,
        category: true,
      },
      take: limit * 2,
    });

    return similarCourses.map(course => {
      let score = 0;
      const reasons: string[] = [];

      // Level similarity
      const levelMatches = completedCourses.filter(c => c.level === course.level).length;
      if (levelMatches > 0) {
        score += levelMatches * 5;
        reasons.push("Mismo nivel de dificultad");
      }

      // Category similarity
      const categoryMatches = completedCourses.filter(c => c.category === course.category).length;
      if (categoryMatches > 0) {
        score += categoryMatches * 8;
        reasons.push("Misma categoría");
      }

      // Tag similarity
      const courseTags = (course.tags as string[]) || [];
      const completedTags = completedCourses.flatMap(c => (c.tags as string[]) || []);
      const commonTags = courseTags.filter(tag => completedTags.includes(tag));
      if (commonTags.length > 0) {
        score += commonTags.length * 3;
        reasons.push(`${commonTags.length} etiquetas similares`);
      }

      // Content similarity (simplified)
      const contentSimilarity = this.calculateContentSimilarity(course, completedCourses);
      score += contentSimilarity * 2;

      const confidence = Math.min(score / 20, 1);

      return {
        courseId: course.id,
        score,
        reason: reasons.length > 0 ? reasons.join(", ") : "Contenido similar",
        confidence,
      };
    }).filter(rec => rec.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get trending recommendations
   */
  private static async getTrendingRecommendations(
    userProfile: UserProfile, 
    limit: number
  ): Promise<RecommendationResult[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingCourses = await prisma.course.findMany({
      where: {
        isActive: true,
        id: { notIn: userProfile.enrolledCourses },
        enrollments: {
          some: {
            enrolledAt: { gte: thirtyDaysAgo },
          },
        },
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
        enrollments: {
          where: {
            enrolledAt: { gte: thirtyDaysAgo },
          },
          select: {
            enrolledAt: true,
          },
        },
      },
      take: limit * 2,
    });

    return trendingCourses.map(course => {
      const recentEnrollments = course.enrollments.length;
      const totalEnrollments = course._count.enrollments;
      const trendScore = recentEnrollments / Math.max(totalEnrollments, 1);
      const score = recentEnrollments * trendScore;
      const confidence = Math.min(trendScore, 1);

      return {
        courseId: course.id,
        score,
        reason: "Tendencia creciente en inscripciones",
        confidence,
      };
    }).sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Combine recommendations from different sources
   */
  private static combineRecommendations(
    recommendations: Array<RecommendationResult & { type: string }>
  ): RecommendationResult[] {
    const combined = new Map<string, RecommendationResult>();

    recommendations.forEach(rec => {
      const existing = combined.get(rec.courseId);
      if (existing) {
        // Weight different types differently
        const weight = this.getRecommendationWeight(rec.type);
        const newScore = existing.score + (rec.score * weight);
        const newConfidence = (existing.confidence + rec.confidence) / 2;
        
        combined.set(rec.courseId, {
          courseId: rec.courseId,
          score: newScore,
          reason: existing.reason, // Keep original reason
          confidence: newConfidence,
        });
      } else {
        combined.set(rec.courseId, {
          courseId: rec.courseId,
          score: rec.score * this.getRecommendationWeight(rec.type),
          reason: rec.reason,
          confidence: rec.confidence,
        });
      }
    });

    return Array.from(combined.values());
  }

  /**
   * Get weight for different recommendation types
   */
  private static getRecommendationWeight(type: string): number {
    switch (type) {
      case 'skill': return 1.2;
      case 'collaborative': return 1.0;
      case 'content': return 0.8;
      case 'trending': return 0.6;
      default: return 1.0;
    }
  }

  /**
   * Calculate text similarity (simplified)
   */
  private static calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => 
      words2.includes(word) && word.length > 3
    );
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  /**
   * Calculate content similarity between courses
   */
  private static calculateContentSimilarity(
    course: { title: string; description: string }, 
    completedCourses: Array<{ title: string; description: string }>
  ): number {
    let totalSimilarity = 0;
    
    completedCourses.forEach(completed => {
      const titleSimilarity = this.calculateTextSimilarity(
        course.title, 
        completed.title
      );
      const descSimilarity = this.calculateTextSimilarity(
        course.description, 
        completed.description
      );
      totalSimilarity += (titleSimilarity + descSimilarity) / 2;
    });
    
    return totalSimilarity / completedCourses.length;
  }

  /**
   * Get course recommendations for a specific course
   */
  static async getSimilarCourses(
    courseId: string, 
    userId: string, 
    limit: number = 5
  ): Promise<RecommendationResult[]> {
    try {
      const targetCourse = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
          title: true,
          description: true,
          tags: true,
          level: true,
          category: true,
        },
      });

      if (!targetCourse) {
        return [];
      }

      // Get user's enrolled courses
      const enrolledCourses = await prisma.courseEnrollment.findMany({
        where: { studentId: userId },
        select: { courseId: true },
      });

      const enrolledCourseIds = enrolledCourses.map(e => e.courseId);

      // Find similar courses
      const similarCourses = await prisma.course.findMany({
        where: {
          id: { notIn: [courseId, ...enrolledCourseIds] },
          isActive: true,
          OR: [
            { level: targetCourse.level },
            { category: targetCourse.category },
            { tags: { hasSome: (targetCourse.tags as string[]) || [] } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          tags: true,
          level: true,
          category: true,
        },
        take: limit * 2,
      });

      return similarCourses.map(course => {
        let score = 0;
        const reasons: string[] = [];

        // Level similarity
        if (course.level === targetCourse.level) {
          score += 10;
          reasons.push("Mismo nivel");
        }

        // Category similarity
        if (course.category === targetCourse.category) {
          score += 8;
          reasons.push("Misma categoría");
        }

        // Tag similarity
        const courseTags = (course.tags as string[]) || [];
        const targetTags = (targetCourse.tags as string[]) || [];
        const commonTags = courseTags.filter(tag => targetTags.includes(tag));
        if (commonTags.length > 0) {
          score += commonTags.length * 5;
          reasons.push(`${commonTags.length} etiquetas similares`);
        }

        // Content similarity
        const titleSimilarity = this.calculateTextSimilarity(
          course.title, 
          targetCourse.title
        );
        const descSimilarity = this.calculateTextSimilarity(
          course.description, 
          targetCourse.description
        );
        score += (titleSimilarity + descSimilarity) * 10;

        return {
          courseId: course.id,
          score,
          reason: reasons.join(", ") || "Contenido similar",
          confidence: Math.min(score / 20, 1),
        };
      }).sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error("Error getting similar courses:", error);
      return [];
    }
  }
}
