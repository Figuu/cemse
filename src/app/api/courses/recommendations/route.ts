import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "personalized"; // "personalized", "popular", "similar", "trending"
    const courseId = searchParams.get("courseId"); // For similar courses

    let recommendations = [];

    switch (type) {
      case "personalized":
        recommendations = await getPersonalizedRecommendations(session.user.id, limit);
        break;
      case "popular":
        recommendations = await getPopularRecommendations(limit);
        break;
      case "similar":
        if (!courseId) {
          return NextResponse.json({ error: "Course ID is required for similar recommendations" }, { status: 400 });
        }
        recommendations = await getSimilarRecommendations(courseId, session.user.id, limit);
        break;
      case "trending":
        recommendations = await getTrendingRecommendations(limit);
        break;
      case "based_on_skills":
        recommendations = await getSkillBasedRecommendations(session.user.id, limit);
        break;
      case "based_on_enrollment":
        recommendations = await getEnrollmentBasedRecommendations(session.user.id, limit);
        break;
      default:
        recommendations = await getPersonalizedRecommendations(session.user.id, limit);
    }

    return NextResponse.json({
      success: true,
      recommendations,
      type,
      limit,
    });

  } catch (error) {
    console.error("Error fetching course recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

async function getPersonalizedRecommendations(userId: string, limit: number) {
  // Get user profile and preferences
  const userProfile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      skills: true,
      experienceLevel: true,
      educationLevel: true,
      interests: true,
    },
  });

  // Get user's enrolled courses
  const enrolledCourses = await prisma.courseEnrollment.findMany({
    where: { studentId: userId },
    include: {
      course: {
        select: {
          id: true,
          level: true,
          category: true,
          tags: true,
        },
      },
    },
  });

  const enrolledCourseIds = enrolledCourses.map(enrollment => enrollment.course.id);
  const userSkills = (userProfile?.skills as string[]) || [];
  const userExperienceLevel = userProfile?.experienceLevel || "NO_EXPERIENCE";
  const userEducationLevel = userProfile?.educationLevel || "HIGH_SCHOOL";

  // Build recommendation query
  const where: any = {
    id: { notIn: enrolledCourseIds },
    status: "ACTIVE",
  };

  // Get courses with matching skills
  const skillBasedCourses = await prisma.course.findMany({
    where: {
      ...where,
      OR: [
        { tags: { hasSome: userSkills } },
        { title: { contains: userSkills.join(" "), mode: "insensitive" } },
        { description: { contains: userSkills.join(" "), mode: "insensitive" } },
      ],
    },
    include: {
      instructor: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
    take: limit * 2, // Get more to filter later
  });

  // Get courses with similar level
  const levelBasedCourses = await prisma.course.findMany({
    where: {
      ...where,
      level: userExperienceLevel === "NO_EXPERIENCE" ? "BEGINNER" : 
             userExperienceLevel === "ENTRY_LEVEL" ? "BEGINNER" :
             userExperienceLevel === "MID_LEVEL" ? "INTERMEDIATE" : "ADVANCED",
    },
    include: {
      instructor: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
    take: limit * 2,
  });

  // Combine and score recommendations
  const allCourses = [...skillBasedCourses, ...levelBasedCourses];
  const uniqueCourses = allCourses.filter((course, index, self) => 
    index === self.findIndex(c => c.id === course.id)
  );

  // Score courses based on various factors
  const scoredCourses = uniqueCourses.map(course => {
    let score = 0;
    
    // Skill matching score
    const courseTags = (course.tags as string[]) || [];
    const skillMatches = courseTags.filter(tag => userSkills.includes(tag)).length;
    score += skillMatches * 10;
    
    // Level matching score
    if (course.level === userExperienceLevel) score += 5;
    
    // Popularity score
    score += Math.min(course._count.enrollments * 0.1, 5);
    
    // Content richness score
    score += Math.min(course._count.modules * 0.5, 3);
    
    // Title/description keyword matching
    const titleKeywords = course.title.toLowerCase().split(" ");
    const descriptionKeywords = course.description.toLowerCase().split(" ");
    const skillKeywords = userSkills.map(skill => skill.toLowerCase());
    
    const titleMatches = titleKeywords.filter(keyword => 
      skillKeywords.some(skill => keyword.includes(skill))
    ).length;
    const descriptionMatches = descriptionKeywords.filter(keyword => 
      skillKeywords.some(skill => keyword.includes(skill))
    ).length;
    
    score += titleMatches * 2;
    score += descriptionMatches * 1;
    
    return {
      ...course,
      recommendationScore: score,
      recommendationReason: getRecommendationReason(course, userSkills, skillMatches),
    };
  });

  // Sort by score and return top recommendations
  return scoredCourses
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

async function getPopularRecommendations(limit: number) {
  const courses = await prisma.course.findMany({
    where: { status: "ACTIVE" },
    include: {
      instructor: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
    orderBy: {
      enrollments: {
        _count: "desc",
      },
    },
    take: limit,
  });

  return courses.map(course => ({
    ...course,
    recommendationScore: course._count.enrollments,
    recommendationReason: "Popular entre los estudiantes",
  }));
}

async function getSimilarRecommendations(courseId: string, userId: string, limit: number) {
  // Get the target course
  const targetCourse = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      level: true,
      category: true,
      tags: true,
      title: true,
      description: true,
    },
  });

  if (!targetCourse) {
    return [];
  }

  // Get user's enrolled courses to exclude
  const enrolledCourses = await prisma.courseEnrollment.findMany({
    where: { studentId: userId },
    select: { courseId: true },
  });

  const enrolledCourseIds = enrolledCourses.map(enrollment => enrollment.courseId);

  // Find similar courses
  const similarCourses = await prisma.course.findMany({
    where: {
      id: { notIn: [courseId, ...enrolledCourseIds] },
      status: "ACTIVE",
      OR: [
        { level: targetCourse.level },
        { category: targetCourse.category },
        { tags: { hasSome: (targetCourse.tags as string[]) || [] } },
      ],
    },
    include: {
      instructor: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
    take: limit * 2,
  });

  // Score similarity
  const scoredCourses = similarCourses.map(course => {
    let score = 0;
    
    // Level similarity
    if (course.level === targetCourse.level) score += 10;
    
    // Category similarity
    if (course.category === targetCourse.category) score += 8;
    
    // Tag similarity
    const courseTags = (course.tags as string[]) || [];
    const targetTags = (targetCourse.tags as string[]) || [];
    const commonTags = courseTags.filter(tag => targetTags.includes(tag));
    score += commonTags.length * 5;
    
    // Title similarity (simple keyword matching)
    const courseTitleWords = course.title.toLowerCase().split(" ");
    const targetTitleWords = targetCourse.title.toLowerCase().split(" ");
    const commonTitleWords = courseTitleWords.filter(word => 
      targetTitleWords.includes(word) && word.length > 3
    );
    score += commonTitleWords.length * 2;
    
    return {
      ...course,
      recommendationScore: score,
      recommendationReason: "Similar a cursos que te interesan",
    };
  });

  return scoredCourses
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

async function getTrendingRecommendations(limit: number) {
  // Get courses with recent high enrollment activity
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const courses = await prisma.course.findMany({
    where: { 
      status: "ACTIVE",
      enrollments: {
        some: {
          enrolledAt: { gte: thirtyDaysAgo },
        },
      },
    },
    include: {
      instructor: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
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

  // Score by recent enrollment activity
  const scoredCourses = courses.map(course => {
    const recentEnrollments = course.enrollments.length;
    const totalEnrollments = course._count.enrollments;
    const trendScore = recentEnrollments / Math.max(totalEnrollments, 1);
    
    return {
      ...course,
      recommendationScore: recentEnrollments * trendScore,
      recommendationReason: "Tendencia creciente en inscripciones",
    };
  });

  return scoredCourses
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

async function getSkillBasedRecommendations(userId: string, limit: number) {
  const userProfile = await prisma.profile.findUnique({
    where: { userId },
    select: { skills: true },
  });

  const userSkills = (userProfile?.skills as string[]) || [];
  
  if (userSkills.length === 0) {
    return [];
  }

  const courses = await prisma.course.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { tags: { hasSome: userSkills } },
        { title: { contains: userSkills.join(" "), mode: "insensitive" } },
        { description: { contains: userSkills.join(" "), mode: "insensitive" } },
      ],
    },
    include: {
      instructor: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
    take: limit,
  });

  return courses.map(course => {
    const courseTags = (course.tags as string[]) || [];
    const skillMatches = courseTags.filter(tag => userSkills.includes(tag)).length;
    
    return {
      ...course,
      recommendationScore: skillMatches * 10,
      recommendationReason: `Basado en tus habilidades: ${skillMatches} coincidencias`,
    };
  });
}

async function getEnrollmentBasedRecommendations(userId: string, limit: number) {
  // Get courses that students with similar enrollment patterns have taken
  const userEnrollments = await prisma.courseEnrollment.findMany({
    where: { studentId: userId },
    select: { courseId: true },
  });

  if (userEnrollments.length === 0) {
    return [];
  }

  const userCourseIds = userEnrollments.map(enrollment => enrollment.courseId);

  // Find other students who enrolled in similar courses
  const similarStudents = await prisma.courseEnrollment.findMany({
    where: {
      courseId: { in: userCourseIds },
      studentId: { not: userId },
    },
    select: { studentId: true },
    distinct: ['studentId'],
  });

  const similarStudentIds = similarStudents.map(enrollment => enrollment.studentId);

  // Get courses that these similar students enrolled in
  const recommendedCourses = await prisma.courseEnrollment.findMany({
    where: {
      studentId: { in: similarStudentIds },
      courseId: { notIn: userCourseIds },
    },
    include: {
      course: {
        include: {
          instructor: {
            include: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: true,
              modules: true,
            },
          },
        },
      },
    },
    take: limit * 2,
  });

  // Group by course and count enrollments
  const courseCounts = recommendedCourses.reduce((acc, enrollment) => {
    const courseId = enrollment.course.id;
    if (!acc[courseId]) {
      acc[courseId] = {
        course: enrollment.course,
        count: 0,
      };
    }
    acc[courseId].count++;
    return acc;
  }, {} as Record<string, { course: any; count: number }>);

  return Object.values(courseCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ course, count }) => ({
      ...course,
      recommendationScore: count,
      recommendationReason: `Estudiantes con intereses similares también se inscribieron`,
    }));
}

function getRecommendationReason(course: any, userSkills: string[], skillMatches: number): string {
  if (skillMatches > 0) {
    return `Basado en tus habilidades (${skillMatches} coincidencias)`;
  }
  
  if (course._count.enrollments > 100) {
    return "Muy popular entre los estudiantes";
  }
  
  if (course._count.modules > 5) {
    return "Contenido completo y detallado";
  }
  
  return "Recomendado para ti";
}
