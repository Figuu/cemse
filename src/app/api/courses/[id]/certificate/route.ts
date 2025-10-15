import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CertificateService } from "@/lib/certificateService";

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

    // Verify enrollment and completion
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: courseId,
        },
      },
      include: {
        course: {
          include: {
            instructor: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
    }

    // Check if course is completed
    if (enrollment.progress.toNumber() < 100) {
      return NextResponse.json({ 
        error: "Course not completed yet", 
        progress: enrollment.progress.toNumber() 
      }, { status: 400 });
    }

    // Check if course has certification enabled
    if (!enrollment.course.certification) {
      return NextResponse.json({ 
        error: "This course does not offer certification" 
      }, { status: 400 });
    }

    // Check if certificate already exists
    const existingCertificateUrl = await CertificateService.getCertificateUrl(
      courseId, 
      session.user.id
    );

    if (existingCertificateUrl) {
      return NextResponse.json({
        success: true,
        certificateUrl: existingCertificateUrl,
        message: "Certificate already exists",
      });
    }

    // Generate certificate
    const studentName = enrollment.student.firstName && enrollment.student.lastName 
      ? `${enrollment.student.firstName} ${enrollment.student.lastName}`
      : enrollment.student.user?.firstName && enrollment.student.user?.lastName
      ? `${enrollment.student.user.firstName} ${enrollment.student.user.lastName}`
      : session.user.name || 'Estudiante';
      
    const instructorName = enrollment.course.instructor?.user?.profile?.firstName && enrollment.course.instructor?.user?.profile?.lastName
      ? `${enrollment.course.instructor.user.profile.firstName} ${enrollment.course.instructor.user.profile.lastName}`
      : enrollment.course.instructor?.user?.firstName && enrollment.course.instructor?.user?.lastName
      ? `${enrollment.course.instructor.user.firstName} ${enrollment.course.instructor.user.lastName}`
      : 'Instructor';

    const certificateData = {
      studentId: session.user.id,
      studentName: studentName,
      courseId: courseId,
      courseTitle: enrollment.course.title,
      instructorName: instructorName,
      completionDate: enrollment.completedAt?.toISOString() || new Date().toISOString(),
      courseDuration: `${Math.floor(enrollment.course.duration / 60)}h ${enrollment.course.duration % 60}m`,
      courseLevel: enrollment.course.level,
      institutionName: 'Emplea y Emprende - Centro de Emprendimiento y Desarrollo Sostenible',
    };

    const result = await CertificateService.generateCourseCertificate(certificateData);

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || "Failed to generate certificate" 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      certificateUrl: result.certificateUrl,
      message: "Certificate generated successfully",
    });

  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}

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
      include: {
        course: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
    }

    // Check if certificate exists
    const certificateUrl = await CertificateService.getCertificateUrl(
      courseId, 
      session.user.id
    );

    return NextResponse.json({
      hasCertificate: !!certificateUrl,
      certificateUrl: certificateUrl,
      isCompleted: enrollment.progress.toNumber() >= 100,
      hasCertification: enrollment.course.certification,
    });

  } catch (error) {
    console.error("Error checking certificate:", error);
    return NextResponse.json(
      { error: "Failed to check certificate" },
      { status: 500 }
    );
  }
}


