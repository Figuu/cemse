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

    const lessons = await prisma.lesson.findMany({
      where: { 
        moduleId: moduleId,
        module: { courseId: courseId }
      },
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({
      success: true,
      lessons: lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        contentType: lesson.contentType,
        videoUrl: lesson.videoUrl,
        audioUrl: lesson.audioUrl,
        duration: lesson.duration,
        orderIndex: lesson.orderIndex,
        isRequired: lesson.isRequired,
        isPreview: lesson.isPreview,
        attachments: lesson.attachments,
      })),
    });

  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(
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
      content,
      contentType,
      videoUrl,
      audioUrl,
      duration,
      isRequired,
      isPreview,
      attachments,
    } = body;

    console.log("Creating lesson with data:", {
      title,
      contentType,
      videoUrl,
      audioUrl,
      body
    });

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get the next order index
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    });

    const orderIndex = (lastLesson?.orderIndex || 0) + 1;

    const lessonData = {
      moduleId,
      title,
      description,
      content: content || "",
      contentType: contentType || "TEXT",
      videoUrl,
      audioUrl,
      duration: duration || 0,
      orderIndex,
      isRequired: isRequired !== false,
      isPreview: isPreview || false,
      attachments: attachments || {},
    };

    console.log("Creating lesson in database with:", lessonData);

    const lesson = await prisma.lesson.create({
      data: lessonData,
    });

    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        contentType: lesson.contentType,
        videoUrl: lesson.videoUrl,
        audioUrl: lesson.audioUrl,
        duration: lesson.duration,
        orderIndex: lesson.orderIndex,
        isRequired: lesson.isRequired,
        isPreview: lesson.isPreview,
        attachments: lesson.attachments,
      },
    });

  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
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
      id: lessonId,
      title,
      description,
      content,
      contentType,
      videoUrl,
      audioUrl,
      duration,
      isRequired,
      isPreview,
      attachments,
    } = body;

    console.log("Updating lesson with data:", {
      lessonId,
      title,
      contentType,
      videoUrl,
      audioUrl,
      body
    });

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Verify the lesson exists and belongs to the correct module
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { moduleId: true }
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (existingLesson.moduleId !== moduleId) {
      return NextResponse.json({ error: "Lesson does not belong to this module" }, { status: 400 });
    }

    const lessonData = {
      title,
      description,
      content: content || "",
      contentType: contentType || "TEXT",
      videoUrl,
      audioUrl,
      duration: duration || 0,
      isRequired: isRequired !== false,
      isPreview: isPreview || false,
      attachments: attachments || {},
    };

    console.log("Updating lesson in database with:", lessonData);

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: lessonData,
    });

    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        contentType: lesson.contentType,
        videoUrl: lesson.videoUrl,
        audioUrl: lesson.audioUrl,
        duration: lesson.duration,
        orderIndex: lesson.orderIndex,
        isRequired: lesson.isRequired,
        isPreview: lesson.isPreview,
        attachments: lesson.attachments,
      },
    });

  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}
