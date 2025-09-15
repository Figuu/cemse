import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, quizId } = await params;

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

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        courseId: courseId,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

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
    console.error("Error fetching course quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch course quiz" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, quizId } = await params;
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
      orderIndex,
      questions = [],
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
    if (passingScore !== undefined) updateData.passingScore = passingScore;
    if (isPublished !== undefined) updateData.isActive = isPublished;
    if (questions.length > 0) updateData.questions = questions;

    // Update quiz
    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: updateData,
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
    console.error("Error updating course quiz:", error);
    return NextResponse.json(
      { error: "Failed to update course quiz" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, quizId } = await params;

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

    // Delete quiz (questions will be deleted automatically due to cascade)
    await prisma.quiz.delete({
      where: { id: quizId }
    });

    return NextResponse.json({
      success: true,
      message: "Quiz deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting course quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete course quiz" },
      { status: 500 }
    );
  }
}
