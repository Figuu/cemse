import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CertificateService } from "@/lib/certificateService";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, moduleId, studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    if (!courseId && !moduleId) {
      return NextResponse.json({ error: "Either courseId or moduleId is required" }, { status: 400 });
    }

    let certificateResult: any = null;

    if (courseId) {
      // Get course and student data for certificate generation
      const course = await prisma.course.findUnique({
        where: { id: courseId },
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
      });

      const student = await prisma.profile.findUnique({
        where: { userId: studentId },
      });

      if (!course || !student) {
        return NextResponse.json({ 
          error: "Course or student not found" 
        }, { status: 404 });
      }

      // Check if student has completed the course
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: studentId,
            courseId: courseId,
          },
        },
      });

      if (!enrollment || enrollment.progress.toNumber() < 100) {
        return NextResponse.json({ 
          error: "Student has not completed the course" 
        }, { status: 400 });
      }

      // Construct certificate data
      const certificateData = {
        studentId: studentId,
        studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Estudiante',
        courseId: courseId,
        courseTitle: course.title,
        instructorName: course.instructor?.user?.profile?.firstName && course.instructor?.user?.profile?.lastName
          ? `${course.instructor.user.profile.firstName} ${course.instructor.user.profile.lastName}`
          : course.instructor?.user?.firstName && course.instructor?.user?.lastName
          ? `${course.instructor.user.firstName} ${course.instructor.user.lastName}`
          : 'Instructor',
        completionDate: enrollment.completedAt?.toISOString() || new Date().toISOString(),
        courseDuration: `${Math.floor(course.duration / 60)}h ${course.duration % 60}m`,
        courseLevel: course.level,
        institutionName: 'Emplea y Emprende - Centro de Emprendimiento y Desarrollo Sostenible',
      };

      // Generate course certificate
      certificateResult = await CertificateService.generateCourseCertificate(certificateData);
    } else if (moduleId) {
      // For now, module certificates are not implemented
      return NextResponse.json({ 
        error: "Module certificates are not yet implemented" 
      }, { status: 501 });
    }

    if (!certificateResult || !certificateResult.success) {
      return NextResponse.json({ 
        error: certificateResult?.error || "Failed to generate certificate" 
      }, { status: 400 });
    }

    // Get certificate details for response
    let certificate;
    if (courseId) {
      certificate = await prisma.certificate.findFirst({
        where: {
          studentId: studentId,
          courseId: courseId,
        },
        include: {
          course: true,
          student: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { issuedAt: "desc" },
      });
    } else {
      certificate = await prisma.moduleCertificate.findFirst({
        where: {
          studentId: studentId,
          moduleId: moduleId,
        },
        include: {
          module: {
            include: {
              course: true,
            },
          },
          student: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { issuedAt: "desc" },
      });
    }

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        type: courseId ? "course" : "module",
        certificateUrl: certificateResult.certificateUrl,
        issuedAt: certificate.issuedAt.toISOString(),
        student: {
          id: certificate.student.userId,
          name: `${certificate.student.firstName || ''} ${certificate.student.lastName || ''}`.trim(),
        },
        course: courseId ? {
          id: (certificate as any).course.id,
          title: (certificate as any).course.title,
        } : {
          id: (certificate as any).module.course.id,
          title: (certificate as any).module.course.title,
        },
        module: moduleId ? {
          id: (certificate as any).module.id,
          title: (certificate as any).module.title,
        } : null,
      },
    });

  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
