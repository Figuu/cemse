import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CertificateService } from "@/lib/certificateService";
import { getLevelLabel } from "@/lib/translations";

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

    // Check enrollment and completion status
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId,
        },
      },
      include: { course: true },
    });

    const isCompleted = !!enrollment && Number(enrollment.progress) >= 100;
    const hasCertification = !!enrollment?.course?.certification;

    // Check existing certificate
    const certificate = await prisma.certificate.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: session.user.id,
        },
      },
    });

    return NextResponse.json({
      hasCertificate: !!certificate?.fileUrl,
      certificateUrl: certificate?.fileUrl || null,
      isCompleted,
      hasCertification,
    });
  } catch (error) {
    console.error("Error getting certificate status:", error);
    return NextResponse.json(
      { error: "Failed to get certificate status" },
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

    // Load course, enrollment, student profile
    const [course, enrollment, student] = await Promise.all([
      prisma.course.findUnique({ where: { id: courseId }, include: { instructor: { include: { user: { include: { profile: true } } } } } }),
      prisma.courseEnrollment.findUnique({
        where: { studentId_courseId: { studentId: session.user.id, courseId } },
      }),
      prisma.profile.findUnique({ where: { userId: session.user.id } }),
    ]);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Validate eligibility
    const isCompleted = !!enrollment && Number(enrollment.progress) >= 100;
    const hasCertification = !!course.certification;

    if (!hasCertification) {
      return NextResponse.json({ error: "Course has no certification" }, { status: 400 });
    }
    if (!isCompleted) {
      return NextResponse.json({ error: "Course not completed" }, { status: 400 });
    }

    // If certificate already exists, return current URL
    const existing = await prisma.certificate.findUnique({
      where: { courseId_studentId: { courseId, studentId: session.user.id } },
    });
    if (existing?.fileUrl) {
      return NextResponse.json({ success: true, certificateUrl: existing.fileUrl });
    }

    // Generate certificate via react-pdf and upload to MinIO
    const certificateData = {
      studentId: session.user.id,
      studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Estudiante',
      courseId,
      courseTitle: course.title,
      instructorName: course.instructor?.user?.profile?.firstName && course.instructor?.user?.profile?.lastName
        ? `${course.instructor.user.profile.firstName} ${course.instructor.user.profile.lastName}`
        : course.instructor?.user?.firstName && course.instructor?.user?.lastName
        ? `${course.instructor.user.firstName} ${course.instructor.user.lastName}`
        : 'Instructor',
      completionDate: (enrollment?.completedAt || new Date()).toISOString(),
      courseDuration: course.duration ? `${Math.floor(course.duration / 60)}h ${course.duration % 60}min` : 'N/A',
      courseLevel: getLevelLabel(course.level),
      institutionName: course.institutionName || 'Emplea Emprende - Centro de Emprendimiento y Desarrollo Sostenible',
    } as const;

    const result = await CertificateService.generateCourseCertificate(certificateData);
    if (!result.success || !result.certificateUrl) {
      return NextResponse.json({ error: result.error || "Failed to generate certificate" }, { status: 500 });
    }

    // Persist certificate record linked to the student
    const created = await prisma.certificate.upsert({
      where: { courseId_studentId: { courseId, studentId: session.user.id } },
      update: { fileUrl: result.certificateUrl },
      create: {
        courseId,
        studentId: session.user.id,
        fileUrl: result.certificateUrl,
        certificateType: 'course',
      },
    });

    return NextResponse.json({ success: true, certificateUrl: created.fileUrl });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}


