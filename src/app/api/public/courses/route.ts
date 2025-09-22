import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
      },
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
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Transform courses for frontend
    const transformedCourses = courses.map(course => ({
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
      } : null,
      institution: course.institution ? {
        id: course.institution.id,
        name: course.institution.name,
      } : null,
      institutionName: course.institutionName,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      publishedAt: course.publishedAt?.toISOString(),
      totalModules: course._count.modules,
      totalEnrollments: course._count.enrollments,
    }));

    return NextResponse.json({
      success: true,
      courses: transformedCourses,
    });

  } catch (error) {
    console.error("Error fetching public courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
