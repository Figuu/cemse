import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Check if course exists and is active
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isActive: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 400 });
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId: session.user.id,
        courseId: courseId,
        enrolledAt: new Date(),
        progress: 0,
        isCompleted: false,
      },
    });

    // Update course students count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        studentsCount: {
          increment: 1,
        },
      },
    });

    // Send notification
    try {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "COURSE_ENROLLMENT",
          title: "Inscripción Exitosa",
          message: `Te has inscrito exitosamente en el curso "${course.title}"`,
          data: {
            courseId: courseId,
            courseTitle: course.title,
            enrollmentId: enrollment.id,
          },
        },
      });
    } catch (notificationError) {
      console.error("Error creating enrollment notification:", notificationError);
      // Don't fail the enrollment if notification fails
    }

    return NextResponse.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        courseId: enrollment.courseId,
        progress: Number(enrollment.progress),
        isCompleted: enrollment.isCompleted,
        enrolledAt: enrollment.enrolledAt.toISOString(),
      },
    });

  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Check if enrollment exists
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

    // Delete enrollment
    await prisma.courseEnrollment.delete({
      where: {
        id: enrollment.id,
      },
    });

    // Update course students count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        studentsCount: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully unenrolled from course",
    });

  } catch (error) {
    console.error("Error unenrolling from course:", error);
    return NextResponse.json(
      { error: "Failed to unenroll from course" },
      { status: 500 }
    );
  }
}
