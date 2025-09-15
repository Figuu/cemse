import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    console.log("Fetching course with ID:", courseId);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
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
        modules: {
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
    });

    if (!course) {
      console.log("Course not found with ID:", courseId);
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    console.log("Course found:", course.title);

    // Check if user has permission to view this course
    if (session.user.role === "INSTITUTION") {
      const userInstitution = await prisma.institution.findFirst({
        where: { createdBy: session.user.id },
        select: { id: true }
      });
      
      if (!userInstitution || course.institutionId !== userInstitution.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      course: {
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
        modules: course.modules.map((module: any) => ({
          id: module.id,
          title: module.title,
          description: module.description,
          orderIndex: module.orderIndex,
          estimatedDuration: module.estimatedDuration,
          isLocked: module.isLocked,
          lessons: module.lessons.map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            orderIndex: lesson.orderIndex,
            duration: lesson.duration,
            isRequired: lesson.isRequired,
            isPreview: lesson.isPreview,
            contentType: lesson.contentType,
          })),
        })),
        totalModules: course._count.modules,
        totalEnrollments: course._count.enrollments,
      },
    });

  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const body = await request.json();

    // Check if user has permission to edit this course
    if (session.user.role === "INSTITUTION") {
      const userInstitution = await prisma.institution.findFirst({
        where: { createdBy: session.user.id },
        select: { id: true }
      });
      
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { institutionId: true }
      });
      
      if (!userInstitution || !course || course.institutionId !== userInstitution.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    // Generate slug from title if title changed
    let slug = undefined;
    if (title) {
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if slug already exists (excluding current course)
      const existingCourse = await prisma.course.findFirst({
        where: { 
          slug: newSlug,
          id: { not: courseId }
        },
      });

      if (!existingCourse) {
        slug = newSlug;
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (videoPreview !== undefined) updateData.videoPreview = videoPreview;
    if (objectives !== undefined) updateData.objectives = objectives;
    if (prerequisites !== undefined) updateData.prerequisites = prerequisites;
    if (duration !== undefined) updateData.duration = parseInt(duration) || 0;
    if (level !== undefined) updateData.level = level;
    if (category !== undefined) updateData.category = category;
    if (isMandatory !== undefined) updateData.isMandatory = isMandatory;
    if (tags !== undefined) updateData.tags = tags;
    if (certification !== undefined) updateData.certification = certification;
    if (includedMaterials !== undefined) updateData.includedMaterials = includedMaterials;
    if (institutionName !== undefined) updateData.institutionName = institutionName;
    if (slug !== undefined) updateData.slug = slug;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
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
        updatedAt: course.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Check if user has permission to delete this course
    if (session.user.role === "INSTITUTION") {
      const userInstitution = await prisma.institution.findFirst({
        where: { createdBy: session.user.id },
        select: { id: true }
      });
      
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { institutionId: true }
      });
      
      if (!userInstitution || !course || course.institutionId !== userInstitution.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if course has enrollments
    const enrollmentCount = await prisma.courseEnrollment.count({
      where: { courseId }
    });

    if (enrollmentCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete course with active enrollments" },
        { status: 400 }
      );
    }

    // Delete course (cascade will handle related records)
    await prisma.course.delete({
      where: { id: courseId }
    });

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
