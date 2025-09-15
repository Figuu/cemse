import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, moduleId } = await params;

    // Verify course ownership for institution users
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
    }

    const module = await prisma.courseModule.findFirst({
      where: {
        id: moduleId,
        courseId: courseId,
      },
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      module: {
        id: module.id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        estimatedDuration: module.estimatedDuration,
        isLocked: module.isLocked,
        prerequisites: module.prerequisites,
        hasCertificate: module.hasCertificate,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          orderIndex: lesson.orderIndex,
          duration: lesson.duration,
          isRequired: lesson.isRequired,
          isPreview: lesson.isPreview,
          contentType: lesson.contentType,
        })),
      },
    });

  } catch (error) {
    console.error("Error fetching course module:", error);
    return NextResponse.json(
      { error: "Failed to fetch course module" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, moduleId } = await params;
    const body = await request.json();

    // Verify course ownership for institution users
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
    }

    const {
      title,
      description,
      estimatedDuration,
      isLocked,
      prerequisites,
      hasCertificate,
      orderIndex,
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
    if (isLocked !== undefined) updateData.isLocked = isLocked;
    if (prerequisites !== undefined) updateData.prerequisites = prerequisites;
    if (hasCertificate !== undefined) updateData.hasCertificate = hasCertificate;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;

    const module = await prisma.courseModule.update({
      where: { id: moduleId },
      data: updateData,
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      module: {
        id: module.id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        estimatedDuration: module.estimatedDuration,
        isLocked: module.isLocked,
        prerequisites: module.prerequisites,
        hasCertificate: module.hasCertificate,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          orderIndex: lesson.orderIndex,
          duration: lesson.duration,
          isRequired: lesson.isRequired,
          isPreview: lesson.isPreview,
          contentType: lesson.contentType,
        })),
      },
    });

  } catch (error) {
    console.error("Error updating course module:", error);
    return NextResponse.json(
      { error: "Failed to update course module" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, moduleId } = await params;

    // Verify course ownership for institution users
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
    }

    // Delete module (cascade will handle related records including lessons and quizzes)
    await prisma.courseModule.delete({
      where: { id: moduleId }
    });

    return NextResponse.json({
      success: true,
      message: "Module deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting course module:", error);
    return NextResponse.json(
      { error: "Failed to delete course module" },
      { status: 500 }
    );
  }
}
