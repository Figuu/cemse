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

    // For now, let's skip the ownership check and just return empty quizzes
    // This will help us isolate the issue
    console.log("Quiz API: Returning empty quizzes for now");
    return NextResponse.json({
      success: true,
      quizzes: [],
    });

  } catch (error) {
    console.error("Error fetching course quizzes:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      courseId: 'unknown'
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch course quizzes",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
      timeLimit,
      passingScore,
      isPublished,
      questions = [],
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId,
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
