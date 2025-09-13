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
    const where: any = {
      isActive: isActive,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
        { instructor: { profile: { firstName: { contains: search, mode: "insensitive" } } } },
        { instructor: { profile: { lastName: { contains: search, mode: "insensitive" } } } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    // Build orderBy clause
    const orderBy: any = {};
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
            include: {
              profile: true,
            },
          },
          enrollments: {
            where: {
              studentId: session.user.id,
            },
            select: {
              id: true,
              progress: true,
              isCompleted: true,
              enrolledAt: true,
              lastAccessedAt: true,
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
      const isCompleted = enrollment?.isCompleted || false;
      const lastAccessed = enrollment?.lastAccessedAt?.toISOString();

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
          id: course.instructor.id,
          name: `${course.instructor.profile?.firstName || ''} ${course.instructor.profile?.lastName || ''}`.trim(),
          email: course.instructor.profile?.email || '',
          avatar: course.instructor.profile?.avatarUrl,
        } : null,
        institutionName: course.institutionName,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        publishedAt: course.publishedAt?.toISOString(),
        modules: course.modules.map(module => ({
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
        progress,
        isCompleted,
        totalModules: course._count.modules,
        totalEnrollments: course._count.enrollments,
      };
    });

    // Filter by enrollment status if specified
    let filteredCourses = transformedCourses;
    if (isEnrolled === "true") {
      filteredCourses = transformedCourses.filter(course => course.isEnrolled);
    } else if (isEnrolled === "false") {
      filteredCourses = transformedCourses.filter(course => !course.isEnrolled);
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

    // Only instructors and admins can create courses
    if (!["INSTRUCTOR", "SUPERADMIN"].includes(session.user.role)) {
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
        instructorId: session.user.role === "INSTRUCTOR" ? session.user.id : null,
        institutionName,
        publishedAt: new Date(),
      },
      include: {
        instructor: {
          include: {
            profile: true,
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
          id: course.instructor.id,
          name: `${course.instructor.profile?.firstName || ''} ${course.instructor.profile?.lastName || ''}`.trim(),
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
