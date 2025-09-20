import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, lessonId } = await params;

    // Only apply progression rules for youth users
    if (session.user.role !== "YOUTH") {
      return NextResponse.json({ 
        accessible: true, 
        reason: "Non-youth user" 
      });
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

    // Get the lesson with its module and course info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
            lessons: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
        quizzes: {
          where: { isActive: true },
          include: {
            quizAttempts: {
              where: { studentId: session.user.id },
              orderBy: { completedAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Verify lesson belongs to the course
    if (lesson.module.courseId !== courseId) {
      return NextResponse.json({ error: "Lesson not found in this course" }, { status: 404 });
    }

    // Get all lessons in the course ordered by module and lesson order
    const allLessons = await prisma.lesson.findMany({
      where: {
        module: {
          courseId: courseId,
        },
      },
      include: {
        module: true,
        progress: {
          where: { studentId: session.user.id },
        },
        quizzes: {
          where: { isActive: true },
          include: {
            quizAttempts: {
              where: { studentId: session.user.id },
              orderBy: { completedAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: [
        { module: { orderIndex: "asc" } },
        { orderIndex: "asc" },
      ],
    });

    // Find the current lesson index
    const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);
    
    if (currentLessonIndex === -1) {
      return NextResponse.json({ error: "Lesson not found in course" }, { status: 404 });
    }

    // If it's the first lesson, it's always accessible
    if (currentLessonIndex === 0) {
      return NextResponse.json({ 
        accessible: true, 
        reason: "First lesson" 
      });
    }

    // Check if all previous lessons are completed
    for (let i = 0; i < currentLessonIndex; i++) {
      const previousLesson = allLessons[i];
      const lessonProgress = previousLesson.progress[0];
      
      // Check if lesson is completed
      if (!lessonProgress || !lessonProgress.completed) {
        return NextResponse.json({ 
          accessible: false, 
          reason: "Previous lesson not completed",
          blockingLesson: {
            id: previousLesson.id,
            title: previousLesson.title,
            moduleTitle: previousLesson.module.title,
          }
        });
      }

      // Check if lesson has quiz and if it's passed
      if (previousLesson.quizzes.length > 0) {
        const quiz = previousLesson.quizzes[0];
        const latestAttempt = quiz.quizAttempts[0];
        
        if (!latestAttempt || !latestAttempt.passed) {
          return NextResponse.json({ 
            accessible: false, 
            reason: "Previous lesson quiz not passed",
            blockingLesson: {
              id: previousLesson.id,
              title: previousLesson.title,
              moduleTitle: previousLesson.module.title,
            },
            requiredQuiz: {
              id: quiz.id,
              title: quiz.title,
              passingScore: quiz.passingScore,
              currentScore: latestAttempt ? Number(latestAttempt.score) : 0,
            }
          });
        }
      }
    }

    return NextResponse.json({ 
      accessible: true, 
      reason: "All prerequisites met" 
    });

  } catch (error) {
    console.error("Error checking lesson access:", error);
    return NextResponse.json(
      { error: "Failed to check lesson access" },
      { status: 500 }
    );
  }
}


