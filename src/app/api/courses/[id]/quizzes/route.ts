import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("Quiz API: Starting GET request");
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log("Quiz API: Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    console.log("Quiz API: Course ID:", courseId);
    console.log("Quiz API: User role:", session.user.role);

    // Verify course exists first
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, institutionId: true }
    });

    if (!course) {
      console.log("Quiz API: Course not found");
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify course ownership for institution users
    if (session.user.role === "INSTITUTION") {
      const userInstitution = await prisma.institution.findFirst({
        where: { createdBy: session.user.id },
        select: { id: true }
      });
      
      if (!userInstitution || course.institutionId !== userInstitution.id) {
        console.log("Quiz API: Forbidden - user doesn't own course");
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    console.log("Quiz API: Fetching quizzes for course:", courseId);
    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      orderBy: { createdAt: "asc" },
    });

    console.log("Quiz API: Found quizzes:", quizzes.length);
    
    // Safely map quizzes with error handling
    const safeQuizzes = quizzes.map(quiz => {
      try {
        return {
          id: quiz.id,
          title: quiz.title || '',
          description: quiz.description || '',
          orderIndex: 0, // Default order index
          timeLimit: quiz.timeLimit || null,
          passingScore: quiz.passingScore || 70,
          isPublished: quiz.isActive || false,
          questions: Array.isArray(quiz.questions) ? quiz.questions : [],
          courseId: quiz.courseId || courseId,
          lessonId: quiz.lessonId || null,
        };
      } catch (mapError) {
        console.error("Error mapping quiz:", quiz.id, mapError);
        return {
          id: quiz.id,
          title: 'Error loading quiz',
          description: '',
          orderIndex: 0,
          timeLimit: null,
          passingScore: 70,
          isPublished: false,
          questions: [],
          courseId: courseId,
          lessonId: null,
        };
      }
    });

    return NextResponse.json({
      success: true,
      quizzes: safeQuizzes,
    });

  } catch (error) {
    console.error("Error fetching course quizzes:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      courseId: 'unknown'
    });
    
    // Check if it's a Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("Prisma error code:", (error as any).code);
    }
    
    // Return empty array as fallback to prevent frontend crashes
    console.log("Quiz API: Returning empty array as fallback");
    return NextResponse.json({
      success: true,
      quizzes: [],
      error: "Failed to fetch quizzes, returning empty array",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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
    
    console.log("Quiz POST API: Course ID:", courseId);
    console.log("Quiz POST API: Request body:", body);

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
      timeLimit,
      passingScore,
      isPublished,
      questions = [],
      lessonId,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        lessonId: lessonId || null,
        title,
        description,
        timeLimit: timeLimit || null,
        passingScore: passingScore || 70,
        isActive: isPublished || false,
        questions: questions, // Store questions as JSON
      },
    });

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        orderIndex: 0, // Default order index
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        isPublished: quiz.isActive,
        questions: Array.isArray(quiz.questions) ? quiz.questions : [],
        courseId: quiz.courseId,
        lessonId: quiz.lessonId,
      },
    });

  } catch (error) {
    console.error("Error creating course quiz:", error);
    return NextResponse.json(
      { error: "Failed to create course quiz" },
      { status: 500 }
    );
  }
}
