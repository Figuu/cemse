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

    // Verify lesson exists and belongs to the course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: true,
      },
    });

    if (!lesson || lesson.module.courseId !== courseId) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Get active quiz for this lesson
    const quiz = await prisma.quiz.findFirst({
      where: {
        lessonId: lessonId,
        isActive: true,
      },
      include: {
        quizAttempts: {
          where: { studentId: session.user.id },
          orderBy: { completedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({
        success: true,
        quiz: null,
        message: "No active quiz found for this lesson"
      });
    }

    // Get latest attempt info
    const latestAttempt = quiz.quizAttempts[0] || null;
    const totalAttempts = await prisma.quizAttempt.count({
      where: {
        quizId: quiz.id,
        studentId: session.user.id,
      },
    });

    // Check if user can take the quiz
    const canRetake = quiz.attempts === 0 || totalAttempts < quiz.attempts;
    const hasPassed = latestAttempt?.passed || false;

    // Parse questions if they're stored as a JSON string
    let questions = quiz.questions;
    console.log("Raw quiz.questions from DB:", typeof questions, questions);

    if (typeof questions === 'string') {
      try {
        questions = JSON.parse(questions);
        console.log("Parsed questions from string:", questions);
      } catch (e) {
        console.error("Error parsing quiz questions:", e);
        questions = [];
      }
    }

    // Ensure questions is an array
    if (!Array.isArray(questions)) {
      console.error("Questions is not an array:", questions);
      questions = [];
    }

    // Add IDs to questions if they don't have them
    questions = questions.map((q: any, index: number) => ({
      ...q,
      id: q.id || `question-${index}`,
    }));

    console.log("Final processed questions:", questions);

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: questions,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        attempts: {
          max: quiz.attempts,
          used: totalAttempts,
          canRetake: canRetake || !hasPassed, // Can always retake if not passed
        },
        latestAttempt: latestAttempt ? {
          score: Number(latestAttempt.score),
          passed: latestAttempt.passed,
          completedAt: latestAttempt.completedAt.toISOString(),
        } : null,
      },
    });

  } catch (error) {
    console.error("Error fetching lesson quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson quiz" },
      { status: 500 }
    );
  }
}
