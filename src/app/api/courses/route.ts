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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const isEnrolled = searchParams.get("isEnrolled");
    const isActive = searchParams.get("isActive") !== "false"; // Default to true

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: isActive,
    };

    // For institution users, filter by their institution's courses
    if (session.user.role === "INSTITUTION") {
      const userInstitution = await prisma.institution.findFirst({
        where: { createdBy: session.user.id },
        select: { id: true }
      });
      
      if (userInstitution) {
        where.institutionId = userInstitution.id;
      } else {
        // If institution user doesn't have an institution, return empty results
        where.id = "non-existent";
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
        { instructor: { firstName: { contains: search, mode: "insensitive" } } },
        { instructor: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    // Build orderBy clause
    const orderBy: Record<string, string> = {};
    switch (sortBy) {
      case "title":
        orderBy.title = sortOrder;
        break;
      case "rating":
        orderBy.rating = sortOrder;
        break;
      case "studentsCount":
        orderBy.studentsCount = sortOrder;
        break;
      case "duration":
        orderBy.duration = sortOrder;
        break;
      case "createdAt":
      default:
        orderBy.createdAt = sortOrder;
        break;
    }

    // Get courses with enrollment status for the current user
    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          institution: {
            select: {
              id: true,
              name: true,
            },
          },
          enrollments: {
            where: {
              studentId: session.user.id,
            },
            select: {
              id: true,
              progress: true,
              completedAt: true,
              enrolledAt: true,
            },
          },
          modules: {
            select: {
              id: true,
              title: true,
              orderIndex: true,
            },
            orderBy: {
              orderIndex: "asc",
            },
          },
          _count: {
            select: {
              enrollments: true,
              modules: true,
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);


    // Transform courses for frontend
    const transformedCourses = courses.map(course => {
      const enrollment = course.enrollments[0];
      const isEnrolled = !!enrollment;
      const progress = enrollment ? Number(enrollment.progress) : 0;
      const isCompleted = !!enrollment?.completedAt;
      const lastAccessed = null; // lastAccessedAt not available in CourseEnrollment
      
      // Check if user owns this course (for institutions)
      const isOwner = session.user.role === "INSTITUTION";

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        shortDescription: course.shortDescription,
        thumbnail: course.thumbnail,
        videoPreview: course.videoPreview,
        objectives: course.objectives,
        prerequisites: course.prerequisites,
        duration: course.duration,
        level: course.level,
        category: course.category,
        isMandatory: course.isMandatory,
        rating: course.rating ? Number(course.rating) : 0,
        studentsCount: course.studentsCount,
        completionRate: course.completionRate ? Number(course.completionRate) : 0,
        totalLessons: course.totalLessons,
        totalQuizzes: course.totalQuizzes,
        totalResources: course.totalResources,
        tags: course.tags,
        certification: course.certification,
        includedMaterials: course.includedMaterials,
        instructor: course.instructor ? {
          id: course.instructorId || '',
          name: `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim(),
          email: '', // Email not available in this query
          avatar: null, // Avatar not available in this query
        } : null,
        institution: course.institution ? {
          id: course.institution.id,
          name: course.institution.name,
        } : null,
        institutionName: course.institutionName,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        publishedAt: course.publishedAt?.toISOString(),
        modules: course.modules.map((module: any) => ({
          id: module.id,
          title: module.title,
          orderIndex: module.orderIndex,
        })),
        enrollment: isEnrolled ? {
          id: enrollment.id,
          progress,
          isCompleted,
          enrolledAt: enrollment.enrolledAt.toISOString(),
          lastAccessedAt: lastAccessed,
        } : null,
        isEnrolled,
        isOwner,
        progress,
        isCompleted,
        totalModules: course._count.modules,
        totalEnrollments: course._count.enrollments,
      };
    });

    // Filter by enrollment status if specified
    let filteredCourses = transformedCourses;
    if (isEnrolled === "true") {
      if (session.user.role === "INSTITUTION") {
        // For institutions, "enrolled" means all their courses (they already filtered by institution)
        filteredCourses = transformedCourses;
      } else {
        // For students, "enrolled" means courses they're enrolled in
        filteredCourses = transformedCourses.filter(course => course.isEnrolled);
      }
    } else if (isEnrolled === "false") {
      if (session.user.role === "INSTITUTION") {
        // For institutions, "not enrolled" means no courses (they only see their own)
        filteredCourses = [];
      } else {
        // For students, "not enrolled" means courses they're not enrolled in
        filteredCourses = transformedCourses.filter(course => !course.isEnrolled);
      }
    }

    return NextResponse.json({
      success: true,
      courses: filteredCourses,
      pagination: {
        page,
        limit,
        totalCount: filteredCourses.length,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
    });

  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only institutions and admins can create courses
    if (session.user.role !== "INSTITUTION" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      shortDescription,
      thumbnail,
      videoPreview,
      objectives,
      prerequisites,
      duration,
      level,
      category,
      isMandatory,
      tags,
      certification,
      includedMaterials,
      institutionName,
    } = body;

    if (!title || !description || !level || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      return NextResponse.json({ error: "A course with this title already exists" }, { status: 400 });
    }

    // Get institution ID for institution users
    let institutionId = undefined;
    if (session.user.role === "INSTITUTION") {
      // Find the institution associated with this user
      const institution = await prisma.institution.findFirst({
        where: { createdBy: session.user.id },
        select: { id: true }
      });
      
      if (!institution) {
        return NextResponse.json(
          { error: "Institution profile not found. Please create an institution profile first." },
          { status: 400 }
        );
      }
      
      institutionId = institution.id;
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        shortDescription,
        thumbnail,
        videoPreview,
        objectives: objectives || [],
        prerequisites: prerequisites || [],
        duration: parseInt(duration) || 0,
        level,
        category,
        isMandatory: isMandatory || false,
        tags: tags || [],
        certification: certification !== false,
        includedMaterials: includedMaterials || [],
        instructorId: session.user.role === "INSTITUTION" ? session.user.id : undefined,
        institutionId,
        institutionName,
        publishedAt: new Date(),
      },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        level: course.level,
        category: course.category,
        instructor: course.instructor ? {
          id: course.instructorId || '',
          name: `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim(),
        } : null,
        createdAt: course.createdAt.toISOString(),
      },
    });

  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
