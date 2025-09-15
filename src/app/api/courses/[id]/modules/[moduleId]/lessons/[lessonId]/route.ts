import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, moduleId, lessonId } = await params;

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

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId: moduleId,
        module: { courseId: courseId }
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

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
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, moduleId, lessonId } = await params;
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
      orderIndex,
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (contentType !== undefined) updateData.contentType = contentType;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
    if (duration !== undefined) updateData.duration = duration;
    if (isRequired !== undefined) updateData.isRequired = isRequired;
    if (isPreview !== undefined) updateData.isPreview = isPreview;
    if (attachments !== undefined) updateData.attachments = attachments;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, moduleId, lessonId } = await params;

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

    await prisma.lesson.delete({
      where: { id: lessonId }
    });

    return NextResponse.json({
      success: true,
      message: "Lesson deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
