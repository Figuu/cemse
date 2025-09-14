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

    let certificateUrl: string | null = null;

    if (courseId) {
      // Generate course certificate
      certificateUrl = await CertificateService.generateCourseCertificate(studentId, courseId);
    } else if (moduleId) {
      // Generate module certificate
      certificateUrl = await CertificateService.generateModuleCertificate(studentId, moduleId);
    }

    if (!certificateUrl) {
      return NextResponse.json({ 
        error: "Failed to generate certificate. Student may not have completed the course/module." 
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
        certificateUrl: certificate.fileUrl,
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
