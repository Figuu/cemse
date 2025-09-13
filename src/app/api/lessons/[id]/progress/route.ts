import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lessonId = params.id;

    // Get lesson with course and module info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        progress: {
          where: {
            studentId: session.user.id,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Verify enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
    }

    const progress = lesson.progress[0];

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
        module: {
          id: lesson.module.id,
          title: lesson.module.title,
          courseId: lesson.module.courseId,
        },
        course: {
          id: lesson.module.course.id,
          title: lesson.module.course.title,
        },
      },
      progress: progress ? {
        id: progress.id,
        isCompleted: progress.isCompleted,
        completedAt: progress.completedAt?.toISOString(),
        timeSpent: progress.timeSpent,
      } : {
        id: null,
        isCompleted: false,
        completedAt: null,
        timeSpent: 0,
      },
    });

  } catch (error) {
    console.error("Error fetching lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson progress" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lessonId = params.id;
    const body = await request.json();
    const { isCompleted, timeSpent } = body;

    // Get lesson with course info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Verify enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
    }

    // Update or create lesson progress
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: session.user.id,
          lessonId: lessonId,
        },
      },
      update: {
        isCompleted: isCompleted !== undefined ? isCompleted : undefined,
        completedAt: isCompleted ? new Date() : undefined,
        timeSpent: timeSpent !== undefined ? timeSpent : undefined,
      },
      create: {
        studentId: session.user.id,
        lessonId: lessonId,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
        timeSpent: timeSpent || 0,
      },
    });

    // Recalculate course progress
    const course = await prisma.course.findUnique({
      where: { id: lesson.module.courseId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (course) {
      const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
      const completedLessons = await prisma.lessonProgress.count({
        where: {
          studentId: session.user.id,
          isCompleted: true,
          lesson: {
            module: {
              courseId: lesson.module.courseId,
            },
          },
        },
      });

      const courseProgressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const isCourseCompleted = courseProgressPercent >= 100;

      // Update enrollment progress
      await prisma.courseEnrollment.update({
        where: { id: enrollment.id },
        data: {
          progress: courseProgressPercent,
          isCompleted: isCourseCompleted,
          completedAt: isCourseCompleted ? new Date() : null,
          lastAccessedAt: new Date(),
        },
      });

      // Send completion notification if course is completed
      if (isCourseCompleted && !enrollment.isCompleted) {
        try {
          await prisma.notification.create({
            data: {
              userId: session.user.id,
              type: "COURSE_COMPLETION",
              title: "¡Curso Completado!",
              message: `¡Felicidades! Has completado el curso "${course.title}"`,
              data: {
                courseId: lesson.module.courseId,
                courseTitle: course.title,
                completionDate: new Date().toISOString(),
              },
            },
          });
        } catch (notificationError) {
          console.error("Error creating completion notification:", notificationError);
          // Don't fail the progress update if notification fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      lessonProgress: {
        id: lessonProgress.id,
        lessonId: lessonProgress.lessonId,
        isCompleted: lessonProgress.isCompleted,
        completedAt: lessonProgress.completedAt?.toISOString(),
        timeSpent: lessonProgress.timeSpent,
      },
    });

  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to update lesson progress" },
      { status: 500 }
    );
  }
}
