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

    // Verify enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
    }

    // Get course with modules and lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get lesson progress for all lessons
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        studentId: session.user.id,
        lesson: {
          module: {
            courseId: courseId,
          },
        },
      },
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
      },
    });

    // Create progress map
    const progressMap = new Map();
    lessonProgress.forEach(progress => {
      progressMap.set(progress.lessonId, {
        id: progress.id,
        isCompleted: progress.isCompleted,
        completedAt: progress.completedAt?.toISOString(),
        timeSpent: progress.timeSpent,
      });
    });

    // Calculate module progress
    const moduleProgress = course.modules.map(module => {
      const moduleLessons = module.lessons;
      const completedLessons = moduleLessons.filter(lesson => 
        progressMap.get(lesson.id)?.isCompleted
      );
      const moduleProgressPercent = moduleLessons.length > 0 
        ? (completedLessons.length / moduleLessons.length) * 100 
        : 0;

      return {
        id: module.id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        estimatedDuration: module.estimatedDuration,
        isLocked: module.isLocked,
        totalLessons: moduleLessons.length,
        completedLessons: completedLessons.length,
        progress: Math.round(moduleProgressPercent),
        lessons: moduleLessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          orderIndex: lesson.orderIndex,
          duration: lesson.duration,
          isRequired: lesson.isRequired,
          isPreview: lesson.isPreview,
          contentType: lesson.contentType,
          progress: progressMap.get(lesson.id) || {
            id: null,
            isCompleted: false,
            completedAt: null,
            timeSpent: 0,
          },
        })),
      };
    });

    // Calculate overall course progress
    const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const completedLessons = course.modules.reduce((sum, module) => 
      sum + module.lessons.filter(lesson => progressMap.get(lesson.id)?.isCompleted).length, 0
    );
    const courseProgressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Calculate time spent
    const totalTimeSpent = lessonProgress.reduce((sum, progress) => sum + progress.timeSpent, 0);

    return NextResponse.json({
      success: true,
      progress: {
        courseId: course.id,
        courseTitle: course.title,
        enrollment: {
          id: enrollment.id,
          enrolledAt: enrollment.enrolledAt.toISOString(),
          lastAccessedAt: enrollment.lastAccessedAt?.toISOString(),
          progress: Number(enrollment.progress),
          isCompleted: enrollment.isCompleted,
          completedAt: enrollment.completedAt?.toISOString(),
        },
        overall: {
          progress: Math.round(courseProgressPercent),
          totalLessons,
          completedLessons,
          totalTimeSpent,
          estimatedDuration: course.duration,
        },
        modules: moduleProgress,
      },
    });

  } catch (error) {
    console.error("Error fetching course progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch course progress" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { lessonId, isCompleted, timeSpent } = body;

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    }

    // Verify enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
    }

    // Verify lesson belongs to course
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          courseId: courseId,
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found in this course" }, { status: 404 });
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
      where: { id: courseId },
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
              courseId: courseId,
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
                courseId: courseId,
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
