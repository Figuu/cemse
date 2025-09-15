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

    const { id: quizId } = await params;

    // Get quiz with attempts
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        quizAttempts: {
          where: {
            studentId: session.user.id,
          },
          orderBy: { completedAt: "desc" },
        },
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        course: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if user is enrolled in the course
    if (quiz.courseId) {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: quiz.courseId,
          },
        },
      });

      if (!enrollment) {
        return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
      }
    }

    if (quiz.lessonId) {
      const enrollment = await prisma.courseEnrollment.findFirst({
        where: {
          studentId: session.user.id,
          course: {
            modules: {
              some: {
                lessons: {
                  some: {
                    id: quiz.lessonId,
                  },
                },
              },
            },
          },
        },
      });

      if (!enrollment) {
        return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
      }
    }

    // Transform attempts
    const transformedAttempts = quiz.quizAttempts.map(attempt => ({
      id: attempt.id,
      score: Number(attempt.score),
      passed: attempt.passed,
      answers: attempt.answers,
      completedAt: attempt.completedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.attempts,
        isActive: quiz.isActive,
        lesson: quiz.lesson ? {
          id: (quiz.lesson as any).id,
          title: (quiz.lesson as any).title,
          module: {
            id: (quiz.lesson as any).module.id,
            title: (quiz.lesson as any).module.title,
            course: {
              id: (quiz.lesson as any).module.course.id,
              title: (quiz.lesson as any).module.course.title,
            },
          },
        } : null,
        course: quiz.course ? {
          id: (quiz.course as any).id,
          title: (quiz.course as any).title,
        } : null,
      },
      attempts: transformedAttempts,
      canAttempt: quiz.attempts === 0 || quiz.quizAttempts.length < quiz.attempts,
      attemptsRemaining: quiz.attempts === 0 ? -1 : Math.max(0, quiz.attempts - quiz.quizAttempts.length),
    });

  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz attempts" },
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

    const { id: quizId } = await params;
    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Answers are required" }, { status: 400 });
    }

    // Get quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        course: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check enrollment
    if (quiz.courseId) {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: quiz.courseId,
          },
        },
      });

      if (!enrollment) {
        return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
      }
    }

    if (quiz.lessonId) {
      const enrollment = await prisma.courseEnrollment.findFirst({
        where: {
          studentId: session.user.id,
          course: {
            modules: {
              some: {
                lessons: {
                  some: {
                    id: quiz.lessonId,
                  },
                },
              },
            },
          },
        },
      });

      if (!enrollment) {
        return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
      }
    }

    // Check attempt limits
    const existingAttempts = await prisma.quizAttempt.count({
      where: {
        studentId: session.user.id,
        quizId: quizId,
      },
    });

    if (quiz.attempts > 0 && existingAttempts >= quiz.attempts) {
      return NextResponse.json({ error: "Maximum attempts reached" }, { status: 400 });
    }

    // Grade the quiz
    const questions = quiz.questions as any[];
    let correctAnswers = 0;
    const totalQuestions = questions.length;

    questions.forEach((question, index) => {
      const questionId = question.id || index.toString();
      const userAnswer = answers[questionId];
      const correctAnswer = question.correctAnswer;

      if (userAnswer === correctAnswer) {
        correctAnswers++;
      }
    });

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passingScore;

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId: session.user.id,
        quizId: quizId,
        answers: answers,
        score: score,
        passed: passed,
      },
    });

    // TODO: Send notification if passed
    // if (passed) {
    //   try {
    //     await prisma.notification.create({
    //       data: {
    //         userId: session.user.id,
    //         type: "QUIZ_PASSED",
    //         title: "¡Cuestionario Aprobado!",
    //         message: `Has aprobado el cuestionario "${quiz.title}" con ${score}%`,
    //         data: {
    //           quizId: quizId,
    //           quizTitle: quiz.title,
    //           score: score,
    //           passed: passed,
    //         },
    //       },
    //     });
    //   } catch (notificationError) {
    //     console.error("Error creating quiz notification:", notificationError);
    //     // Don't fail the quiz attempt if notification fails
    //   }
    // }

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        score: Number(attempt.score),
        passed: attempt.passed,
        answers: attempt.answers,
        completedAt: attempt.completedAt.toISOString(),
      },
      results: {
        correctAnswers,
        totalQuestions,
        score,
        passed,
        passingScore: quiz.passingScore,
      },
    });

  } catch (error) {
    console.error("Error creating quiz attempt:", error);
    return NextResponse.json(
      { error: "Failed to create quiz attempt" },
      { status: 500 }
    );
  }
}
