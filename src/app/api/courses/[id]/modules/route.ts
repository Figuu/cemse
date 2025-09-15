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

    const modules = await prisma.courseModule.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({
      success: true,
      modules: modules.map(module => ({
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
      })),
    });

  } catch (error) {
    console.error("Error fetching course modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch course modules" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get the next order index
    const lastModule = await prisma.courseModule.findFirst({
      where: { courseId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    });

    const orderIndex = (lastModule?.orderIndex || 0) + 1;

    const module = await prisma.courseModule.create({
      data: {
        courseId,
        title,
        description,
        orderIndex,
        estimatedDuration: estimatedDuration || 0,
        isLocked: isLocked || false,
        prerequisites: prerequisites || [],
        hasCertificate: hasCertificate !== false,
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
        lessons: [],
      },
    });

  } catch (error) {
    console.error("Error creating course module:", error);
    return NextResponse.json(
      { error: "Failed to create course module" },
      { status: 500 }
    );
  }
}
